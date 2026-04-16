<?php

namespace App\Services;

use App\Services\ProfileService;
use App\Services\InterviewService;
use App\Services\ApplicationService;

class UserContextService
{
    static function build($user_id)
    {
        return [
            ...ProfileService::getProfile($user_id),
            'interviews' => InterviewService::getInterviews($user_id),
            'applications' => ApplicationService::getApplications($user_id),
        ];
    }
}