<?php

namespace App\Services;
use App\Models\Skill;

class SkillService
{
    static function addSkill($skill , $data)
    {
        $skill->user_id = $data["user_id"];
        $skill->name = $data["name"];
        $skill->category = $data["category"];
        $skill->proficiency = $data["proficiency"];


        $skill->save();
        return $skill;
    }

    static function updateSkill($id, $data){
        $skill = Skill::find($id);
        $skill->name = $data["name"]?$data["name"]:$skill->name;
        $skill->category = $data["category"]?$data["category"]:$skill->category;
        $skill->proficiency = $data["proficiency"]?$data["proficiency"]:$skill->proficiency;

        $skill->save();
        return $skill;
    }

    static function getSkill($id){
        return Skill::find($id);
    }
    
    static function getSkills($user_id){
        return Skill::where( 'user_id' , $user_id)->get();
    }

    static function deleteSkill($id){

        $skill = Skill::find($id);
        $skill->delete();
        return $skill;
    }
}
