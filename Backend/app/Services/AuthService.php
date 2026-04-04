<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;


class AuthService{
   
    static function login(array $credentials){
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

    static function register(array $data){
        $userData = [
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ];

        $user = User::create($userData);
        $token = JWTAuth::fromUser($user);

        return [
            'id' => $user->id,
            'token' => $token,
        ];
    }

    static function logout (){
        JWTAuth::invalidate(JWTAuth::getToken());
    }
}
