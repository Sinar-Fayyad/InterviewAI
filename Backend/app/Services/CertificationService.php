<?php

namespace App\Services;
use App\Models\Certification;

class CertificationService
{
    static function addCertification($certification , $data){

        $certification->user_id = $data["user_id"];
        $certification->certification_name = $data["certification_name"];
        $certification->organization_name = $data["organization_name"];
        $certification->date_obtained = $data["date_obtained"];  
        $certification->description = $data["description"];
        $certification->save();
        return $certification;
    }

    static function updateCertification($id, $data){
        $certification = Certification::find($id);
        $certification->certification_name = $data["certification_name"]?$data["certification_name"]:$certification->certification_name;
        $certification->organization_name = $data["organization_name"]?$data["organization_name"]:$certification->organization_name;
        $certification->date_obtained = $data["date_obtained"]?$data["date_obtained"]:$certification->date_obtained;  
        $certification->description = $data["description"]?$data["description"]:$certification->description;

        $certification->save();
        return $certification;
    }

    static function getCertifications($user_id){
        return Certification::where( 'user_id' , $user_id)->get();
    }

    static function getCertification($id){
        return Certification::find($id);
    }

    static function deleteCertification($id){

        $certification = Certification::find($id);
        $certification->delete();
        return $certification;
    }
}
