<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

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

        $user = self::findOrCreateUser($socialiteUser, $provider);

        Auth::login($user);

        $token = auth('api')->login($user);

        return [
            'status' => 'success',
            'user' => $user,
            'token' => $token,
            'redirect_to' => '/onboarding'
        ];
    }

    public static function findOrCreateUser($socialiteUser, string $provider): User
    {
        $idColumn = ($provider === 'linkedin-openid') ? 'linkedin_id' : "{$provider}_id";
        $tokenColumn = ($provider === 'linkedin-openid') ? 'linkedin_token' : "{$provider}_token";

        // 1. Try finding user by social ID
        $user = User::where($idColumn, $socialiteUser->getId())->first();

        if ($user) {
            $user->update([$tokenColumn => $socialiteUser->token]);
            return $user;
        }

        // 2. Try finding user by email to link accounts
        $user = User::where('email', $socialiteUser->getEmail())->first();

        if ($user) {
            $user->update([
                $idColumn => $socialiteUser->getId(),
                $tokenColumn => $socialiteUser->token,
            ]);
            return $user;
        }

        // 3. Create a new user (Split names for your table structure)
        $fullName = $socialiteUser->getName() ?? 'User';
        $nameParts = explode(' ', $fullName, 2);

        return User::create([
            'first_name' => $nameParts[0],
            'last_name' => $nameParts[1] ?? '',
            'email' => $socialiteUser->getEmail(),
            'password' => null, // Allowed as per our migration update
            $idColumn => $socialiteUser->getId(),
            $tokenColumn => $socialiteUser->token,
            'email_verified_at' => now(),
        ]);
    }
}
