<?php

namespace App\Services;
use App\Models\User;
use App\Models\Certification;

class CertificationService
{
    static function addCertification($data, $user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        $certification = new Certification;
        $certification->user_id = $user_id;
        $certification->certification_name = $data["certification_name"];
        $certification->organization_name = $data["organization_name"];
        $certification->date_obtained = $data["date_obtained"];

        $certification->save();
        return $certification;
    }

    static function updateCertification($data, $id)
    {
        $certification = Certification::find($id);

        if (!$certification) {
            throw new \Exception("Certification not found", 404);
        }

        $certification->certification_name = $data["certification_name"] ? $data["certification_name"] : $certification->certification_name;
        $certification->organization_name = $data["organization_name"] ? $data["organization_name"] : $certification->organization_name;
        $certification->date_obtained = $data["date_obtained"] ? $data["date_obtained"] : $certification->date_obtained;

        $certification->save();
        return $certification;
    }

    static function getCertifications($user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        return Certification::where('user_id', $user_id)->get();
    }

    // static function getCertification($id){
    //     return Certification::find($id);
    // }

    static function deleteCertification($id)
    {
        $certification = Certification::find($id);

        if (!$certification) {
            throw new \Exception("Certification not found", 404);
        }

        $certification->delete();
        return true; 
    }
}
