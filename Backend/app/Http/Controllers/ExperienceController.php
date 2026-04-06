<?php

namespace App\Http\Controllers;

use App\Services\ExperienceService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\UpdateExperienceRequest;

class ExperienceController extends Controller
{
    function addExperience(StoreExperienceRequest $request, $user_id)
    {
        try {
            $experience = ExperienceService::addExperience($request->validated(), $user_id);
            return $this->SuccessJSON($experience);
        } catch (\Exception $e) {
            return $this->ErrorJSON("Failed to add experience.");
        }
    }

    function updateExperience(UpdateExperienceRequest $request, $id)
    {
        try {
            $experience = ExperienceService::updateExperience($request->validated(), $id);
            return $this->SuccessJSON($experience);
        } catch (\Exception $e) {
            return $this->ErrorJSON("Failed to update experience.");
        }
    }

    function deleteExperience($id)
    {
        try {
            ExperienceService::deleteExperience($id);
            return $this->SuccessJSON();
        } catch (\Exception $e) {
            return $this->ErrorJSON("Failed to delete experience.");
        }
    }

    // function getExperience($id){
    //     $experience = ExperienceService::getExperience($id);
    //     return $experience?  $this->responseJSON($experience):
    //                     $this ->responseJSON (null , "Not found", 404);
    // }

    // function getExperiences($user_id){
    //     $experiences = ExperienceService::getExperiences($user_id);
    //     return $experiences?  $this->responseJSON($experiences):
    //                     $this ->responseJSON (null , "Not found", 404);
    // }   

}

