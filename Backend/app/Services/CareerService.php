<?php

namespace App\Services;

use App\Models\User;
use App\Services\ProfileService;
use Illuminate\Support\Facades\Http;

class CareerService
{
    static function handleCareerWorkflow($input, $webhookUrl, $user_id)
    {
        if(!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        $profile = ProfileService::getProfile($user_id);

        if (!$profile) {
            throw new \Exception("Profile not found for user", 404);
        }

        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])
            ->timeout(120)
            ->post($webhookUrl, [
                ...$input,
                'profile' => $profile,
            ]);

        if (!$response->successful()){
            throw new \Exception("Failet to access career workflow", 500);
        }

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to process career workflow" , 500);
        }

        return $response->json();
    }

    static function resumeGeneration($input,$user_id)
    {
        return self::handleCareerWorkflow($input , 'http://127.0.0.1:5678/webhook/Resume_generation', $user_id);
    }

    static function resumeOptimization($input, $user_id)
    {
        return self::handleCareerWorkflow($input, 'http://127.0.0.1:5678/webhook/Resume_optimization', $user_id);
    }

    static function coverLetterGeneration($input, $user_id)
    {
        return self::handleCareerWorkflow($input, 'http://127.0.0.1:5678/webhook/Cover_Letter_generation', $user_id);
    }

    static function coverLetterOptimization($input, $user_id)
    {
        return self::handleCareerWorkflow($input, 'http://127.0.0.1:5678/webhook/Cover_letter_optimization', $user_id);
    }
}