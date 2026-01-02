<?php

namespace App\Services;
use App\Models\Skill;

class SkillsService
{
    static function addSkill($skill , $data)
    {
        $skill->user_id = $data["user_id"];
        $skill->name = $data["name"];
        $skill->category = $data["category"];
        $skill->level = $data["proficiency_level"];


        $skill->save();
        return $skill;
    }

    static function updateSkill($id, $data){
        $skill = Skill::find($id);
        $skill->name = $data["name"];
        $skill->category = $data["category"];
        $skill->level = $data["proficiency_level"];

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
