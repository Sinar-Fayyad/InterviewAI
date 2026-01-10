<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ProfileService;
use App\Services\CareerService;
use App\Http\Controllers\Controller;

class CareerController extends Controller
{
    function resumeGeneration($user_id)
    {
        $data = CareerService::resumeGeneration($user_id);
        return $data ? $this->responseJSON($data) : 
                       $this->responseJSON(null, 'Failed to generate resume', 500);
    }

    function resumeOptimization(Request $request, $user_id)
    {
        $data = CareerService::resumeOptimization($request->all(), $user_id);
        return $data ? $this->responseJSON($data) : 
                       $this->responseJSON(null, 'Failed to optimize resume', 500);
    }

    function coverLetterGeneration(Request $request, $user_id)
    {
        $data = CareerService::coverLetterGeneration($request->all(), $user_id);
        return $data ? $this->responseJSON($data) : 
                       $this->responseJSON(null, 'Failed to generate cover letter', 500);
    }

    function coverLetterOptimization(Request $request, $user_id)
    {
        $data = CareerService::coverLetterOptimization($request->all(), $user_id);
        return $data ? $this->responseJSON($data) :
                       $this->responseJSON(null, 'Failed to optimize cover letter', 500);
    }
}