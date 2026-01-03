<?php

namespace App\Services;

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

class SocialiteService
{
    protected static $officialProviders = [
        'google',
        'linkedin-openid',
    ];

    public static function redirect(string $provider)
    {
        if (!in_array($provider, self::$officialProviders)) {
            return response()->json(['error' => 'Provider not supported'], 404);
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public static function callback(string $provider)
    {
        if (!in_array($provider, self::$officialProviders)) {
            return response()->json(['error' => 'Invalid provider'], 404);
        }

        try {
            $socialiteUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Social authentication failed',
                'message' => $e->getMessage() 
            ], 401);
        }

        $user = self::updateExistingUser($socialiteUser, $provider);

        if (!$user) {
            return response()->json(['error' => 'No existing account found to connect'], 404);
        }

        // Generate new JWT for the updated user
        $token = auth('api')->login($user);

        return [
            'status' => 'success',
            'user' => $user,
            'token' => $token,
        ];
    }

    public static function updateExistingUser($socialiteUser, string $provider): ?User
    {
        $idColumn = ($provider === 'linkedin-openid') ? 'linkedin_id' : "{$provider}_id";
        $tokenColumn = ($provider === 'linkedin-openid') ? 'linkedin_token' : "{$provider}_token";

        // 1. Try to get user from the current JWT token
        $user = auth('api')->user();

        // 2. Fallback to email if not logged in
        if (!$user) {
            $user = User::where('email', $socialiteUser->getEmail())->first();
        }

        if ($user) {
            $user->update([
                $idColumn => $socialiteUser->getId(),
                $tokenColumn => $socialiteUser->token,
            ]);
            return $user;
        }

        return null;
    }
}