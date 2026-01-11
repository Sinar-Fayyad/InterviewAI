<?php

namespace App\Services;
use App\Models\QuestionsList;
use App\Models\Question;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class QuestionsListService
{
    public static function addQuestionsList($questionsList, $data)
    {
        return DB::transaction(function () use ($questionsList, $data) {
            $questionsList->user_id = $data["user_id"];
            $questionsList->company_name = $data["company_name"];
            $questionsList->job_title = $data["job_title"];
            $questionsList->context_summary = $data["context_summary"];
            $questionsList->save();

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('N8N_WEBHOOK_SECRET'),
            ])
            ->timeout(120)
            ->post('http://localhost:5678/webhook/Questions_Generation', [
                'context_summary' => $data["context_summary"],
                'user_info'       => UserService::getUser($data["user_id"]),
            ]);

            if (!$response->successful()) {
                return null;
            }

            $session = $response->json('questions');

            if (!is_array($session)) {
                return null;
            }

            $questionsToInsert = collect($session)->map(function ($item) use ($questionsList) {
                return [
                    'questions_list_id' => $questionsList->id,
                    'question'          => $item['question'],
                    'answer'            => $item['answer'],
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ];
            })->all();

            if (empty($questionsToInsert)) {
                return null;
            }
    
            Question::insert($questionsToInsert);

            return $questionsToInsert;
        });
    }

    static function getQuestionsListById($id) {
        return QuestionsList::with('questions')->find($id);
    }

    static function getQuestionsLists($user_id) {
        return QuestionsList::where('user_id', $user_id)
            ->with('questions')
            ->get();
    }

    static function deleteQuestionsList($id) 
    {
        return DB::transaction(function () use ($id) {
            $questionsList = QuestionsList::find($id);

            if ($questionsList) {
                $questionsList->questions()->delete();
                $questionsList->delete();
            }

            return $questionsList;
        });
    }
}
