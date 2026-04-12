<?php

namespace App\Http\Requests;

class ResumeOptimizationRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'old_resume' => 'required|string|max:10000',
            'linkedin_account' => 'nullable|url|max:500',
            'github_account' => 'nullable|url|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'old_resume.required' => 'Old resume is required.',
            'old_resume.string' => 'Old resume must be string.',
            'old_resume.max' => 'Old resume may not be greater than 10000 characters.',
            'linkedin_account.url' => 'LinkedIn account must be a valid URL.',
            'linkedin_account.max' => 'LinkedIn account may not be greater than 500 characters.',
            'github_account.url' => 'GitHub account must be a valid URL.',
            'github_account.max' => 'GitHub account may not be greater than 500 characters.',
        ];
    }
}

