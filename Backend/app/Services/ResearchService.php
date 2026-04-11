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
            'X-N8N-KEY' => config('services.n8n.auth_key'),,
        ])
        ->timeout(120)
        ->post('http://127.0.0.1:5678/webhook/Research', $payload);

        if (!$result->successful()) {
            throw new \Exception('Failed to fetch research data: ' . $result->body(), $result->getStatusCode());
        }

        return $result->json();
    }
}
