<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Services\ProfileService;

class ContentService
{
    public static function generate($input,$user_id)
    {
        $profile = ProfileService::getProfile($user_id);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET')
        ])->timeout(120)->post('http://localhost:5678/webhook/Questions_Generation', [
            ...$input,
            'profile' => $profile
        ]);

        return $response->successful() ? $response->json() : null;
    }
}