<?php

namespace App\Http\Requests;

class ResumeGenerationRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'linkedin_account' => 'nullable|url|max:500',
            'github_account' => 'nullable|url|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'linkedin_account.url' => 'LinkedIn account must be a valid URL.',
            'linkedin_account.max' => 'LinkedIn account may not be greater than 500 characters.',
            'github_account.url' => 'GitHub account must be a valid URL.',
            'github_account.max' => 'GitHub account may not be greater than 500 characters.',
        ];
    }
}

