<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ChatbotService
{
    static function initializeMemory($user_id)
    {
        $user_context = []; // Default to an empty array if no user ID is provided (for guest users)

        if ($user_id) {

            if (!User::find($user_id)) {
                throw new \Exception("User not found", 404);
            }
            $user_context = UserContextService::build($user_id);

        }
        $collection_name = "chat_" . ($user_id ?? 'guest') . "_" . uniqid();

        $filePath = storage_path('app/private/chatbot/website_guide.md');

        if (!file_exists($filePath)) {
            throw new \Exception('Guidance file not found', 404);
        }


        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])
            ->attach('website_guide', file_get_contents($filePath), basename($filePath))
            ->timeout(120)->post('http://127.0.0.1:5678/webhook/init_memory', [
                    'user_context' => $user_context,
                    'collection_name' => $collection_name,
                ]);

        if (!$response->successful()) {
            throw new \Exception($response->body(), $response->getStatusCode());
        }

        return [
            'is_guest' => !$user_id ? true : false,
            'user_id' => $user_id,
            'status' => 'initialized',
            'collection_name' => $collection_name,
            'collection_id' => $response->json()['collection_id'],
        ];
    }

    static function clearMemory($collection_name)
    {
        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://127.0.0.1:5678/webhook/Delete_memory', [
                    'collection_name' => $collection_name,
                ]);
        if (!$response->successful()) {
            throw new \Exception($response->body(), $response->getStatusCode());
        }

        return [
            'message' => 'memory_cleared',
        ];
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