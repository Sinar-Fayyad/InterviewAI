<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class SocialiteService
{
    protected static $officialProviders = [
        'google',
        'linkedin-openid',
    ];

    static function redirect(string $provider, int $user_id)
    {
        if (!in_array($provider, self::$officialProviders)) {
            throw new \InvalidArgumentException('Provider not supported', 404);
        }

        return Socialite::driver($provider)->stateless()->with(['state' => (string)$user_id])->redirect()->getTargetUrl();
    }

    static function callback(string $provider, Request $request)
    {
        if (!in_array($provider, self::$officialProviders)) {
            throw new \InvalidArgumentException('Invalid provider', 404);
        }

        $user_id = $request->query('state');
        if (!$user_id || !is_numeric($user_id)) {
            throw new \InvalidArgumentException('Invalid user_id in state', 400);
        }
        $user_id = (int)$user_id;

        $socialiteUser = Socialite::driver($provider)->stateless()->user();
        $user = User::findOrFail($user_id);

        $updatedUser = self::linkSocialAccountToUser($socialiteUser, $provider, $user);

        $token = auth('api')->login($updatedUser);

        return [
            'status' => 'success',
            'token' => $token,
        ];
    }

    static function linkSocialAccountToUser($socialiteUser, string $provider, User $user)
    {
        $idColumn = ($provider === 'linkedin-openid') ? 'linkedin_id' : 'google_id';
        $tokenColumn = ($provider === 'linkedin-openid') ? 'linkedin_token' : 'google_token';
        $refreshTokenColumn = ($provider === 'google') ? 'google_refresh_token' : null;
        $expiresAtColumn = ($provider === 'linkedin-openid') ? 'linkedin_expires_at' : null;

        $updates = [
            $idColumn => $socialiteUser->getId(),
            $tokenColumn => $socialiteUser->token,
        ];

        if ($provider === 'google' && isset($socialiteUser->refreshToken)) {
            $updates['google_refresh_token'] = $socialiteUser->refreshToken;
        }

        if ($provider === 'linkedin-openid' && isset($socialiteUser->expiresIn)) {
            $updates['linkedin_expires_at'] = now()->addSeconds($socialiteUser->expiresIn);
        }

        $user->updateOrFail($updates);
        return $user;
    }
}

