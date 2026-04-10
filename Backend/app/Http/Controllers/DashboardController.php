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
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
                       
    }
}
