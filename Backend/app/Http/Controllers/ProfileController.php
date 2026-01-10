<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ProfileService;
use App\Http\Controllers\Controller;

class ProfileController extends Controller
{
    function getProfile($user_id){
        $result = ProfileService::getProfile($user_id);
        return $result ? $this->responseJSON($result):
                         $this->responseJSON(null, "User not found", 404);
    }

    function saveProfile(Request $request, $user_id){
        $result = ProfileService::saveProfile($user_id, $request);
        return $result? $this->responseJSON($result):
                        $this->responseJSON(null, "User not found", 404);
    }
}
