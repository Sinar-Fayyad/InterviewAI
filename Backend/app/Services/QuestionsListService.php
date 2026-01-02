<?php

namespace App\Services;
use App\Models\QuestionsList;
use App\Models\Question;
use Illuminate\Support\Facades\DB;

class QuestionsListService
{
    static function addQuestionsList($questionsList, $data) {
        return DB::transaction(function () use ($questionsList, $data) {

            $questionsList->user_id = $data["user_id"];
            $questionsList->company_name = $data["company_name"];
            $questionsList->job_title = $data["job_title"];
            $questionsList->save();

            $questions = collect($data['output']['interview_session'])->map(function ($item) use ($questionsList) {
                return [
                    'questions_list_id' => $questionsList->id,
                    'question' => $item['question'],
                    'answer'   => $item['answer'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->toArray();

            Question::insert($questions);

            return $questionsList;
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
