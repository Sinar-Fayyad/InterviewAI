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
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }
    function updateApplication(UpdateApplicationRequest $request, $id)
    {
        try {
            $application = ApplicationService::updateApplication($request->validated(), $id);
            return $this->SuccessJSON($application);
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    function getApplications($user_id)
    {
        try {
            $applications = ApplicationService::getApplications($user_id);
            return $this->SuccessJSON($applications);
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    function getApplication($id)
    {
        try {
            $application = ApplicationService::getApplication($id);
            return $this->SuccessJSON($application);
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    function deleteApplication($id)
    {
        try {
            ApplicationService::deleteApplication($id);
            return $this->SuccessJSON(null,  "Application deleted successfully");
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }
}
