<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Education;
use App\Services\EducationService;
use App\Http\Controllers\Controller;

class EducationController extends Controller
{
    function addEducation(Request $request){

        $education = new Education;
        $education = EducationService::addEducation($education, $request);
        return $this->responseJSON($education);
    }

    function updateEducation(Request $request, $id){
        $education = EducationService::updateEducation($id, $request);
        return $this->responseJSON($education);
    }

    function getEducation($id){
        $education = EducationService::getEducation($id);
        return $education?  $this->responseJSON($education):
                        $this ->responseJSON (null , "Not found", 404);
    }

    function getEducations($user_id){
        $educations = EducationService::getEducations($user_id);
        return $educations?  $this->responseJSON($educations):
                        $this ->responseJSON (null , "Not found", 404);
    }   

    function deleteEducation ($id){
        $education = EducationService::deleteEducation($id);
        return $this->responseJSON($education);
    }
}
