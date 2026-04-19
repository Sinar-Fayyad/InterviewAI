<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;

class ChatbotService
{
    static function initializeMemory($user_id)
    {
        if ($user_id) {

            if (!User::find($user_id)) {
                throw new \Exception("User not found", 404);
            }
            $user_context = UserContextService::build($user_id);

        } else {
            $user_context = [
                'user_info' => [],
                'education' => [],
                'experience' => [],
                'skills' => []
            ]; // Default to an empty array if no user ID is provided (for guest users)
        }

        $collection_name = "chat_" . ($user_id ?? 'guest') . "_" . uniqid();

        $filePath = storage_path('app/private/chatbot/website_guide.md');

        if (!file_exists($filePath)) {
            throw new \Exception('Guidance file not found', 404);
        }

        $response = Http::attach('website_guide', file_get_contents($filePath), basename($filePath))
            ->timeout(120)->post('http://127.0.0.1:5678/webhook/init_memory', [

                    'user_context' => json_encode($user_context),
                    'collection_name' => $collection_name,
                ]);

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to initialize memory", 500);
        }

        return [
            'status' => 'initialized',
            'collection_name' => $collection_name,
            'collection_id' => $response->json('collection_id'),
        ];

    }

    static function clearMemory($collection_name)
    {
        $response = Http::timeout(120)
            ->post('http://127.0.0.1:5678/webhook/Delete_memory', [
                'collection_name' => $collection_name,
            ]);

        if ($response->json('code') == 404) {
            throw new \Exception("Memory is not found", 404);
        }

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to delete memory", 500);
        }
    }
    static function sendMessage($request)
    {
        $response = Http::timeout(60)->post('http://127.0.0.1:5678/webhook/Chatbot', [
            'collection_id' => $request['collection_id'],
            'message' => $request['message'],
            'chat_history' => $request['chat_history'] ?? [], // Frontend sends last 5
        ]);

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to get response", 500);
        }

        return [
            'response' => $response->json('response'),
            'collection_id' => $request['collection_id'],
        ];
    }
}