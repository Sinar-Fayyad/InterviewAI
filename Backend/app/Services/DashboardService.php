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
    ])->timeout(120)->post('https://n8n-6ixrams.zapto.org/webhook/Dashboard', [
        'interviews' => $interviews  // wrap array in an object key
    ]);

    $body = $response->json();

    if (($body['code'] ?? null) !== 200) {
        throw new \Exception('Failed to fetch analysis feedback: ' . json_encode($body), 500);
    }

    return $body;
}

}
