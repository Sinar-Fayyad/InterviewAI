<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthService;
use App\Http\Controllers\Controller;

class AuthController extends Controller{

    public function login(LoginRequest $request){

        try {
            $result = AuthService::login($request->validated());
            return $this->SuccessJSON($result);

        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() ?: 401);
        }
    }

    public function register(RegisterRequest $request){
        try {
            $result = AuthService::register($request->validated());
            return $this->SuccessJSON($result);

        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }

    }

    public function logout(){
        try {
            AuthService::logout();
            return $this->SuccessJSON(null, ['message' => 'Logged out successfully']);

        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}
