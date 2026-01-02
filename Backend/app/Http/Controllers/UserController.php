<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Services\UserService;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    function getUser($id){
        $user = UserService::getUser($id);
        return $this->responseJSON($user);
    }

    function updateUser(Request $request, $id){

        $user = UserService::getUser($id);
        $user = UserService::updateUser($request, $user);
        return $this->responseJSON($user);
    }

    function ChangeTheme(Request $request, $id){
        $user = User::find($id);
        $user = UserService::changeTheme($request, $user);
        $user->save();
        return $this->responseJSON($user);
    }  
}
