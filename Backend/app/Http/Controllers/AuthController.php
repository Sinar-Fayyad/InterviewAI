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
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    public function register(RegisterRequest $request){
        try {
            $result = AuthService::register($request->validated());
            return $this->SuccessJSON($result);

        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }

    }

    public function logout(){
        try {
            AuthService::logout();
            return $this->SuccessJSON(null, 'Logged out successfully');

        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }
}
