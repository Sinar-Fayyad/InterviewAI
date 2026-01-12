<?php

namespace App\Services;

use App\Services\ProfileService;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class EmailService
{
    static function generateEmail($userId, $request)
    {
        if ($userId) {
            $profile = ProfileService::getProfile($userId);
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
        ])->timeout(120)->post('http://localhost:5678/webhook/generate_email', [
            'input' => $request->all(),
            'profile' => $profile
        ]);

        return $response->successful() ? $response->json() : null;
    }

    static function replyToEmail($request)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET')
        ])->timeout(120)->post('http://localhost:5678/webhook/ReplyToEmail', $request->all());

        return $response->successful() ? $response->json() : null;
    }

    static function sendEmail($userId, $request)
    {
        $user = User::find($userId);
        if (!$user || !$user->google_refresh_token || !$user->google_email) {
            return null;
        }

        $access_token = self::refreshGoogleToken($user->google_refresh_token);
        if (!$access_token) {
            return null;
        }

        $raw = "To: {$request->to}\r\n
                From: {$user->google_email}\r\n
                Subject: {$request->subject}\r\n
                Content-Type: text/plain; charset=utf-8\r\n\r\n{$request->body}";
                
        $encoded = rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');

        $response = Http::withToken($access_token)
            ->timeout(30)
            ->post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', ['raw' => $encoded]);

        return $response->successful() ? $response->json() : null;
    }

    static function getJobEmails($userId)
    {
        $user = User::find($userId);
        if (!$user || !$user->google_refresh_token) {
            return null;
        }

        $access_token = self::refreshGoogleToken($user->google_refresh_token);
        if (!$access_token) {
            return null;
        }

        $emailsResponse = Http::withToken($access_token)
            ->timeout(60)
            ->get('https://gmail.googleapis.com/gmail/v1/users/me/messages', [
                'maxResults' => 50,
                'q' => 'is:unread subject:(job OR hiring OR interview OR offer OR internship 
                                            OR opportunity OR career OR position OR role OR opening 
                                            OR recruit OR application OR candidate OR resume OR cv OR talent)'
            ]);

        if (!$emailsResponse->successful()) {
            return null;
        }

        return collect($emailsResponse->json('messages', []))
            ->map(function ($msg) use ($access_token) {
                $detail = Http::withToken($access_token)
                    ->get("https://gmail.googleapis.com/gmail/v1/users/me/messages/{$msg['id']}")
                    ->json();

                if (!$detail || !isset($detail['payload'])) {
                    return null;
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
        return $response->successful() ? $response->json('access_token') : null;
    }

    static function disconnectGoogle($user_id){
        $user = User::find($user_id);
        if (!$user) {
            return null;
        }

        $user->google_id = null;
        $user->google_email = null;
        $user->google_token = null;
        $user->google_refresh_token = null;
        $user->save();

        return $user;
    }
}