<?php

namespace App\Http\Requests;

use App\Http\Requests\ApiFormRequest;

class StoreCertificationRequest extends ApiFormRequest
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
            'certification_name' => 'required|string|max:255',
            'organization_name' => 'required|string|max:255',
            'date_obtained' => 'required|date',
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'certification_name.required' => 'Certification name is required.',
            'certification_name.string' => 'Certification name must be a string.',
            'certification_name.max' => 'Certification name may not be greater than 255 characters.',
            'organization_name.required' => 'Organization name is required.',
            'organization_name.string' => 'Organization name must be a string.',
            'organization_name.max' => 'Organization name may not be greater than 255 characters.',
            'date_obtained.required' => 'Date obtained is required.',
            'date_obtained.date' => 'Date obtained must be a valid date.',
        ];
    }
}

