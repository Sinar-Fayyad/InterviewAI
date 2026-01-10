<?php

namespace App\Services;
use App\Models\Education;

class EducationService
{
    static function addEducation($education , $data){

        $education->user_id = $data["user_id"];
        $education->institution_name = $data["institution_name"];
        $education->degree = $data["degree"];
        $education->field_of_study = $data["field_of_study"];
        $education->start_date = $data["start_date"];
        $education->end_date = $data["end_date"];   
        $education->description = $data["description"];
        $education->save();
        return $education;
    }

    static function updateEducation($id, $data){
        $education = Education::find($id);
        $education->institution_name = $data["institution_name"]?$data["institution_name"]:$education->institution_name;
        $education->degree = $data["degree"]?$data["degree"]:$education->degree;
        $education->field_of_study = $data["field_of_study"]?$data["field_of_study"]:$education->field_of_study;
        $education->start_date = $data["start_date"]?$data["start_date"]:$education->start_date;
        $education->end_date = $data["end_date"]?$data["end_date"]:$education->end_date;   
        $education->description = $data["description"]?$data["description"]:$education->description;

        $education->save();
        return $education;
    }

    static function getEducations($user_id){
        return Education::where( 'user_id' , $user_id)->get();
    }

    // static function getEducation($id){
    //     return Education::find($id);
    // }

    static function deleteEducation($id){

        $education = Education::find($id);
        $education->delete();
        return $education;
    }
}
