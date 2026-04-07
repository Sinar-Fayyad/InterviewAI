<?php

namespace App\Services;

use App\Models\User;
use App\Models\Application;

class ApplicationService
{
    static function addApplication($data, $user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        $application = new Application();
        $application->user_id = $user_id;
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

    static function updateApplication($data, $id)
    {
        $application = Application::find($id);

        if (!$application) {
            throw new \Exception("Application not found", 404);
        }

        $application->company_name = $data["company_name"] ? $data["company_name"] : $application->company_name;
        $application->job_title = $data["job_title"] ? $data["job_title"] : $application->job_title;
        $application->location = $data["location"] ? $data["location"] : $application->location;
        $application->salary_range = $data["salary_range"] ? $data["salary_range"] : $application->salary_range;
        $application->job_url = $data["job_url"] ? $data["job_url"] : $application->job_url;
        $application->job_description = $data["job_description"] ? $data["job_description"] : $application->job_description;
        $application->contact_name = $data["contact_name"] ? $data["contact_name"] : $application->contact_name;
        $application->contact_email = $data["contact_email"] ? $data["contact_email"] : $application->contact_email;
        $application->applied_at = $data["applied_at"] ? $data["applied_at"] : $application->applied_at;
        $application->notes = $data["notes"] ? $data["notes"] : $application->notes;
        $application->status = $data["status"] ? $data["status"] : $application->status;

        $application->save();
        return $application;
    }

    static function getApplications($user_id)
    {
        $application = Application::where('user_id', $user_id)->get();
        if (!$application) {
            throw new \Exception("Applications not found", 404);
        }

        return $application;
    }

    static function getApplication($id)
    {
        $application = Application::find($id);
        if (!$application) {
            throw new \Exception("Application not found", 404);
        }
        return $application;
    }

    static function deleteApplication($id)
    {
        $application = Application::find($id);
        if (!$application) {
            throw new \Exception("Application not found", 404);
        }

        $application->delete();
        return true; 
    }
}
