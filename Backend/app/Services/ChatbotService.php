<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ChatbotService
{
    static function initializeMemory($user_id)
    {
        if ($user_id) {

            if (!User::find($user_id)) {
                throw new \Exception("User not found", 404);
            }
            $user_context = UserContextService::build($user_id);

        } else { // For guest users, we provide an empty profile context. This allows the chatbot to still function and provide general guidance without user-specific data.
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

        $docs_content = Storage::get('chatbot/website_guide.md');

        if (!$docs_content) {
            throw new \Exception("Failed to load documentation content", 500);
        }

        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://127.0.0.1:5678/webhook/Chatbot_memory', [
                    'user_context' => $user_context,
                    'docs_content' => $docs_content,
                ]);

        if (!$response->successful()) {
            throw new \Exception($response->body(), $response->getStatusCode());
        }

        return $response->json();
    }

    static function sendMessage($request)
    {
        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://127.0.0.1:5678/webhook/Chatbot', [
                    'message' => $request['message'],
                ]);

        if (!$response->successful()) {
            throw new \Exception($response->body(), $response->getStatusCode());
        }

        return $response->json();
    }
}