<?php

namespace App\Http\Requests;

class AddQuestionsListRequest extends ApiFormRequest
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
            'context_summary' => 'required|string',
        ];
    }

    /**
     * Get custom error messages for validation rules.
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
            'context_summary.required' => 'Context summary is required.',
            'context_summary.string' => 'Context summary must be a string.',
        ];
    }
}
?>
