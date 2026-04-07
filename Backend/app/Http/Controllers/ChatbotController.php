<?php

namespace App\Http\Controllers;

use App\Services\ChatbotService;
use App\Http\Controllers\Controller;
use App\Http\Requests\SendChatRequest;

class ChatbotController extends Controller
{
    function initializeMemory($user_id = null)
    {
        try {
            $result = ChatbotService::initializeMemory($user_id);
            return $this->SuccessJSON($result);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function sendMessage(SendChatRequest $request)
    {
        try {
            $result = ChatbotService::sendMessage($request->validated());
            return $this->SuccessJSON($result);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
}