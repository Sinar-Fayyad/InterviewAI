<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthService;
use App\Http\Controllers\Controller;

class AuthController extends Controller{

    public function login(LoginRequest $request){

        try {
            $credentials = $request->validated()->only('email', 'password');
            $result = AuthService::login($credentials);
            return $this->SuccessJSON($result);

        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() ?: 401);
        }
    }

    public function register(RegisterRequest $request){
        try {
            $data = $request->validated()->only(['first_name', 'last_name', 'email', 'password']);
            $result = AuthService::register($data);
            return $this->SuccessJSON($result);

        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() ?: 400);
        }

    }

    public function logout(){
        try {
            AuthService::logout();
            return $this->SuccessJSON(['message' => 'Logged out successfully']);

        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}
