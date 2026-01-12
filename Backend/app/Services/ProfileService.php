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
            'education' => EducationService::getEducations($user_id),
            'experience' => ExperienceService::getExperiences($user_id),
            'certifications' => CertificationService::getCertifications($user_id),
            'skills' => SkillService::getSkills($user_id),
        ];
    }

    static function saveProfile($user_id, $request){
        $user = User::find($user_id);
        if (!$user) {
            return null;
        }

        UserService::updateUser($user_id, $request['user_info']);

        collect($request['education'])->each(fn($edu) => EducationService::addEducation(new Education, $edu));
        collect($request['experience'])->each(fn($exp) => ExperienceService::addExperience(new Experience, $exp));
        collect($request['skills'])->each(fn($skill) => SkillService::addSkill(new Skill, $skill));
        collect($request['certifications'])->each(fn($cert) => CertificationService::addCertification(new Certification, $cert));

        return true;
    }
}