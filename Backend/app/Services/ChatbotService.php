<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;

class ChatbotService
{
    static function initializeMemory($user_id)
    {
        if ($user_id) {
            $user_context = UserContextService::build($user_id);
        } else {
            $user_context = [
                'user_info' => null,
                'education' => [],
                'experience' => [],
                'certifications' => [],
                'skills' => [],
                'interviews' => [],
                'applications' => [],
            ];
        }

        try {
            $docs_content = Storage::get('chatbot/website_guide.md');
        } catch (\Exception $e) {
            return null; // Let controller handle error
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])->timeout(120)->post('http://localhost:5678/webhook/Chatbot_memory', [
            'user_context' => $user_context,
            'docs_content' => $docs_content,
        ]);

        return $response->successful() ? $response->json() : null;
    }

    static function sendMessage($request)
    {
        $message = $request->input('message');
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])->timeout(120)->post('http://localhost:5678/webhook/0eba5969-64db-4b26-a127-98869c3f397e/chat', [
            'message' => $message,
        ]);

        return $response->successful() ? $response->json() : null;
    }
}