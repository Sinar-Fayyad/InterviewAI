<?php

namespace App\Traits;

trait ResponseTrait
{
    static function responseJSON($payload, $message, $status_code = 200){
        return response()->json([
            "payload" => $payload,
            "message" => $message
        ], $status_code);
    }
}
