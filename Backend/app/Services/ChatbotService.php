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

        do {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
            ])->timeout(120)->post('http://localhost:5678/webhook/Chatbot_memory', [
                        'user_context' => $user_context,
                        'docs_content' => $docs_content,
                    ]);

        } while (!$response->successful()); // Retry until successful

        return $response->json();
    }

    static function sendMessage($request)
    {
        do {
            $message = $request->input('message');
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
            ])->timeout(120)->post('http://localhost:5678/webhook/Chatbot', [
                        'message' => $message,
                    ]);

        } while (!$response->successful()); // Retry until successful

        return $response->json();
    }
}