<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Interview;
use App\Services\InterviewAIService;

class InterviewAIController extends Controller
{
    function startInterview(Request $request)
    {
        $interview = new Interview;
        $interview = InterviewAIService::startInterview($interview, $request->all());

        return $interview ? $this->responseJSON($interview) :
                            $this->responseJSON(null, "Not found", 404);
    }

    function submitAnswer(Request $request)
    {
        $interview = Interview::find($request->input('interview_id'));
        if (!$interview) {
            return $this->responseJSON(null, "Interview not found", 404);
        }

        $result = InterviewAIService::submitAnswer($interview, $request->all());

        return $result ? $this->responseJSON($result) :
                         $this->responseJSON(null, "Not found", 404);
    }

    function endInterview(Request $request)
    {
        $interview = Interview::find($request->input('interview_id'));
        if (!$interview) {
            return $this->responseJSON(null, "Interview not found", 404);
        }

        $result = InterviewAIService::endInterview($interview, $request->all());

        return $result ? $this->responseJSON($result) :
                     $this->responseJSON(null, "Not found", 404);
    }
}