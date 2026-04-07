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
            'company' => 'sometimes|string',
            'job_description' => 'required|string',
            'resume' => 'sometimes|file|mimes:pdf,doc,docx|max:2048',
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

