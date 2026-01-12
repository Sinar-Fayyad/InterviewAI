<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Services\UserService;
use App\Services\InterviewService;

class InterviewAIService
{
    static function startInterview($interview, $data)
    {
        $profile = UserService::getUser($data["user_id"]);
        if (!$profile) return null;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])->timeout(120)->post('http://localhost:5678/webhook/interview_maker', [
            'profile' => $profile,
            'context_summary' => $data["context_summary"],
            'conversation' => [],
            'emotions' => []
        ]);

        if (!$response->successful()) return null;

        $firstQuestion = $response->json()['question'] ?? null;
        if (!$firstQuestion) return null;

        $transcript = self::appendToTranscript("", "question1", $firstQuestion);

        $interviewData = [
            'user_id' => $data["user_id"],
            'company_name' => $data["company_name"],
            'job_title' => $data["job_title"],
            'context_summary' => $data["context_summary"],
            'transcript' => $transcript,
            'question_count' => 1,
        ];

        $saved = InterviewService::addInterview($interview, $interviewData);
        $saved->message = $firstQuestion;
        return $saved;
    }

    static function submitAnswer($interview, $data)
    {
        $interviewId = $interview->id;
        $currentQNum = $interview->question_count;
        $emotion = $data["emotion"] ?? "neutral";

        $answerText = self::transcribeAudio(request()->file('audio'));
        if (!$answerText) return null;

        $transcript = $interview->transcript;
        $transcript = self::appendToTranscript($transcript, "answer{$currentQNum}", $answerText);
        $transcript = self::appendToTranscript($transcript, "emotion{$currentQNum}", $emotion);

        InterviewService::updateInterview($interviewId, ['transcript' => $transcript]);

        $endNow = ($data["end_now"] ?? false) || ($currentQNum >= 10);

        if ($endNow) {
            return ['finished' => true];
        }

        $parsed = self::parseTranscript($transcript);
        $profile = UserService::getUser($interview->user_id);
        if (!$profile) return null;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])->timeout(120)->post('http://localhost:5678/webhook/interview_maker', [
            'profile' => $profile,
            'context_summary' => $interview->context_summary,
            'conversation' => $parsed['conversation'],
            'emotions' => $parsed['emotions']
        ]);

        if (!$response->successful()) return null;

        $nextQuestion = $response->json()['question'] ?? null;
        if (!$nextQuestion) return null;

        $nextQNum = $currentQNum + 1;
        $transcript = self::appendToTranscript($transcript, "question{$nextQNum}", $nextQuestion);

        InterviewService::updateInterview($interviewId, [
            'transcript' => $transcript,
            'question_count' => $nextQNum,
        ]);

        return ['message' => $nextQuestion];
    }

    static function endInterview($interview, $data)
    {
        if (!request()->hasFile('video')) return null;

        $interviewId = $interview->id;
        $interviewTitle = $data["interview_title"] ?? "Interview";

        $videoPath = "videos/interview_{$interviewId}.webm";
        request()->file('video')->storeAs('', $videoPath, 'local');

        $parsed = self::parseTranscript($interview->transcript);
        $profile = UserService::getUser($interview->user_id);
        if (!$profile) return null;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])->timeout(120)->post('http://localhost:5678/webhook/interview_feedback', [
            'profile' => $profile,
            'context_summary' => $interview->context_summary,
            'conversation' => $parsed['conversation'],
            'emotions' => $parsed['emotions']
        ]);

        $feedback = $response->successful() 
            ? ($response->json()['feedback'] ?? "No feedback available.")
            : "Feedback generation failed.";

        InterviewService::updateInterview($interviewId, [
            'interview_title' => $interviewTitle,
            'video_path' => $videoPath,
            'feedback' => $feedback,
        ]);

        return ['feedback' => $feedback];
    }

    static function transcribeAudio($audioFile)
    {
        if (!$audioFile) return null;

        $interviewId = time();
        $tempAudioPath = "temp/{$interviewId}.wav";
        $audioFile->storeAs('', $tempAudioPath, 'local');
        $audioFullPath = storage_path("app/{$tempAudioPath}");

        $whisperExe = 'C:\ai\whisper\main.exe';
        $model = 'C:\ai\whisper\ggml-base.en.bin';

        if (!file_exists($whisperExe) || !file_exists($audioFullPath)) {
            Storage::delete($tempAudioPath);
            return null;
        }

        shell_exec("\"{$whisperExe}\" -m \"{$model}\" -f \"{$audioFullPath}\" --output-txt");

        $txtPath = $audioFullPath . '.txt';
        $text = null;
        if (file_exists($txtPath)) {
            $text = trim(file_get_contents($txtPath));
            unlink($txtPath);
        }

        Storage::delete($tempAudioPath);
        if (file_exists($audioFullPath)) unlink($audioFullPath);

        return $text ?: null;
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