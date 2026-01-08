<?php

namespace App\Services;

use App\Models\User;
use App\Services\ProfileService;
use Illuminate\Support\Facades\Http;

class LinkedinService
{
    static function createPost($payload)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])
        ->timeout(120)
        ->post('http://localhost:5678/webhook/LinkedIn', $payload);

        return $response->successful() ? $response->json() : null;
    }

    static function createProfile($userInput)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])
        ->timeout(120)
        ->post('http://localhost:5678/webhook/Linkedin_profile', [
            ...$userInput,
            'profile' => ProfileService::getProfile(),
        ]);

        return $response->successful() ? $response->json() : null;
    }

    static function postToLinkedin($userInput, $user_id)
    {
        $user = User::find($user_id);
        if (!$user) {
            return null;
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])
        ->timeout(120)
        ->post('http://localhost:5678/webhook/post_linkedin', [
            ...$userInput,
            'linkedin_token' => $user->linkedin_token,
            'linkedin_expires_at' => $user->linkedin_expires_at,
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
        ->timeout(120)
        ->post('http://localhost:5678/webhook/Schedule_posts', [
            ...$userInput,
            'linkedin_token' => $user->linkedin_token,
            'linkedin_expires_at' => $user->linkedin_expires_at,
        ]);

        return $response->successful() ? $response->json() : null;
    }
}