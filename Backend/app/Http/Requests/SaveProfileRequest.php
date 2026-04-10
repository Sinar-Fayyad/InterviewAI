<?php

namespace App\Http\Requests;

use App\Http\Requests\ApiFormRequest;

class SaveProfileRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        // Trim strings in nested arrays if needed
        $input = $this->all();
        if (isset($input['user_info']) && is_array($input['user_info'])) {
            $input['user_info'] = array_map(function($item) {
                if (is_array($item)) {
                    return array_map(function($field) {
                        return is_string($field) ? trim($field) : $field;
                    }, $item);
                }
                return is_string($item) ? trim($item) : $item;
            }, $input['user_info']);
        }
        $this->merge($input);
    }

    public function rules(): array
    {
        return [
            'user_info' => ['required', 'array', 'min:1'],
            'user_info.*.first_name' => ['nullable', 'string', 'max:255'],
            'user_info.*.last_name' => ['nullable', 'string', 'max:255'],
            'user_info.*.phone' => ['nullable', 'string', 'max:20'],
            'user_info.*.location' => ['nullable', 'string', 'max:255'],
            'user_info.*.summary' => ['nullable', 'string'],

            'education' => ['nullable', 'array'],
            'education.*.institution_name' => ['required_with:education.*', 'string', 'max:255'],
            'education.*.degree' => ['required_with:education.*', 'string', 'max:255'],
            'education.*.field_of_study' => ['nullable', 'string', 'max:255'],
            'education.*.start_date' => ['nullable', 'date'],
            'education.*.end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'education.*.description' => ['nullable', 'string'],

            'experience' => ['nullable', 'array'],
            'experience.*.company_name' => ['required_with:experience.*', 'string', 'max:255'],
            'experience.*.position' => ['required_with:experience.*', 'string', 'max:255'],
            'experience.*.start_date' => ['nullable', 'date'],
            'experience.*.end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'experience.*.description' => ['nullable', 'string'],

            'certifications' => ['nullable', 'array'],
            'certifications.*.certification_name' => ['required_with:certifications.*', 'string', 'max:255'],
            'certifications.*.organization_name' => ['nullable', 'string', 'max:255'],
            'certifications.*.date_obtained' => ['nullable', 'date'],

            'skills' => ['nullable', 'array'],
            'skills.*.name' => ['required_with:skills.*', 'string', 'max:100'],
            'skills.*.category' => ['nullable', 'string', 'max:100'],
            'skills.*.proficiency' => ['nullable', 'integer', 'max:50'],

        ];
    }

    public function messages(): array
    {
        return [
            'user_info.required' => 'User info is required.',
            'education.*.institution_name.required_with' => 'Institution name is required for each education entry.',
            'experience.*.company_name.required_with' => 'Company name is required for each experience entry.',
            'certifications.*.certification_name.required_with' => 'Certification name is required for each certification entry.',
            'skills.*.name.required_with' => 'Skill name is required.',
        ];

    }
}
?>