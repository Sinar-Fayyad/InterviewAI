<?php

namespace App\Http\Controllers;

use App\Services\ResearchService;
use App\Http\Controllers\Controller;
use App\Http\Requests\ResearchRequest;

class ResearchController extends Controller
{
function Research(ResearchRequest $request)
    {
        try {
            $result = ResearchService::Research($request->validated());
            return $this->SuccessJSON($result);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
}
