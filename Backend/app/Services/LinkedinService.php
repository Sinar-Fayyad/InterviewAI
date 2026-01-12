<?php

namespace App\Services;

use App\Models\User;
use App\Services\ProfileService;
use Illuminate\Support\Facades\Http;

class LinkedinService
{
    static function getMessages($userId)
    {
        $user = User::find($userId);
        if (!$user || !$user->linkedin_token || !now()->lt($user->linkedin_expires_at)) {
            return null;
        }

        $myUrn = "urn:li:person:{$user->linkedin_id}";

        $convoResponse = Http::withToken($user->linkedin_token)
            ->timeout(60)
            ->get('https://api.linkedin.com/v2/conversations', [
                'q' => 'participants',
                'participant' => $myUrn,
                'count' => 10
            ]);

        if (!$convoResponse->successful()) {
            return null;
        }

        return collect($convoResponse->json('elements', []))
            ->map(function ($convo) use ($user, $myUrn) {
                $msgResponse = Http::withToken($user->linkedin_token)
                    ->get("https://api.linkedin.com/v2/messages", [
                        'q' => 'conversation',
                        'conversation' => $convo['entityUrn'],
                        'count' => 1,
                        'sortOrder' => 'DESC'
                    ]);

                if (!$msgResponse->successful()) {
                    return null;
                }

                $messages = $msgResponse->json('elements', []);
                if (empty($messages)) {
                    return null;
                }

                $lastMessage = $messages[0];
                if (($lastMessage['createdActor'] ?? '') === $myUrn) {
                    return null;
                }

                return [
                    'from' => 'Recruiter',
                    'content' => $lastMessage['message']['text']['text'] ?? '',
                    'date' => date('c', intval($lastMessage['createdAt']) / 1000),
                    'conversation_urn' => $convo['entityUrn']
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    static function createPost($payload)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])
        ->timeout(120)
        ->post('http://localhost:5678/webhook/LinkedIn_post', $payload);

        return $response->successful() ? $response->json() : null;
    }

    static function createProfile()
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])
        ->timeout(120)
        ->post('http://localhost:5678/webhook/Linkedin_profile', ProfileService::getProfile());

        return $response->successful() ? $response->json() : null;
    }
    
    public static function postToLinkedIn($userId, $request)
    {
        $user = User::find($userId);
        if (!$user || !$user->linkedin_token || !now()->lt($user->linkedin_expires_at)) {
            return null;
        }

        $response = Http::withToken($user->linkedin_token)
            ->timeout(30)
            ->post('https://api.linkedin.com/v2/posts', [
                'author' => "urn:li:person:{$user->linkedin_id}",
                'lifecycleState' => 'PUBLISHED',
                'visibility' => 'PUBLIC',
                'commentary' => $request->text
            ]);

        return $response->successful() ? $response->json() : null;
    }

    static function schedulePost($userInput, $user_id)
    {
        $user = User::find($user_id);
        if (!$user) {
            return null;
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])
        ->post('http://localhost:5678/webhook/Schedule_posts', [
            ...$userInput,
            'linkedin_token' => $user->linkedin_token,
            'linkedin_expires_at' => $user->linkedin_expires_at,
        ]);

        return $response->successful() ? $response->json() : null;
    }

    static function checkExpiry($user_id){
        $user = User::find($user_id);
        if (!$user) {
            return null;
        }

        if (!$user->linkedin_expires_at) {
            return false;
        }

        return now()->greaterThan($user->linkedin_expires_at);
    }

    static function disconnectLinkedin($user_id){
        $user = User::find($user_id);
        if (!$user) {
            return null;
        }

        $user->linkedin_id = null;
        $user->linkedin_token = null;
        $user->linkedin_expires_at = null;
        $user->save();

        return $user;
    }
}