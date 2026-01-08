<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Services\ProfileService;

class CareerService
{
    static function handleCareerWorkflow($input, $webhookUrl, $user_id)
    {
        $profile = ProfileService::getProfile($user_id);

        $response = Http::withToken(env('N8N_WEBHOOK_SECRET'))
            ->timeout(120)
            ->post($webhookUrl, [
                ...$input,
                'profile' => $profile,
            ]);

        return $response->successful() ? $response->json() : null;
    }

    static function resumeGeneration($input, $user_id)
    {
        return self::handleCareerWorkflow($input, 'http://localhost:5678/webhook/Resume_generation', $user_id);
    }

    static function resumeOptimisation($input, $user_id)
    {
        return self::handleCareerWorkflow($input, 'http://localhost:5678/webhook/Resume_optimisation', $user_id);
    }

    static function coverLetterGeneration($input, $user_id)
    {
        return self::handleCareerWorkflow($input, 'http://localhost:5678/webhook/Cover_Letter_generation', $user_id);
    }

    static function coverLetterOptimisation($input, $user_id)
    {
        return self::handleCareerWorkflow($input, 'http://localhost:5678/webhook/Cover_letter_optimisation', $user_id);
    }
}