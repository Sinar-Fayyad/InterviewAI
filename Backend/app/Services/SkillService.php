<?php

namespace App\Services;
use App\Models\Skill;
use App\Models\User;

class SkillService
{
    static function addSkill($data, $user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);     
        }

        $skill = new Skill;
        $skill->user_id = $user_id;
        $skill->name = $data["name"];
        $skill->category = $data["category"];
        $skill->proficiency = $data["proficiency"];

        $skill->save();
        return $skill;
    }

    static function updateSkill($data, $id){

        $skill = Skill::find($id);

        if (!$skill) {
            throw new \Exception("Skill not found", 404);     
        }

        $skill->name = $data["name"]?$data["name"]:$skill->name;
        $skill->category = $data["category"]?$data["category"]:$skill->category;
        $skill->proficiency = $data["proficiency"]?$data["proficiency"]:$skill->proficiency;

        $skill->save();
        return $skill;
    }

    // static function getSkill($id){
    //     return Skill::find($id);
    // }
    
    static function getSkills($user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);     
        }
    
        return Skill::where( 'user_id' , $user_id)->get();
    }

    static function deleteSkill($id){

        $skill = Skill::find($id);

        if (!$skill) {
            throw new \Exception("Skill not found", 404);     
        }
        
        $skill->delete();
        return true; 
    }
}
