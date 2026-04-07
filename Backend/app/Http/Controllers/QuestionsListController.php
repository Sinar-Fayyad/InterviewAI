<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\QuestionsListService;
use App\Http\Requests\AddQuestionsListRequest;

class QuestionsListController extends Controller
{
function addQuestionsList(AddQuestionsListRequest $request, $user_id)
    {
        try {
            $questionsList = QuestionsListService::addQuestionsList($request->validated(), $user_id);
            return $this->SuccessJSON($questionsList);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function getQuestionsList($id)
    {
        try {
            $questionsList = QuestionsListService::getQuestionsListById($id);
            return $this->SuccessJSON($questionsList);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function getQuestionsLists($user_id)
    {
        try {
            $questionsLists = QuestionsListService::getQuestionsListsByUserId($user_id);
            return $this->SuccessJSON($questionsLists);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function deleteQuestionsList($id)
    {
        try {
            QuestionsListService::deleteQuestionsList($id);
            return $this->SuccessJSON(null, ['message' => 'Questions List deleted successfully']);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
}

