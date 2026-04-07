<?php

namespace App\Http\Controllers;

use App\Services\CareerService;
use App\Http\Controllers\Controller;
use App\Http\Requests\ResumeGenerationRequest;
use App\Http\Requests\ResumeOptimizationRequest;
use App\Http\Requests\CoverLetterGenerationRequest;
use App\Http\Requests\CoverLetterOptimizationRequest;

class CareerController extends Controller
{
    function resumeGeneration(ResumeGenerationRequest $request, $user_id)
    {
        try {
            $resume = CareerService::resumeGeneration($request->validated(), $user_id);
            return $this->SuccessJSON($resume);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function resumeOptimization(ResumeOptimizationRequest $request, $user_id)
    {
        try {
            $resume = CareerService::resumeOptimization($request->validated(), $user_id);
            return $this->SuccessJSON($resume);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function coverLetterGeneration(CoverLetterGenerationRequest $request, $user_id)
    {
        try {
            $coverLetter = CareerService::coverLetterGeneration($request->validated(), $user_id);
            return $this->SuccessJSON($coverLetter);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function coverLetterOptimization(CoverLetterOptimizationRequest $request, $user_id)
    {
        try {
            $coverLetter = CareerService::coverLetterOptimization($request->validated(), $user_id);
            return $this->SuccessJSON($coverLetter);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
}