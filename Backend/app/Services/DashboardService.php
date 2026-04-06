<?php

namespace App\Services;
use App\Models\User;
use App\Services\InterviewService;
use Illuminate\Support\Facades\Http;

class DashboardService
{
    static function analysisFeedback($user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception('User not found', 404);
        }
        $interviews = InterviewService::getInterviews($user_id);

        if (!$interviews) {
            throw new \Exception('No interviews found for this user', 404);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET')
        ])->timeout(120)->post('http://localhost:5678/webhook/Dashboard', $interviews);

        if (!$response->successful()) {
            throw new \Exception('Failed to fetch analysis feedback: ' . $response->body(), $response->getStatusCode());
        }
        return $response->json();
    }
}
