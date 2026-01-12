<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Interview;
use App\Services\InterviewService;
use App\Http\Controllers\Controller;

class InterviewController extends Controller
{
    // function addInterview(Request $request){
    //     $interview = new Interview;
    //     $interview = InterviewService::addInterview($interview, $request);
    //     return $this->responseJSON($interview);
    // }

    function getInterview($id){
        $interview = InterviewService::getInterview($id);
        return $interview?  $this->responseJSON($interview):
                        $this ->responseJSON (null , "Not found", 404);
    }

    function getInterviews($user_id){
        $interviews = InterviewService::getInterviews($user_id);
        return $interviews?  $this->responseJSON($interviews):
                        $this ->responseJSON (null , "Not found", 404);
    }   

    function deleteInterview ($id){
        $interview = InterviewService::deleteInterview($id);
        return $this->responseJSON($interview);
    }
}
