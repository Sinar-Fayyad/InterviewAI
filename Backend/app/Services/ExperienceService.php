<?php

namespace App\Services;
use App\Models\Experience;

class ExperienceService
{
    static function addExperience($experience , $data){

        $experience->user_id = $data["user_id"];
        $experience->company_name = $data["company_name"];
        $experience->position = $data["position"];
        $experience->start_date = $data["start_date"];
        $experience->end_date = $data["end_date"];   
        $experience->description = $data["description"];
        $experience->save();
        return $experience;
    }

    static function updateExperience($id, $data){
        $experience = Experience::find($id);
        $experience->company_name = $data["company_name"]?$data["company_name"]:$experience->company_name;
        $experience->position = $data["position"]?$data["position"]:$experience->position;
        $experience->start_date = $data["start_date"]?$data["start_date"]:$experience->start_date;
        $experience->end_date = $data["end_date"]?$data["end_date"]:$experience->end_date;   
        $experience->description = $data["description"]?$data["description"]:$experience->description;

        $experience->save();
        return $experience;
    }

    static function getExperiences($user_id){
        return Experience::where( 'user_id' , $user_id)->get();
    }

    static function getExperience($id){
        return Experience::find($id);
    }

    static function deleteExperience($id){

        $experience = Experience::find($id);
        $experience->delete();
        return $experience;
    }
}
