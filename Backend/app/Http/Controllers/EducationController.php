<?php

namespace App\Http\Controllers;

use App\Services\EducationService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEducationRequest;
use App\Http\Requests\UpdateEducationRequest;

class EducationController extends Controller
{
    function addEducation(StoreEducationRequest $request, $user_id)
    {
        try {
            $education = EducationService::addEducation($request->validated(), $user_id);
            return $this->SuccessJSON($education);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
    function updateEducation(UpdateEducationRequest $request, $id)
    {
        try {
            $education = EducationService::updateEducation($request->validated(), $id);
            return $this->SuccessJSON($education);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function deleteEducation($id)
    {
        try {
            EducationService::deleteEducation($id);
            return $this->SuccessJSON();
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }


}
