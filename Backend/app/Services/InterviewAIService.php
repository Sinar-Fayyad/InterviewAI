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

        $profile = UserService::getUser($user_id);

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


        if ($response->json(code) !== 200) {
            throw new \Exception("Failed to start interview". $response->body(), $response->getStatusCode());
        }
         
        if ($response->json()['payload.0.question']) {
            throw new \Exception("Failed to get first question", 500);
        }

        $firstQuestion = $response->json()['payload.0.question'];

        $transcript = self::appendToTranscript("", "question1", $firstQuestion);

        $interviewData = [
            'user_id' => $data["user_id"],
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

        try {
            $answerText = self::transcribeAudio(request()->file('audio'));
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage(), $e->getCode());
        }

        if (!$answerText) {
            throw new \Exception("Failed to transcribe audio", 500);
        }

        $transcript = $interview->transcript;
        $transcript = self::appendToTranscript($transcript, "answer{$currentQNum}", $answerText);
        $transcript = self::appendToTranscript($transcript, "emotion{$currentQNum}", $emotion);

        InterviewService::updateInterview(['transcript' => $transcript], $interviewId);

        $endNow = ($data["end_now"] ?? false) || ($currentQNum >= 10);

        if ($endNow) {
            return [
                "reply" => "That's all for today. Thank you.We will reply to you as soon as possible",
                "finished" => true
            ];
        }

        $parsed = self::parseTranscript($transcript);
        $profile = UserService::getUser($interview->user_id);

        if (!$profile) {
            throw new \Exception("User profile not found", 404);
        }


        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://127.0.0.1:5678/webhook/interview_maker', [
                    'profile' => $profile,
                    'context_summary' => $interview->context_summary,
                    'conversation' => $parsed['conversation'],
                    'emotions' => $parsed['emotions']
                ]);

        if ($response->json(code) !== 200) {
            throw new \Exception("Failed to get next question". $response->body(), $response->getStatusCode());
        }
        if ($response->json()['question']) {
            throw new \Exception("Failed to get next question", 500);
        }

        $nextQuestion = $response->json()['question'];

        $nextQNum = $currentQNum + 1;
        $transcript = self::appendToTranscript($transcript, "question{$nextQNum}", $nextQuestion);

        InterviewService::updateInterview([
            'transcript' => $transcript,
            'question_count' => $nextQNum,
        ], $interviewId);

        return ['reply' => $nextQuestion, 'finished' => false];
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

        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://127.0.0.1:5678/webhook/interview_feedback', [
                    'profile' => $profile,
                    'context_summary' => $interview->context_summary,
                    'conversation' => $parsed['conversation'],
                    'emotions' => $parsed['emotions']
                ]);

        if ($response->json(code) !== 200) {
            throw new \Exception("Failed to generate feedback". $response->body(), $response->getStatusCode());
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

    static function transcribeAudio($audioFile)
    {
        if (!$audioFile)
            throw new \Exception("Audio file is required", 400);

        $interviewId = time();
        $tempAudioPath = "temp/{$interviewId}.wav";
        $audioFile->storeAs('', $tempAudioPath, 'local');
        $audioFullPath = storage_path("app/{$tempAudioPath}");

        $whisperExe = 'C:\ai\whisper\main.exe';
        $model = 'C:\ai\whisper\ggml-base.en.bin';

        if (!file_exists($whisperExe) || !file_exists($audioFullPath)) {
            Storage::delete($tempAudioPath);
            throw new \Exception("Audio processing failed", 500);
        }

        shell_exec("\"{$whisperExe}\" -m \"{$model}\" -f \"{$audioFullPath}\" --output-txt");

        $txtPath = $audioFullPath . '.txt';
        $text = null;
        if (file_exists($txtPath)) {
            $text = trim(file_get_contents($txtPath));
            unlink($txtPath);
        }

        if (!$text) {
            throw new \Exception("Audio transcription failed", 500);
        }

        Storage::delete($tempAudioPath);
        if (file_exists($audioFullPath)) {
            unlink($audioFullPath);
        }

        return $text;
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

        $lines->each(function ($line) use (&$conversation, &$emotions, &$currentQ) {
            $line = trim($line);
            if (preg_match('/^question(\d+):\s*(.*)/i', $line, $m)) {
                if ($currentQ !== null) {
                    $conversation[] = ['question' => $currentQ, 'answer' => ''];
                }
                $currentQ = $m[2];
            } elseif (preg_match('/^answer(\d+):\s*(.*)/i', $line, $m)) {
                if (!empty($conversation)) {
                    $last = array_key_last($conversation);
                    $conversation[$last]['answer'] = $m[2];
                }
            } elseif (preg_match('/^emotion(\d+):\s*(.*)/i', $line, $m)) {
                $emotions[] = $m[2];
            }
        });

        if ($currentQ !== null) {
            $conversation[] = ['question' => $currentQ, 'answer' => ''];
        }

        return compact('conversation', 'emotions');
    }
}