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
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    function clearMemory($collection_name)
    {
        try {
            ChatbotService::clearMemory($collection_name);
            return $this->SuccessJSON(null, "Memory cleared successfully");
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }
    function sendMessage(SendChatRequest $request)
    {
        try {
            $result = ChatbotService::sendMessage($request->validated());
            return $this->SuccessJSON($result);
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }
}