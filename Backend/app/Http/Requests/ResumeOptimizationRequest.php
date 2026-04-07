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
            'old_resume' => 'required|file|mimes:pdf,txt,doc,docx|max:5120', // 5MB max
            'old_resume_text' => 'nullable|string|max:10000', // fallback text if no file
            'linkedin_account' => 'nullable|url|max:500',
            'github_account' => 'nullable|url|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'old_resume.required' => 'Old resume file or text is required.',
            'old_resume.file' => 'Old resume must be a file.',
            'old_resume.mimes' => 'Old resume must be PDF, TXT, DOC, or DOCX.',
            'old_resume.max' => 'Old resume file may not be greater than 5MB.',
            'old_resume_text.string' => 'Old resume text must be string.',
            'old_resume_text.max' => 'Old resume text may not be greater than 10000 characters.',
            'linkedin_account.url' => 'LinkedIn account must be a valid URL.',
            'linkedin_account.max' => 'LinkedIn account may not be greater than 500 characters.',
            'github_account.url' => 'GitHub account must be a valid URL.',
            'github_account.max' => 'GitHub account may not be greater than 500 characters.',
        ];
    }
}

