<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ContentService;
use App\Http\Controllers\Controller;

class ContentController extends Controller
{
    function generate(Request $request, $user_id)
    {
        $result = ContentService::generate($request->all(), $user_id);
        return $result ? $this->responseJSON($result) :
                         $this->responseJSON(null, 'Failed to generate questions', 500);
    }
}