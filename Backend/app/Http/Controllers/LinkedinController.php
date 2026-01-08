<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\LinkedinService;
use App\Http\Controllers\Controller;

class LinkedinController
{

    function createPost(Request $request)
    {
        $result = LinkedinService::createPost($request->all());
        return $result ? $this->responseJSON($result) : 
                         $this->responseJSON(null, 'Failed to create LinkedIn post', 500);
    }

    function createProfile(Request $request)
    {
        $result = LinkedinService::createProfile($request->all());
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
        $result = LinkedinService::schedulePost($request->all(), $user_id);
        return $result ? $this->responseJSON($result) :
                         $this->responseJSON(null, 'Failed to schedule LinkedIn post', 500);
    }
}