<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;


class AuthService{
   
    static function login($credentials){
        $token = JWTAuth::attempt($credentials);

        if (!$token) {
            throw new \Exception("Invalid credentials");
        }
        
        $user = auth('api')->user();
        return [
            'id' => $user->id,
            'token' => $token,
        ];
    }

    static function register($data){
        $userData = [
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ];

        $user = User::create($userData);
        $token = self::login($data); 

        return $token;
    }

    static function logout (){
        JWTAuth::invalidate(JWTAuth::getToken());
    }
}
