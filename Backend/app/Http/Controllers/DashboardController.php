<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\DashboardService;

class DashboardController extends Controller
{
    function analysisFeedback($user_id)
    {
        $data = DashboardService::analysisFeedback($user_id);
        return $data ? $this->responseJSON($data) : 
                       $this->responseJSON(null, 'Failed to analyze feedback', 500);
    }
}
