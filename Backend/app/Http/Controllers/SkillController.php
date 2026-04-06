<?php

namespace App\Http\Controllers;

use App\Services\SkillService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\UpdateSkillRequest;

class SkillController extends Controller
{
    function addSkill(StoreSkillRequest $request, $user_id)
    {
        try {
            $skill = SkillService::addSkill($request->validated(), $user_id);
            return $this->SuccessJSON($skill);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
    function updateSkill(UpdateSkillRequest $request, $id)
    {
        try {
            $skill = SkillService::updateSkill($request->validated(), $id);
            return $this->SuccessJSON($skill);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function deleteSkill($id)
    {
        try {
            SkillService::deleteSkill($id);
            return $this->SuccessJSON();
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    // function getSkills($user_id){
    //     $skills = SkillService::getSkills($user_id);
    //     return $skills?  $this->responseJSON($skills):
    //                     $this ->responseJSON (null , "Not found", 404);
    // }   

}
