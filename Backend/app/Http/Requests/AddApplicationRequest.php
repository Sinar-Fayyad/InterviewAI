<?php

namespace App\Http\Requests;

class AddApplicationRequest extends ApiFormRequest
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
            'company_name' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'salary_range' => 'nullable|string|max:50',
            'job_url' => 'nullable|url|max:500',
            'job_description' => 'nullable|string',
            'contact_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'applied_at' => 'required|date',
            'notes' => 'nullable|string|max:1000',
            'status' => 'nullable|in:saved,applied,interviewing,offered,rejected',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'company_name.required' => 'Company name is required.',
            'job_title.required' => 'Job title is required.',
            'location.required' => 'Job location is required.',
            'salary_range.required' => 'Salary range is required.',
            'job_url.required' => 'Job URL is required.',
            'job_url.url' => 'Job URL must be a valid URL.',
            'job_description.required' => 'Job description is required.',
            'contact_name.required' => 'Contact name is required.',
            'contact_email.required' => 'Contact email is required.',
            'contact_email.email' => 'Contact email must be valid.',
            'applied_at.required' => 'Applied date is required.',
            'applied_at.date' => 'Applied date must be a valid date.',
            'notes.required' => 'Notes are required.',
            'status.required' => 'Status is required.',
            'status.in' => 'Invalid status. Must be one of: saved, applied, interviewing, offered, rejected.',
        ];
    }
}

