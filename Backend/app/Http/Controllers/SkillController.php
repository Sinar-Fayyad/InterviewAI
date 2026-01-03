<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Skill;
use App\Services\SkillService;
use App\Http\Controllers\Controller;

class SkillController extends Controller
{
    function addSkill(Request $request){

        $skill = new Skill;
        $skill = SkillService::addSkill($skill, $request);
        return $this->responseJSON($skill);
    }

    function updateSkill(Request $request, $id){
        $skill = SkillService::updateSkill($id, $request);
        return $this->responseJSON($skill);
    }

    function getSkills($user_id){
        $skills = SkillService::getSkills($user_id);
        return $skills?  $this->responseJSON($skills):
                        $this ->responseJSON (null , "Not found", 404);
    }   

    function deleteSkill ($id){
        $skill = SkillService::deleteSkill($id);
        return $this->responseJSON($skill);
    }
}
