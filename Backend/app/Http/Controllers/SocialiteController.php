<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SocialiteService;
use App\Http\Controllers\Controller;

class SocialiteController extends Controller
{
    public function redirect(string $provider, $user_id)
    {
        try {
            $url = SocialiteService::redirect($provider, $user_id);
            return $this->SuccessJSON($url);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function callback(string $provider, Request $request)
{
    try {
        $result = SocialiteService::callback($provider, $request);
        return redirect("http://localhost:8080/profile");
    } catch (\Exception $e) {
        return $this->ErrorJSON($e->getMessage(), $e->getCode() ?: 400);
    }
}
}