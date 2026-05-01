<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\PasswordResetMail;


class AuthService
{
    static function login($credentials)
    {
        $token = JWTAuth::attempt($credentials);

        if (!$token) {
            throw new \Exception("Invalid credentials", 401);
        }

        $user = auth('api')->user();
        return [
            'id' => $user->id,
            'token' => $token,
            'onboarding_completed' => $user->onboarding_completed,
        ];
    }

    static function register($data)
    {

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

    static function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
    }

    static function forgotPassword($email)
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw new \Exception("No user found with that email", 404);
        }

        DB::table('password_reset_tokens')->where('email', $email)->delete();

        $token = Str::random(60);
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => $token,
            'created_at' => now(),
        ]);

        $resetUrl = 'http://localhost:8080/reset-password?token=' . $token;

        Log::info("Password reset URL for {$email}: " . $resetUrl);

       Mail::to($email)->send(new PasswordResetMail($resetUrl));

        return ['message' => 'Password reset link sent!'];
    }
}

?>