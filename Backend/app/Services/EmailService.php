<?php

namespace App\Services;

use App\Models\User;
use App\Services\ProfileService;
use Illuminate\Support\Facades\Http;

class EmailService
{
    static function generateEmail($request, $user_id = null)
    {
        if ($user_id) {

            if (!User::find($user_id)) {
                throw new \Exception("User not found", 404);
            }

            $profile = ProfileService::getProfile($user_id);

            if (!$profile) {
                throw new \Exception("Profile not found for user", 404);
            }
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
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://127.0.0.1:5678/webhook/generate_email', [
                    'input' => $request,
                    'profile' => $profile
                ]);

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to generate email " , 500);
        }

        return $response->json();
    }

    static function replyToEmail($request)
    {

        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://127.0.0.1:5678/webhook/ReplyToEmail', $request);

        if ($response->json('code') !== 200) {
            throw new \Exception("Failed to generate email reply: " . $response->json('error') , 500);
        }

        return $response->json();
    }

    static function sendEmail($request, $user_id)
    {
        $user = User::find($user_id);

        if (!$user) {
            throw new \Exception("User not found", 404);
        }

        if (!$user->google_refresh_token || !$user->google_email) {
            throw new \Exception("Google account not connected", 400);
        }
        $access_token = self::refreshGoogleToken($user->google_refresh_token);

        if (!$access_token) {
            throw new \Exception("Failed to refresh Google access token", 500);
        }

        $raw = "To: {$request->to}\r\n
                From: {$user->google_email}\r\n
                Subject: {$request->subject}\r\n
                Content-Type: text/plain; charset=utf-8\r\n\r\n{$request->body}";

        $encoded = rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');

        $response = Http::withToken($access_token)
            ->timeout(30)
            ->post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', ['raw' => $encoded]);

        if (!$response->successful()) {
            throw new \Exception("Failed to send email: " . $response->body(), $response->getStatusCode());
        }
    }

    static function getJobEmails($user_id)
    {
        $user = User::find($user_id);
        if (!$user) {
            throw new \Exception("User not found", 404);
        }

        if (!$user->google_refresh_token) {
            throw new \Exception("Google account not connected", 400);
        }

        $access_token = self::refreshGoogleToken($user->google_refresh_token);
        if (!$access_token) {
            throw new \Exception("Failed to refresh Google access token", 500);
        }

        $response = Http::withToken($access_token)
            ->timeout(60)
            ->get('https://gmail.googleapis.com/gmail/v1/users/me/messages', [
                'maxResults' => 50,
                'q' => 'is:unread subject:(job OR hiring OR interview OR offer OR internship 
                                            OR opportunity OR career OR position OR role OR opening 
                                            OR recruit OR application OR candidate OR resume OR cv OR talent)'
            ]);

        if (!$response->successful()) {
            throw new \Exception("Failed to fetch emails: " . $response->body(), $response->getStatusCode());
        }

        return collect($response->json('messages', []))
            ->map(function ($msg) use ($access_token) {
                $detail = Http::withToken($access_token)
                    ->get("https://gmail.googleapis.com/gmail/v1/users/me/messages/{$msg['id']}")
                    ->json();

                if (!$detail || !isset($detail['payload'])) {
                    throw new \Exception("Failed to fetch email details", 500);
                }

                $headers = collect($detail['payload']['headers']);
                return [
                    'from' => $headers->firstWhere('name', 'From')['value'] ?? '',
                    'subject' => $headers->firstWhere('name', 'Subject')['value'] ?? '',
                    'snippet' => $detail['snippet'],
                    'date' => date('c', intval($detail['internalDate']) / 1000),
                    'url' => "https://mail.google.com/mail/u/0/#inbox/{$msg['id']}"
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    static function refreshGoogleToken($refresh_token)
    {
        $response = Http::asForm()->timeout(10)->post('https://oauth2.googleapis.com/token', [
            'client_id' => env('GOOGLE_CLIENT_ID'),
            'client_secret' => env('GOOGLE_CLIENT_SECRET'),
            'refresh_token' => $refresh_token,
            'grant_type' => 'refresh_token'
        ]);
        return $response->json('code') !== 200 ? $response->json('access_token') : null;
    }

    static function disconnectGoogle($user_id)
    {
        $user = User::find($user_id);
        if (!$user) {
            throw new \Exception("User not found", 404);
        }

        $user->google_id = null;
        $user->google_email = null;
        $user->google_token = null;
        $user->google_refresh_token = null;
        $user->save();

        return $user;
    }
}