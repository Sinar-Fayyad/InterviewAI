<?php

namespace App\Services;

use App\Services\ProfileService;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class EmailService
{
    public static function generateEmail($userId, $request)
    {
        if ($userId) {
            $profile = ProfileService::getByUserId($userId);
        } else {
            $profile = [
                'user_info' => null,
                'education' => [],
                'experience' => [],
                'certifications' => [],
                'skills' => []
            ];
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET')
        ])->timeout(120)->post('http://localhost:5678/webhook/Email generation', [
            'input' => $request->all(),
            'profile' => $profile
        ]);

        return $response->successful() ? $response->json() : null;
    }

    public static function replyToEmail($request)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET')
        ])->timeout(120)->post('http://localhost:5678/webhook/ReplyToEmail', $request->all());

        return $response->successful() ? $response->json() : null;
    }

    public static function sendEmail($userId, $request)
    {
        $user = User::find($userId);
        if (!$user || !$user->google_refresh_token || !$user->google_email) {
            return null;
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET')
        ])->timeout(120)->post('http://localhost:5678/webhook/send_email', array_merge($request->all(), [
            'google_refresh_token' => $user->google_refresh_token,
            'google_email' => $user->google_email
        ]));

        return $response->successful() ? $response->json() : null;
    }
}