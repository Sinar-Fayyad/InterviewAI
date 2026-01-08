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

    static function redirect(string $provider)
    {
        if (!in_array($provider, self::$officialProviders)) {
            return ['error' => 'Provider not supported', 'status' => 404];
        }

        return Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();
    }

    static function callback(string $provider)
    {
        if (!in_array($provider, self::$officialProviders)) {
            return ['error' => 'Invalid provider', 'status' => 404];
        }

        try {
            $socialiteUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return [
                'error' => 'Social authentication failed',
                'message' => $e->getMessage(),
                'status' => 401
            ];
        }

        $user = self::updateExistingUser($socialiteUser, $provider);

        if (!$user) {
            return [
                'error' => 'No existing account found to connect',
                'status' => 404
            ];
        }

        $token = auth('api')->login($user);

        return [
            'status' => 'success',
            'user' => $user,
            'token' => $token,
        ];
    }

    static function updateExistingUser($socialiteUser, string $provider)
    {
        $idColumn = ($provider === 'linkedin-openid') ? 'linkedin_id' : 'google_id';
        $tokenColumn = ($provider === 'linkedin-openid') ? 'linkedin_token' : 'google_token';
        $refreshTokenColumn = ($provider === 'linkedin-openid') ? null : 'google_refresh_token';
        $expiresAtColumn = ($provider === 'linkedin-openid') ? 'linkedin_expires_at' : null;

        $user = auth('api')->user();

        if (!$user) {
            return null;
        }

        $updates = [
            $idColumn => $socialiteUser->getId(),
            $tokenColumn => $socialiteUser->token,
        ];

        if ($provider === 'google') {
            $updates['google_email'] = $socialiteUser->getEmail();
        }

        if ($refreshTokenColumn && isset($socialiteUser->refreshToken)) {
            $updates[$refreshTokenColumn] = $socialiteUser->refreshToken;
        }

        if ($expiresAtColumn && isset($socialiteUser->expiresIn)) {
            $updates[$expiresAtColumn] = now()->addSeconds($socialiteUser->expiresIn);
        }

        $user->update($updates);
        return $user;
    }
}