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

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to create LinkedIn profile", 500);
        }

        return $response->json();
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