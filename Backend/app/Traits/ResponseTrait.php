<?php

namespace App\Traits;

trait ResponseTrait
{
    static function SuccessJSON($payload , $message = "Success", $status_code = 200){
        return response()->json([
            "payload" => $payload,
            "message" => $message
        ], $status_code);
    }

    static function ErrorJSON($message = "Error", $status_code = 400){
        return response()->json([
            "payload" => null,
            "message" => $message
        ], $status_code);
    }
}
