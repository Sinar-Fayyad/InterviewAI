<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ProfileService;
use App\Services\CareerService;
use App\Http\Controllers\Controller;

class CareerController extends Controller
{
    function resumeGeneration(Request $request, $user_id)
    {
        $data = CareerService::resumeGeneration($request->all(), $user_id);
        return $data ? $this->responseJSON($data) : 
                       $this->responseJSON(null, 'Failed to generate resume', 500);
    }

    function resumeOptimisation(Request $request, $user_id)
    {
        $data = CareerService::resumeOptimisation($request->all(), $user_id);
        return $data ? $this->responseJSON($data) : 
                       $this->responseJSON(null, 'Failed to optimise resume', 500);
    }

    function coverLetterGeneration(Request $request, $user_id)
    {
        $data = CareerService::coverLetterGeneration($request->all(), $user_id);
        return $data ? $this->responseJSON($data) : 
                       $this->responseJSON(null, 'Failed to generate cover letter', 500);
    }

    function coverLetterOptimisation(Request $request, $user_id)
    {
        $data = CareerService::coverLetterOptimisation($request->all(), $user_id);
        return $data ? $this->responseJSON($data) :
                       $this->responseJSON(null, 'Failed to optimise cover letter', 500);
    }
}