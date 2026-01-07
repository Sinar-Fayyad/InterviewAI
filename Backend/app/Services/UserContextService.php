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
            ...ProfileService::getFullProfile($user_id),
            'interviews' => InterviewService::getInterview($user_id),
            'applications' => ApplicationService::getApplication($user_id),
        ];
    }
}