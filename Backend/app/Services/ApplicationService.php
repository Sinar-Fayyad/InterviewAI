<?php

namespace App\Services;
use App\Models\Application;

class ApplicationService
{
   static function addApplication($application , $data){

        $application->user_id = $data["user_id"];
        $application->company_name = $data["company_name"];
        $application->job_title = $data["job_title"];
        $application->location = $data["location"];
        $application->salary_range = $data["salary_range"];
        $application->job_url = $data["job_url"];
        $application->job_description = $data["job_description"];
        $application->contact_name = $data["contact_name"];
        $application->contact_email = $data["contact_email"];
        $application->applied_at = $data["applied_at"];
        $application->notes = $data["notes"];
        $application->status = $data["status"]; 

        $application->save();
        return $application;
    }

    static function updateApplication($id, $data){
        $application = Application::find($id);
        $application->company_name = $data["company_name"]?$data["company_name"]:$application->company_name;
        $application->job_title = $data["job_title"]?$data["job_title"]:$application->job_title;
        $application->location = $data["location"]?$data["location"]:$application->location;
        $application->salary_range = $data["salary_range"]?$data["salary_range"]:$application->salary_range;
        $application->job_url = $data["job_url"]?$data["job_url"]:$application->job_url;
        $application->job_description = $data["job_description"]?$data["job_description"]:$application->job_description;
        $application->contact_name = $data["contact_name"]?$data["contact_name"]:$application->contact_name;
        $application->contact_email = $data["contact_email"]?$data["contact_email"]:$application->contact_email;
        $application->applied_at = $data["applied_at"]?$data["applied_at"]:$application->applied_at;
        $application->notes = $data["notes"]?$data["notes"]:$application->notes;
        $application->status = $data["status"]?$data["status"]:$application->status;

        $application->save();
        return $application;
    }

    static function getApplications($user_id){
        return Application::where( 'user_id' , $user_id)->get();
    }

    static function getApplication($id){
        return Application::find($id);
    }
    
    static function deleteApplication($id){

        $application = Application::find($id);
        $application->delete();
        return $application;
    }
}
