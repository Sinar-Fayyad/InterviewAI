<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserUpdateRequest;

class UserController extends Controller
{

    function updateUser(UserUpdateRequest $request, $id){
        try {
            UserService::updateUser($request, $id);
            return $this->SuccessJSON(null, "User updated successfully"); ;
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);;
        }
    }

    function changeTheme($id){
        try {
            UserService::changeTheme($id);
            return $this->SuccessJSON(null, "Theme changed successfully") ;
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }  
}
