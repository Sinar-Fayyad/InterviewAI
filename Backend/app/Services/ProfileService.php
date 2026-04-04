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
        if (!UserService::getUser($user_id)) {
            throw new \Exception("User not found", 404);
        }

        return [
            'user_info' => UserService::getUser($user_id),
            'education' => EducationService::getEducations($user_id),
            'experience' => ExperienceService::getExperiences($user_id),
            'certifications' => CertificationService::getCertifications($user_id),
            'skills' => SkillService::getSkills($user_id),
        ];
    }

    static function saveProfile($user_id, $request)
    {
        if (!UserService::getUser($user_id)) {
            throw new \Exception("User not found", 404);
        }

        UserService::updateUser($user_id, $request['user_info']);

        collect($request['education'])->each(fn($edu) => EducationService::addEducation($edu));
        collect($request['experience'])->each(fn($exp) => ExperienceService::addExperience($exp));
        collect($request['skills'])->each(fn($skill) => SkillService::addSkill( $skill));
        collect($request['certifications'])->each(fn($cert) => CertificationService::addCertification( $cert));

    }
}