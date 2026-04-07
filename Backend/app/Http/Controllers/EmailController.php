<?php

namespace App\Http\Controllers;

use App\Services\EmailService;
use App\Http\Controllers\Controller;
use App\Http\Requests\SendEmailRequest;
use App\Http\Requests\ReplyToEmailRequest;
use App\Http\Requests\GenerateEmailRequest;

class EmailController extends Controller
{
function generateEmail(GenerateEmailRequest $request, $user_id = null)
    {
        try {
            $email = EmailService::generateEmail($request->validated(), $user_id);
            return $this->SuccessJSON($email);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

public function replyToEmail(ReplyToEmailRequest $request)
    {
        try {
            $reply = EmailService::replyToEmail($request->validated());
            return $this->SuccessJSON($reply);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

public function sendEmail(SendEmailRequest $request, $user_id)
    {
        try {
            EmailService::sendEmail($request->validated(), $user_id);
            return $this->SuccessJSON(null, ["message" => "Email sent successfully"]);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    public function getJobEmails($user_id)
    {
        try {
            $emails = EmailService::getJobEmails($user_id);
            return $this->SuccessJSON($emails);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function disconnectGoogle($user_id)
    {
        try {
            EmailService::disconnectGoogle($user_id);
            return $this->SuccessJSON(null, ["message" => "Google account disconnected successfully"] );
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
}