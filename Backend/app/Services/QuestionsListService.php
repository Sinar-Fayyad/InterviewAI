<?php

namespace App\Services;

use App\Models\User;
use App\Models\Question;
use App\Models\QuestionsList;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class QuestionsListService
{
    public static function addQuestionsList($data, $user_id)
    {
        return DB::transaction(function () use ($data, $user_id) {
            $questionsList = new QuestionsList();
            $questionsList->user_id = $user_id;
            $questionsList->company_name = $data["company_name"];
            $questionsList->job_title = $data["job_title"];
            $questionsList->context_summary = $data["context_summary"];
            $questionsList->save();

            $response = Http::withHeaders([
                'X-N8N-KEY' => config('services.n8n.auth_key'),
            ])
                ->timeout(120)
                ->post('http://127.0.0.1:5678/webhook/Questions_Generation', [
                    'profile' => UserService::getUser($user_id),
                    'context_summary' => $data["context_summary"],
                ]);

            if ($response->json(code) !== 200) {
                throw new \Exception('Failed to generate questions: ' . $response->body(), $response->getStatusCode());
            }

            $questions = $response->json('questions');

            if (!is_array($questions)) {
                throw new \Exception('Invalid response format: expected an array of questions', 500);
            }

            $questionsToInsert = collect($questions)->map(function ($item) use ($questionsList) {
                [
                    'questions_list_id' => $questionsList->id,
                    'question' => $item['question'],
                    'answer' => $item['answer'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->all();

            if (empty($questionsToInsert)) {
                throw new \Exception('No questions generated', 500);
            }

            Question::insert($questionsToInsert);

            return $questionsToInsert;
        });
    }

    static function getQuestionsListById($id)
    {
        $questionsList = QuestionsList::find($id);

        if (!$questionsList) {
            throw new \Exception('Questions List not found', 404);
        }

        return $questionsList->load('questions');
    }

    static function getQuestionsLists($user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception('User not found', 404);
        }

        $questionsLists = QuestionsList::where('user_id', $user_id)->with('questions')->get()
                     ->toArray();

        if (!$questionsLists) {
            throw new \Exception('Questions Lists not found', 404);
        }

        return $questionsLists;
    }

    static function deleteQuestionsList($id)
    {
        DB::transaction(function () use ($id) {
            $questionsList = QuestionsList::find($id);

            if (!$questionsList) {
                throw new \Exception('Questions List not found', 404);
            }

            $questionsList->questions()->delete();
            $questionsList->delete();
        });

        return true;
    }
}
