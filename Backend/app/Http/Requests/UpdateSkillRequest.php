<?php

namespace App\Http\Requests;

class UpdateSkillRequest extends ApiFormRequest
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
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|in:technical,soft skills,tools,languages,others',
            'proficiency' => 'sometimes|integer|min:0|max:100',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.string' => 'Skill name must be a string.',
            'name.max' => 'Skill name may not be greater than 255 characters.',
            'category.in' => 'Invalid skill category. Allowed: technical, soft skills, tools, languages, others.',
            'proficiency.integer' => 'Proficiency must be an integer.',
            'proficiency.min' => 'Proficiency must be at least 0.',
            'proficiency.max' => 'Proficiency must not exceed 100.',
        ];
    }
}

