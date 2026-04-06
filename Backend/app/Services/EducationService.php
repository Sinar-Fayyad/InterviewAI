<?php

namespace App\Services;
use App\Models\Education;
use App\Models\User;

class EducationService
{
    static function addEducation($data, $id)
    {
        if (!User::find($id)) {
            throw new \Exception("User not found", 404);
        }

        $education = new Education;
        $education->user_id = $id;
        $education->institution_name = $data["institution_name"];
        $education->degree = $data["degree"];
        $education->field_of_study = $data["field_of_study"];
        $education->start_date = $data["start_date"];
        $education->end_date = $data["end_date"];
        $education->description = $data["description"];
        $education->save();

        return $education;
    }

    static function updateEducation($data, $id)
    {
        $education = Education::find($id);

        if (!$education) {
            throw new \Exception("Education not found", 404);
        }

        $education->institution_name = $data["institution_name"] ? $data["institution_name"] : $education->institution_name;
        $education->degree = $data["degree"] ? $data["degree"] : $education->degree;
        $education->field_of_study = $data["field_of_study"] ? $data["field_of_study"] : $education->field_of_study;
        $education->start_date = $data["start_date"] ? $data["start_date"] : $education->start_date;
        $education->end_date = $data["end_date"] ? $data["end_date"] : $education->end_date;
        $education->description = $data["description"] ? $data["description"] : $education->description;

        $education->save();
        return $education;
    }

    static function getEducations($id)
    {
        if (!User::find($id)) {
            throw new \Exception("User not found", 404);
        }

        return Education::where('user_id', $id)->get();
    }

    // static function getEducation($id){
    //     return Education::find($id);
    // }

    static function deleteEducation($id)
    {
        if (!User::find($id)) {
            throw new \Exception("User not found", 404);
        }
        $education = Education::find($id);

        if (!$education) {
            throw new \Exception("Education not found", 404);
        }

        $education->delete();
    }
}
