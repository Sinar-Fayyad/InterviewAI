<?php

namespace App\Services;
use App\Services\InterviewService;
use Illuminate\Support\Facades\Http;

class DashboardService
{
   static function analysisFeedback($user_id)
   {
       $interviews = InterviewService::getInterviews($user_id);

       $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET')
        ])->timeout(120)->post('http://localhost:5678/webhook/Dashboard', $interviews);

        return $response->successful() ? $response->json() : null;
   }
}
