<?php

namespace App\Http\Requests;

class CoverLetterOptimizationRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'old_cover_letter' => 'required|string|max:10000',
            'company_name' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'old_cover_letter.required' => 'Old cover letter is required',
            'old_cover_letter.string' => 'Old cover letter text must be string.',
            'old_cover_letter.max' => 'Old cover letter text may not be greater than 10000 characters.',
            'company_name.required' => 'Company name is required.',
            'company_name.string' => 'Company name must be a string.',
            'company_name.max' => 'Company name may not be greater than 255 characters.',
            'job_title.required' => 'Job title is required.',
            'job_title.string' => 'Job title must be a string.',
            'job_title.max' => 'Job title may not be greater than 255 characters.',
        ];
    }
}

