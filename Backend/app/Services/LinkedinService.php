<?php

namespace App\Services;

use App\Models\User;
use App\Services\ProfileService;
use App\Jobs\PublishLinkedInPost;
use Illuminate\Support\Facades\Http;

class LinkedinService
{
    // static function getMessages($user_id)
    // {
    //     $user = User::find($user_id);

    //     if (!$user) {
    //         throw new \Exception("User not found", 404);
    //     }

    //     if (!$user->linkedin_token || now()->gt($user->linkedin_expires_at)) {
    //         throw new \Exception("LinkedIn token is missing or expired", 401);
    //     }
        
    //     $myUrn = "urn:li:person:{$user->linkedin_id}";

    //     $convoResponse = Http::withToken($user->linkedin_token)
    //         ->timeout(60)
    //         ->get('https://api.linkedin.com/v2/conversations', [
    //             'q' => 'participants',
    //             'participant' => $myUrn,
    //             'count' => 10
    //         ]);

    //     if (!$convoResponse->successful()) {
    //         throw new \Exception("Failed to fetch conversations from LinkedIn: " . $convoResponse->body(), $convoResponse->getStatusCode());
    //     }

    //     return collect($convoResponse->json('elements', []))
    //         ->map(function ($convo) use ($user, $myUrn) {
    //             $msgResponse = Http::withToken($user->linkedin_token)
    //                 ->get("https://api.linkedin.com/v2/messages", [
    //                     'q' => 'conversation',
    //                     'conversation' => $convo['entityUrn'],
    //                     'count' => 1,
    //                     'sortOrder' => 'DESC'
    //                 ]);

    //             if (!$msgResponse->successful()) return null; 

    //             $messages = $msgResponse->json('elements', []);
    //             if (count($messages) === 0) return null; 

    //             $lastMessage = $messages[0];
    //             if (($lastMessage['createdActor'] ?? '') === $myUrn) return null;

    //             return [
    //                 'from' => 'Recruiter',
    //                 'content' => $lastMessage['message']['text']['text'] ?? '',
    //                 'date' => date('c', intval($lastMessage['createdAt']) / 1000),
    //                 'conversation_urn' => $convo['entityUrn']
    //             ];
    //         })
    //         ->filter() // removes nulls
    //         ->values()
    //         ->all();
    // }

    static function createPost($payload)
    {
        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])
            ->timeout(120)
            ->post('http://127.0.0.1:5678/webhook/LinkedIn_post', $payload);

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to create LinkedIn post", 500);
        }

        return $response->json();
    }

    static function createProfile($user_id)
    {
        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])
            ->timeout(120)
            ->post('http://localhost:5678/webhook/Linkedin_profile', ProfileService::getProfile($user_id));

        if ($response->json('code') !== '200') {
            throw new \Exception("Failed to create LinkedIn profile", 500);
        }

        return $response->json();
    }

    public static function postToLinkedIn($request, $user_id)
    {
        $user = User::find($user_id);

        if (!$user) {
            throw new \Exception("User not found", 404);
        }

        if (!$user->linkedin_token || !now()->lt($user->linkedin_expires_at)) {
            throw new \Exception("LinkedIn token is missing or expired", 401);
        }

        $response = Http::withToken($user->linkedin_token)
            ->timeout(30)
            ->post('https://api.linkedin.com/v2/posts', [
                'author' => "urn:li:person:{$user->linkedin_id}",
                'lifecycleState' => 'PUBLISHED',
                'visibility' => 'PUBLIC',
                'commentary' => $request->text
            ]);

        if (!$response->successful()) {
            throw new \Exception("Failed to publish post to LinkedIn: " . $response->body(), $response->getStatusCode());
        }
    }

    static function schedulePost($userInput, $user_id)
    {
        $user = User::find($user_id);
        if (!$user) {
            throw new \Exception("User not found", 404);
        }

        $post = PostService::addPost($userInput, $user_id);
        if (!$post) {
            throw new \Exception("Failed to create post", 500);
        }

        $post = PublishLinkedInPost::dispatch($post)->delay($userInput['scheduled_at']);
        if (!$post) {
            throw new \Exception("Failed to schedule post", 500);
        }
    }

    static function checkExpiry($user_id)
    {
        $user = User::find($user_id);
        if (!$user) {
            throw new \Exception("User not found", 404);
        }

        if (!$user->linkedin_expires_at) {
            return ['is_expired' => false];
        }

        if (now()->greaterThan($user->linkedin_expires_at)) {
            return ['is_expired' => true];
        } else {
            return ['is_expired' => false];
        }
    }

    static function disconnectLinkedin($user_id)
    {
        $user = User::find($user_id);
        if (!$user) {
            throw new \Exception("User not found", 404);
        }

        $user->linkedin_id = null;
        $user->linkedin_token = null;
        $user->linkedin_expires_at = null;
        $user->save();

        return $user;
    }
}

?>