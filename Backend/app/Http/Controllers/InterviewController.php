<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Interview;
use App\Services\InterviewService;
use App\Http\Controllers\Controller;

class InterviewController extends Controller
{
    function getInterview($id){
        try {
            $interview = InterviewService::getInterview($id);
            return $this->SuccessJSON($interview);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function getInterviews($user_id){
        try {
            $interviews = InterviewService::getInterviews($user_id);
            return $this->SuccessJSON($interviews);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }   

    function deleteInterview ($id){
        try {
            InterviewService::deleteInterview($id);
            return $this->SuccessJSON(['message' => 'Interview deleted successfully']);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
}
