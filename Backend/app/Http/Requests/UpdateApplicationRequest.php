<?php

namespace App\Http\Requests;

class UpdateApplicationRequest extends ApiFormRequest
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
     */
    public function rules(): array
    {
        return [
            'company_name' => 'sometimes|nullable|string|max:255',
            'job_title' => 'sometimes|nullable|string|max:255',
            'location' => 'sometimes|nullable|string|max:255',
            'salary_range' => 'sometimes|nullable|string|max:50',
            'job_url' => 'sometimes|nullable|url|max:500',
            'job_description' => 'sometimes|nullable|string|max:500',
            'contact_name' => 'sometimes|nullable|string|max:255',
            'contact_email' => 'sometimes|nullable|email|max:255',
            'applied_at' => 'sometimes|nullable|date',
            'notes' => 'sometimes|nullable|string|max:1000',
           'status' => 'sometimes|nullable|in:saved,applied,interviewing,offered,rejected',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'company_name.string' => 'Company name must be a string.',
            'job_title.string' => 'Job title must be a string.',
            'location.string' => 'Location must be a string.',
            'salary_range.string' => 'Salary range must be a string.',
            'job_url.url' => 'Job URL must be a valid URL.',
            'job_description.string' => 'Job description must be a string.',
            'contact_name.string' => 'Contact name must be a string.',
            'contact_email.email' => 'Contact email must be valid.',
            'applied_at.date' => 'Applied date must be a valid date.',
            'status.in' => 'Invalid status. Must be one of: saved, applied, interviewing, offered, rejected.',
        ];
    }
}

