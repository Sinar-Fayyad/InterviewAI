<?php

namespace App\Http\Requests;

class StartInterviewRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'context_summary' => 'required|string',
        ];
    }
}
