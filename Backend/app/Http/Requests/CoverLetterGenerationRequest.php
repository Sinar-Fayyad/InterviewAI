<?php

namespace App\Http\Requests;

class CoverLetterGenerationRequest extends ApiFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',  
            'cover_letter_type' => 'required|string',
            'platform' => 'nullable|string|max:255',
            'job_description' => 'nullable|string|max:2000',
            'contact_name' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'company_name.required' => 'Company name is required.',
            'company_name.string' => 'Company name must be a string.',
            'company_name.max' => 'Company name may not be greater than 255 characters.',
            'job_title.required' => 'Job title is required.',
            'job_title.string' => 'Job title must be a string.',
            'job_title.max' => 'Job title may not be greater than 255 characters.',
            'platform.string' => 'Platform must be a string.',
            'platform.max' => 'Platform may not be greater than 255 characters.',
            'job_description.string' => 'Job description must be a string.',
            'job_description.max' => 'Job description may not be greater than 2000 characters.',
            'contact_name.string' => 'Contact name must be a string.',
            'contact_name.max' => 'Contact name may not be greater than 255 characters.',
        ];
    }
}

