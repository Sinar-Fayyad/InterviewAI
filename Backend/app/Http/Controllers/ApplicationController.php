<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Application;
use App\Http\Controllers\Controller;
use App\Services\ApplicationService;

class ApplicationController extends Controller
{
    function addApplication(Request $request){
        $application = new Application;
        $application = ApplicationService::addApplication($application, $request);
        return $this->responseJSON($application);
    }

    function updateApplication(Request $request, $id){
        $application = ApplicationService::updateApplication($id, $request);
        return $this->responseJSON($application);
    }

    function getApplications($user_id){
        $applications = ApplicationService::getApplications($user_id);
        return $applications?  $this->responseJSON($applications):
                           $this ->responseJSON (null , "Not found", 404);
    }

    function getApplication($id){
        $application = ApplicationService::getApplication($id);
        return $application?  $this->responseJSON($application):
                              $this ->responseJSON (null , "Not found", 404);
    }

    function deleteApplication ($id){
        $application = ApplicationService::deleteApplication($id);
        return $this->responseJSON($application);
    }
}
