<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\CertificationService;
use App\Http\Requests\StoreCertificationRequest;
use App\Http\Requests\UpdateCertificationRequest;

class CertificationController extends Controller
{
    function addCertification(StoreCertificationRequest $request, $user_id)
    {
        try {
            $certification = CertificationService::addCertification($request->validated(), $user_id);
            return $this->SuccessJSON($certification);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() );
        }
    }

    function updateCertification(UpdateCertificationRequest $request, $id)
    {
        try {
            $certification = CertificationService::updateCertification($request->validated(), $id);
            return $this->SuccessJSON($certification);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() );
        }
    }

    function deleteCertification($id)
    {
        try {
            CertificationService::deleteCertification($id);
            return $this->SuccessJSON();
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() );
        }
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
