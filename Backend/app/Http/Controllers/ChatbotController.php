<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ChatbotService;
use App\Http\Controllers\Controller;

class ChatbotController extends Controller
{
    function initializeMemory($user_id = null)
    {
        $result = ChatbotService::initializeMemory($user_id);
        return $result ? $this->responseJSON($result) : 
                         $this->responseJSON(null, 'Failed to initialize chat memory', 500);
    }

    function sendMessage(Request $request)
    {
        $result = ChatbotService::sendMessage($request);
        return $result ? $this->responseJSON($result) : 
                         $this->responseJSON(null, 'Failed to send message', 500);
    }
}