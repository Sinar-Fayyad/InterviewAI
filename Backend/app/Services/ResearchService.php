<?php

namespace App\Services;
use Illuminate\Support\Facades\Http;
use App\Services\InterviewService;
use App\Models\Interview;

class ResearchService
{
    static function Research($payload)
    {
        $result = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
        ])
        ->timeout(120)
        ->post('http://localhost:5678/webhook/Research', $payload);

        return $result->successful() ? $result->json() : null;
    }
}
