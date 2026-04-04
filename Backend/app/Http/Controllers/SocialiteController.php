<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SocialiteService;
use App\Http\Controllers\Controller;

class SocialiteController extends Controller
{
    public function redirect(string $provider, $userId)
    {
        try {
            $url = SocialiteService::redirect($provider, $userId);
            return redirect($url);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function callback(string $provider, Request $request)
    {
        try {
            $result = SocialiteService::callback($provider, $request);
            return $this->SuccessJSON($result);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() ?: 400);
        }
    }
}