<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    function analysisFeedback($user_id)
    {
        try {
            $feedback = DashboardService::analysisFeedback($user_id);
            return $this->SuccessJSON($feedback);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
                       
    }
}
