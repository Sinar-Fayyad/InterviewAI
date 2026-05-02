<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SocialiteService;
use App\Http\Controllers\Controller;

class SocialiteController extends Controller
{
    public function redirect(string $provider, $user_id, Request $request)
    {
        try {
            $return_to = $request->query('return_to', '/');
            $url = SocialiteService::redirect($provider, $user_id, $return_to);
            return $this->SuccessJSON($url);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    public function callback(string $provider, Request $request)
    {
        try {
            $result = SocialiteService::callback($provider, $request);
            $return_to = $result['return_to'] ?? '/';
            return redirect("http://localhost:8080{$return_to}");
        } catch (\Exception $e) {
            return redirect("http://localhost:8080/?error=" . urlencode($e->getMessage()));
        }
    }
}