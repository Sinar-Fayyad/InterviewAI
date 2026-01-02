<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Skill;
use App\Services\SkillsService;

class SkillsController extends Controller
{
    function addSkill(Request $request){

        $skill = new Skill;
        $skill = SkillsService::addSkill($skill, $request);
        return $this->responseJSON($skill);
    }

    function updateSkill(Request $request, $id){
        $skill = SkillsService::updateSkill($id, $request);
        return $this->responseJSON($skill);
    }

    function getSkills(){
        $skills = SkillsService::getSkills();
        return $skills?  $this->responseJSON($skills):
                        $this ->responseJSON (null , "Not found", 404);
    }

    function getSkill($id){
        $skill = SkillsService::getSkillById($id);
        return $skill?  $this->responseJSON($skill):
                        $this ->responseJSON (null , "Not found", 404);
    }   

    function deleteSkill ($id){
        $skill = SkillsService::deleteSkill($id);
        return $this->responseJSON($skill);
    }
}
