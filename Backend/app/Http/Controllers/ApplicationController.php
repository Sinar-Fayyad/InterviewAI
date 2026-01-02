<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Application;
use App\Http\Controllers\Controller;
use App\Services\ApplicationsService;

class ApplicationController extends Controller
{
    function addApplication(Request $request){
        $application = new Application;
        $application = ApplicationsService::addApplication($application, $request);
        return $this->responseJSON($application);
    }

    function updateApplication(Request $request, $id){
        $application = ApplicationsService::updateApplication($id, $request);
        return $this->responseJSON($application);
    }

    function getApplications($user_id){
        $applications = ApplicationsService::getApplications($user_id);
        return $applications?  $this->responseJSON($applications):
                           $this ->responseJSON (null , "Not found", 404);
    }

    function getApplication($id){
        $application = ApplicationsService::getApplicationById($id);
        return $application?  $this->responseJSON($application):
                              $this ->responseJSON (null , "Not found", 404);
    }

    function deleteApplication ($id){
        $application = ApplicationsService::deleteApplication($id);
        return $this->responseJSON($application);
    }
}
