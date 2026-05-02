<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateLinkedinPostRequest;
use App\Http\Requests\PostToLinkedinRequest;
use App\Services\LinkedinService;
use App\Http\Requests\SchedulePostRequest;

class LinkedinController extends Controller
{
    // function getMessages($user_id)
    // {
    //     try {
    //         $messages = LinkedinService::getMessages($user_id);
    //         return $this->SuccessJSON($messages);
    //     } catch (\Exception $e) {
    //         $code = $e->getCode();
    //         $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
    //         return $this->ErrorJSON($e->getMessage(), $httpCode);
    //     }
    // }

    function createPost(CreateLinkedinPostRequest $request)
    {
        try {
            $post = LinkedinService::createPost($request->validated());
            return $this->SuccessJSON($post);
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    function createProfile($user_id)
    {
        try {
            $profile = LinkedinService::createProfile($user_id);
            return $this->SuccessJSON($profile);
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    function postToLinkedin(PostToLinkedinRequest $request, $user_id)
    {
        try {
            LinkedinService::postToLinkedIn($request->validated(), $user_id);
            return $this->SuccessJSON(null,  "Post published successfully");
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    function schedulePost(SchedulePostRequest $request, $user_id)
    {
        try {
            LinkedinService::schedulePost($request->validated(), $user_id);
            return $this->SuccessJSON(null,  "Post scheduled successfully");
        } 
        catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    function checkExpiry($user_id)
    {
        try {
            $result = LinkedinService::checkExpiry($user_id);
            return $this->SuccessJSON($result);
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }

    function disconnectLinkedin($user_id)
    {
        try {
            LinkedinService::disconnectLinkedin($user_id);
            return $this->SuccessJSON(null, ['message' => 'LinkedIn account disconnected successfully']);
        } catch (\Exception $e) {
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON("Disconnection failed", $httpCode);
        }
    }
}