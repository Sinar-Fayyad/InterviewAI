<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;

class SocialiteService
{
    protected static $officialProviders = [
        'google',
        'linkedin-openid',
    ];

    static function redirect(string $provider, $user_id, string $return_to = '/')
    {
        if (!in_array($provider, self::$officialProviders)) {
            throw new \InvalidArgumentException('Provider not supported', 404);
        }

        $driver = Socialite::driver($provider)
            ->stateless()
            ->with(['state' => json_encode(['user_id' => (string)$user_id, 'return_to' => $return_to])]);

        // Force Google to always return refresh token
        if ($provider === 'google') {
            $driver = $driver->with([
                'state' => json_encode(['user_id' => (string)$user_id, 'return_to' => $return_to]),
                'access_type' => 'offline',
                'prompt' => 'consent',
            ]);
        }

        return $driver->redirect()->getTargetUrl();
    }

    static function callback(string $provider, Request $request)
    {
        if (!in_array($provider, self::$officialProviders)) {
            throw new \InvalidArgumentException('Invalid provider', 404);
        }

        $state = json_decode($request->query('state'), true);
        $user_id = $state['user_id'] ?? null;
        $return_to = $state['return_to'] ?? '/';

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
            'return_to' => $return_to,
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

        if ($provider === 'google' && !empty($socialiteUser->token)) {
            $updates['google_token'] = $socialiteUser->token;
        }

        if ($provider === 'google' && !empty($socialiteUser->refreshToken)) {
            $updates['google_refresh_token'] = $socialiteUser->refreshToken;
        }


        if ($provider === 'google') {
            $email = $socialiteUser->getEmail() ?? $socialiteUser->email ?? null;
            if ($email) {
                $updates['google_email'] = $email;
            }
        }

        $user->updateOrFail($updates);
        return $user;
    }

    static function checkConnections($user_id)
    {
        $user = User::findOrFail($user_id);
        if (!$user) {
            throw new \Exception('User not found', 404);
        }
        return [
            'linkedin_connected' => !empty($user->linkedin_id) || !empty($user->linkedin_token),
            'google_connected' => !empty($user->google_id) || !empty($user->google_token)
        ];
    }
}
