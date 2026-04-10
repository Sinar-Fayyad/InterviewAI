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
            $code = $e->getCode();
            $httpCode = ($code >= 100 && $code < 600) ? $code : 500;
            return $this->ErrorJSON($e->getMessage(), $httpCode);
        }
    }
}
