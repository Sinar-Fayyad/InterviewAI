<?php

namespace App\Http\Requests;

class GenerateEmailRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'job_title' => 'required|string',
            'company_name' => 'required|string',
            'tone'=>'required|string',
            'recipient_name'=>'nullable|string',
            'job_description' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'job_title.required' => 'Job title is required.',
            'job_description.required' => 'Job description is required.',
        ];
    }
}

