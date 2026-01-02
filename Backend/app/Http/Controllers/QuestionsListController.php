<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QuestionsList;
use App\Http\Controllers\Controller;
use App\Services\QuestionsListService;

class QuestionsListController extends Controller
{
    function addQuestionsList(Request $request){
        $questionsList = new QuestionsList;
        $questionsList = QuestionsListService::addQuestionsList($questionsList, $request->all());

        return $questionsList? $this->responseJSON($questionsList):
                                $this ->responseJSON (null , "Not found", 404);
    }

    function getQuestionsList($id){
        $questionsList = QuestionsListService::getQuestionsListById($id);
        return $questionsList?  $this->responseJSON($questionsList):
                        $this ->responseJSON (null , "Not found", 404);
    }

    function getQuestionsLists($user_id){
        $questionsLists = QuestionsListService::getQuestionsLists($user_id);
        return $questionsLists?  $this->responseJSON($questionsLists):
                        $this ->responseJSON (null , "Not found", 404);
    }

    function deleteQuestionsList($id){
        $questionsList = QuestionsListService::deleteQuestionsList($id);
        return $questionsList?  $this->responseJSON($questionsList):
                        $this ->responseJSON (null , "Not found", 404);
    }
}

