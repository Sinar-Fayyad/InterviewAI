<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ResearchService;
use App\Http\Controllers\Controller;

class ResearchController extends Controller
{
    function Research(Request $request)
    {
        $result = ResearchService::Research($request->all());
        return $result ? $this->responseJSON($result) : 
                         $this->responseJSON(null, 'Failed to research', 500);
    }
}
