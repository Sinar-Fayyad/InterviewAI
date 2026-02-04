<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\LinkedinService;
use App\Http\Controllers\Controller;

class LinkedinController
{
    function getMessages($userId)
    {
        $result = LinkedinService::getMessages($userId);
        return $result ? $this->responseJSON($result) :
            $this->responseJSON(null, 'Failed to fetch LinkedIn messages', 500);
    }

    function createPost(Request $request)
    {
        $result = LinkedinService::createPost($request->all());
        return $result ? $this->responseJSON($result) :
            $this->responseJSON(null, 'Failed to create LinkedIn post', 500);
    }

    function createProfile(Request $request)
    {
        $result = LinkedinService::createProfile();
        return $result ? $this->responseJSON($result) :
            $this->responseJSON(null, 'Failed to create LinkedIn profile', 500);
    }

    function postToLinkedin(Request $request, $user_id)
    {
        $result = LinkedinService::postToLinkedin($request->all(), $user_id);
        return $result ? $this->responseJSON($result) :
            $this->responseJSON(null, 'Failed to post to LinkedIn', 500);
    }

    function schedulePost(Request $request, $user_id)
    {
        try {
            $result = LinkedinService::schedulePost($request->all(), $user_id);
            return $this->responseJSON($result, 'Post scheduled successfully');
        } 
        catch (\Exception $e) {
            return $this->responseJSON(null, $e->getMessage(), $e->getCode());
        }
    }

    function checkExpiry($user_id)
    {
        $result = LinkedinService::checkExpiry($user_id);
        return $result !== null
            ? $this->responseJSON(['is_expired' => $result])
            : $this->responseJSON(null, "User not found", 404);
    }

    function disconnectLinkedin($user_id)
    {
        $result = LinkedinService::disconnectLinkedin($user_id);
        return $result ? $this->responseJSON($result) :
            $this->responseJSON(null, "User not found", 404);
    }
}