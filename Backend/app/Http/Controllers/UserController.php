<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Services\UserService;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    // function getUser($id)
    // {
    //     $user = UserService::getUser($id);
    //     return $this->responseJSON($user);
    // }

    function updateUser(Request $request, $id){
        $user = UserService::updateUser($request->all(), $id);
        return $user? $this->responseJSON($user):null ;
    }

    function changeTheme($id){
        $user = UserService::changeTheme($id);
        return $user? $this->responseJSON($user) : null ;
    }  
}
