<?php

namespace App\Services;

use App\Services\UserService;
use App\Services\EducationService;
use App\Services\ExperienceService;
use App\Services\CertificationService;
use App\Services\SkillService;

class ProfileService
{
    static function getFullProfile($user_id)
    {
        return [
            'user_info' => UserService::getUser($user_id),
            'education' => EducationService::getEducation($user_id),
            'experience' => ExperienceService::getExperience($user_id),
            'certifications' => CertificationService::getCertification($user_id),
            'skills' => SkillService::getSkill($user_id),
        ];
    }
}