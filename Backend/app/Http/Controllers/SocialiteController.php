<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SocialiteService;
use App\Http\Controllers\Controller;

class SocialiteController extends Controller
{
    public function redirect(string $provider)
    {
        return SocialiteService::redirect($provider);
    }

    public function callback(string $provider)
    {
        $result = SocialiteService::callback($provider);

        if (isset($result['error'])) {
            return $this->responseJSON(null, $result['error'], $result['status'] ?? 400);
        }

        return $this->responseJSON($result);
    }
}
