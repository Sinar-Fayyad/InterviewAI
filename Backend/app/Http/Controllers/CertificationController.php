<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Certification;
use App\Http\Controllers\Controller;
use App\Services\CertificationService;

class CertificationController extends Controller
{
    function addCertification(Request $request){

        $certification = new Certification;
        $certification = CertificationService::addCertification($certification, $request);
        return $certifications?  $this->responseJSON($certifications):
                                $this ->responseJSON (null , "Not found", 404);
    }

    function updateCertification(Request $request, $id){
        $certification = CertificationService::updateCertification($id, $request);
        return $certifications?  $this->responseJSON($certifications):
                                $this ->responseJSON (null , "Not found", 404);
    }

    function deleteCertification ($id){
        $certification = CertificationService::deleteCertification($id);
        return $certifications?  $this->responseJSON($certifications):
                                $this ->responseJSON (null , "Not found", 404);
    }
    
    // function getCertification($id){
    //     $certification = CertificationService::getCertification($id);
    //     return $certification?  $this->responseJSON($certification):
    //                     $this ->responseJSON (null , "Not found", 404);
    // }
    
    // function getCertifications($user_id){
    //     $certifications = CertificationService::getCertifications($user_id);
    //     return $certifications?  $this->responseJSON($certifications):
    //                             $this ->responseJSON (null , "Not found", 404);
    // }   

}
