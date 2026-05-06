<?php

namespace App\Services;

use App\Models\User;
use App\Models\Interview;
use App\Services\UserService;
use App\Services\InterviewService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class InterviewAIService
{
    static function startInterview($data, $user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        $profile = ProfileService::getProfile($user_id);

        if (!$profile) {
            throw new \Exception("User profile not found", 404);
        }

        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://localhost:5678/webhook/Interview_maker', [
            'profile' => $profile,
            'context_summary' => $data["context_summary"],
            'conversation' => [],
            'emotions' => []
        ]);

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to start interview" . $response->json('error'), 500);
        }

        $firstQuestion = $response->json('payload.0.question') ?? $response->json('question') ?? $response->json('payload.question') ?? null;

        if (!$firstQuestion) {
            throw new \Exception("Failed to get first question", 500);
        }

        $transcript = self::appendToTranscript("", "question1", $firstQuestion);

        $interviewData = [
            'user_id' => $user_id,
            'company_name' => $data["company_name"],
            'job_title' => $data["job_title"],
            'context_summary' => $data["context_summary"],
            'transcript' => $transcript,
            'question_count' => 1,
        ];

        $saved = InterviewService::addInterview($interviewData, $user_id);
        $saved->message = $firstQuestion;
        return $saved;
    }

    static function submitAnswer($data, $id)
    {
        $interview = Interview::find($id);

        if (!$interview) {
            throw new \Exception("Interview not found", 404);
        }

        $interviewId = $id;
        $currentQNum = $interview->question_count;
        $emotion = $data["emotion"] ?? "neutral";

        $answerText = $data["answer_text"] ?? "";

        if (!$answerText && !($data["end_now"] ?? false)) {
            throw new \Exception("No answer text provided", 400);
        }

        $transcript = $interview->transcript;
        $transcript = self::appendToTranscript($transcript, "answer{$currentQNum}", $answerText);
        $transcript = self::appendToTranscript($transcript, "emotion{$currentQNum}", $emotion);

        InterviewService::updateInterview(['transcript' => $transcript], $interviewId);

        $endNow = ($data["end_now"] ?? false) || ($currentQNum >= 10);

        if ($endNow) {
            return [
                "reply" => "That's all for today. Thank you. We will reply to you as soon as possible",
                "finished" => true
            ];
        }

        $parsed = self::parseTranscript($transcript);
        $profile = ProfileService::getProfile($interview->user_id);

        if (!$profile) {
            throw new \Exception("User profile not found", 404);
        }

        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://localhost:5678/webhook/Interview_maker', [
            'profile' => $profile,
            'context_summary' => $interview->context_summary,
            'conversation' => $parsed['conversation'],
            'emotions' => $parsed['emotions']
        ]);

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to get next question" . $response->json('error'), 500);
        }

        $nextQuestion = $response->json()['question'] ?? null;

        if (!$nextQuestion) {
            throw new \Exception("Failed to get next question", 500);
        }

        $nextQNum = $currentQNum + 1;
        $transcript = self::appendToTranscript($transcript, "question{$nextQNum}", $nextQuestion);

        InterviewService::updateInterview([
            'transcript' => $transcript,
            'question_count' => $nextQNum,
        ], $interviewId);

        return ['question' => $nextQuestion, 'finished' => false];
    }
    static function generateFeedback($interview_id)
    {
        $interview = Interview::find($interview_id);

        if (!$interview) {
            throw new \Exception("Interview not found", 404);
        }

        $parsed = self::parseTranscript($interview->transcript);
        $profile = UserService::getUser($interview->user_id);

        if (!$profile) {
            throw new \Exception("User profile not found", 404);
        }

        // Merge conversation + emotions into one array per entry
        $qa_with_emotions = array_map(function ($item, $index) use ($parsed) {
            return [
                'question' => $item['question'],
                'answer'   => $item['answer'],
                'emotion'  => $parsed['emotions'][$index] ?? 'neutral',
            ];
        }, $parsed['conversation'], array_keys($parsed['conversation']));

        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://127.0.0.1:5678/webhook/interview_feedback', [
            'profile'          => $profile,
            'context_summary'  => $interview->context_summary,
            'conversation'     => $qa_with_emotions,   // ← now [{question, answer, emotion}]
        ]);

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to generate feedback: " . $response->json('error'), 500);
        }

        return $response->json();
    }
    static function endInterview($data, $interview_id)
    {
        if (!request()->hasFile('video'))
            throw new \Exception("Interview video is required", 400);

        $interviewTitle = $data["interview_title"] ?? "Interview";
        $feedback = $data["feedback"] ?? null;

        $filename = "interview_{$interview_id}.webm";
        request()->file('video')->storeAs('videos', $filename, 'public');

        $videoPath = "videos/{$filename}";

        InterviewService::updateInterview([
            'interview_title' => $interviewTitle,
            'video_path' => $videoPath,
            'feedback' => $feedback,
        ], $interview_id);
    }

    static function appendToTranscript($transcript, $key, $value)
    {
        $line = "{$key}: " . trim($value);
        return empty($transcript) ? $line : $transcript . "\n" . $line;
    }

    static function parseTranscript($text)
    {
        $lines = collect(explode("\n", $text));
        $conversation = [];
        $emotions = [];
        $currentQ = null;
        $currentA = '';

        $lines->each(function ($line) use (&$conversation, &$emotions, &$currentQ, &$currentA) {
            $line = trim($line);
            if (preg_match('/^question\d+:\s*(.*)/i', $line, $m)) {
                // Save previous Q+A pair before starting a new question
                if ($currentQ !== null) {
                    $conversation[] = ['question' => $currentQ, 'answer' => $currentA];
                }
                $currentQ = $m[1];
                $currentA = '';
            } elseif (preg_match('/^answer\d+:\s*(.*)/i', $line, $m)) {
                $currentA = $m[1];
            } elseif (preg_match('/^emotion\d+:\s*(.*)/i', $line, $m)) {
                $emotions[] = $m[1];  // capture emotion
            }
        });

        if ($currentQ !== null) {
            $conversation[] = ['question' => $currentQ, 'answer' => $currentA];
        }

        return compact('conversation', 'emotions');
    }
}
