<?php

namespace App\Services;
use App\Models\User;
use App\Models\Experience;

class ExperienceService
{
    static function addExperience($data, $user_id)
    {

        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        $experience = new Experience;
        $experience->user_id = $user_id;
        $experience->company_name = $data["company_name"];
        $experience->position = $data["position"];
        $experience->start_date = $data["start_date"];
        $experience->end_date = $data["end_date"];
        $experience->description = $data["description"];
        $experience->save();
        return $experience;
    }

    static function updateExperience($data, $id)
    {
        $experience = Experience::find($id);

        if (!$experience) {
            throw new \Exception("Experience not found", 404);
        }
        
        $experience->company_name = $data["company_name"] ? $data["company_name"] : $experience->company_name;
        $experience->position = $data["position"] ? $data["position"] : $experience->position;
        $experience->start_date = $data["start_date"] ? $data["start_date"] : $experience->start_date;
        $experience->end_date = $data["end_date"] ? $data["end_date"] : $experience->end_date;
        $experience->description = $data["description"] ? $data["description"] : $experience->description;

        $experience->save();
        return $experience;
    }

    static function getExperiences($user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        return Experience::where('user_id', $user_id)->get()
                     ->toArray();
    }

    // static function getExperience($id){
    //     return Experience::find($id);
    // }

    static function deleteExperience($id)
    {
        $experience = Experience::find($id);
        $experience->delete();
        return true;
    }
}
