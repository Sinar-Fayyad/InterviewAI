<?php

namespace App\Services;

use App\Models\User;
use App\Services\UserService;
use App\Services\SkillService;
use App\Services\EducationService;
use App\Services\ExperienceService;
use App\Services\CertificationService;

class ProfileService
{
    static function getProfile($user_id)
    {
        if (!User::find($user_id)) {
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

    static function saveProfile($request, $user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        UserService::updateUser($request->input('user_info.0'), $user_id);

        collect($request['education'])->each(fn($edu) => EducationService::addEducation($edu, $user_id));
        collect($request['experience'])->each(fn($exp) => ExperienceService::addExperience($exp, $user_id));
        collect($request['skills'])->each(fn($skill) => SkillService::addSkill($skill, $user_id));
        collect($request['certifications'])->each(fn($cert) => CertificationService::addCertification($cert, $user_id));

    }
}