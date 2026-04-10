<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveProfileRequest;
use App\Services\ProfileService;
use App\Http\Controllers\Controller;

class ProfileController extends Controller
{
    function getProfile($user_id)
    {
        try {

            if (!$user_id) {
                throw new \Exception("User ID is required", 400);
            }
            
            $result = ProfileService::getProfile($user_id);
            return $this->SuccessJSON($result);
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    function saveProfile(SaveProfileRequest $request, $user_id)
    {
        try {
            if (!$user_id) {
                throw new \Exception("User ID is required", 400);
            }
            ProfileService::saveProfile($request, $user_id);
            return $this->SuccessJSON(null, ["message" => "Profile saved successfully"]);
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }
}
