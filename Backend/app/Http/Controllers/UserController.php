<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserUpdateRequest;

class UserController extends Controller
{

    function updateUser(UserUpdateRequest $request, $id){
        try {
            UserService::updateUser($request->all(), $id);
            return $this->SuccessJSON() ;
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode()) ;
        }
    }

    function changeTheme($id){
        try {
            UserService::changeTheme($id);
            return $this->SuccessJSON();
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode()) ;
        }
    }  
}
