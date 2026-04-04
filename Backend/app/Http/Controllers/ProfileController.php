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
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function saveProfile(SaveProfileRequest $request, $user_id)
    {
        try {
            if (!$user_id) {
                throw new \Exception("User ID is required", 400);
            }
            ProfileService::saveProfile($user_id, $request);
            return $this->SuccessJSON("Profile saved successfully");
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
}
