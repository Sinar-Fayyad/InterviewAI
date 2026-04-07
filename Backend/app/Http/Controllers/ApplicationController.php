<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\ApplicationService;
use App\Http\Requests\AddApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;

class ApplicationController extends Controller
{
    function addApplication(AddApplicationRequest $request, $user_id)
    {
        try {
            $application = ApplicationService::addApplication($request->validated(), $user_id);
            return $this->SuccessJSON($application);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
    function updateApplication(UpdateApplicationRequest $request, $id)
    {
        try {
            $application = ApplicationService::updateApplication($request->validated(), $id);
            return $this->SuccessJSON($application);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function getApplications($user_id)
    {
        try {
            $applications = ApplicationService::getApplications($user_id);
            return $this->SuccessJSON($applications);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function getApplication($id)
    {
        try {
            $application = ApplicationService::getApplication($id);
            return $this->SuccessJSON($application);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function deleteApplication($id)
    {
        try {
            ApplicationService::deleteApplication($id);
            return $this->SuccessJSON(["message" => "Application deleted successfully"]);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
}
