<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Experience;
use App\Services\ExperienceService;
use App\Http\Controllers\Controller;

class ExperienceController extends Controller
{
    function addExperience(Request $request){

        $experience = new Experience;
        $experience = ExperienceService::addExperience($experience, $request);
        return $this->responseJSON($experience);
    }

    function updateExperience(Request $request, $id){
        $experience = ExperienceService::updateExperience($id, $request);
        return $this->responseJSON($experience);
    }

    function deleteExperience ($id){
        $experience = ExperienceService::deleteExperience($id);
        return $this->responseJSON($experience);
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
