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

        if (count($interviews) === 0) {
            throw new \Exception('No interviews found for this user', 404);
        }

        $response = Http::withHeaders([
            'X-N8N-KEY' => config('services.n8n.auth_key'),
        ])->timeout(120)->post('http://127.0.0.1:5678/webhook/Dashboard', $interviews);

        if (!$response->successful()) {
            throw new \Exception('Failed to fetch analysis feedback: ' . $response->body(), $response->getStatusCode());
        }
        return $response->json();
    }
}
