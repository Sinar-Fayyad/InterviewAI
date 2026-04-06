<?php

namespace App\Http\Controllers;

use App\Services\InterviewAIService;
use App\Http\Requests\EndInterviewRequest;
use App\Http\Requests\SubmitAnswerRequest;
use App\Http\Requests\StartInterviewRequest;

class InterviewAIController extends Controller
{
    function startInterview(StartInterviewRequest $request, $user_id)
    {
        try {
            $interview = InterviewAIService::startInterview($request->validated(), $user_id);
            return $this->SuccessJSON($interview);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function submitAnswer(SubmitAnswerRequest $request, $id)
    {
        try {
            $validated = $request->validated();
            $validated['audio'] = $request->file('audio');
            $result = InterviewAIService::submitAnswer($validated, $id);
            return $this->SuccessJSON($result);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function generateFeedback($interview_id)
    {
        try {
            $result = InterviewAIService::generateFeedback($interview_id);
            return $this->SuccessJSON($result);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function endInterview(EndInterviewRequest $request, $interview_id)
    {
        try {
            $validated = $request->validated();
            $validated['video'] = $request->file('video');
            $result = InterviewAIService::endInterview($validated, $interview_id);
            return $this->SuccessJSON($result);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
}