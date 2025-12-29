<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AuthService;
use App\Http\Controllers\Controller;

class AuthController extends Controller{

    public function login(Request $request){
        $user = AuthService::login($request);

        return $user? $this->responseJSON($user):
                      $this->responseJSON(null, "error", 401);
    }

    public function register(Request $request){
        $user = AuthService::register($request);
        return $this->responseJSON($user);
    }

    public function logout(){
        $user = AuthService::logout();
        return $this->responseJSON($user);
    }
}
