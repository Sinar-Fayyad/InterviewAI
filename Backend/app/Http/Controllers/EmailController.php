<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\EmailService;
use App\Http\Controllers\Controller;

class EmailController extends Controller
{
    function generateEmail(Request $request, $user_id = null)
    {
        $result = EmailService::generateEmail($user_id, $request);
        return $result? $this->responseJSON($result):
                        $this->responseJSON(null, 'Email generation failed', 500);
    }

    public function replyToEmail(Request $request)
    {
        $result = EmailService::replyToEmail($request);
        return $result? $this->responseJSON($result):
                        $this->responseJSON(null, 'Failed to generate email reply', 500);
    }

    public function sendEmail(Request $request, $user_id)
    {
        $result = EmailService::sendEmail($user_id, $request);

        return $result? $this->responseJSON($result):
                        $this->responseJSON(null, 'Failed to send email', 500);
    }
}