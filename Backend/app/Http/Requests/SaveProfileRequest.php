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
            'skills.*.proficiency' => ['nullable', 'integer', 'between:1,5'],

            'applications' => ['nullable', 'array'],
            'applications.*.job_title' => ['required_with:applications.*', 'string', 'max:255'],
            'applications.*.company_name' => ['required_with:applications.*', 'string', 'max:255'],
            'applications.*.location' => ['nullable', 'string', 'max:255'],
            'applications.*.salary_range' => ['nullable', 'string'],
            'applications.*.job_url' => ['nullable', 'url'],
            'applications.*.status' => ['nullable', 'string'],
            'applications.*.applied_at' => ['nullable', 'date'],
            'applications.*.notes' => ['nullable', 'string'],
            'applications.*.contact_name' => ['nullable', 'string'],
            'applications.*.contact_email' => ['nullable', 'email'],

            'interviews' => ['nullable', 'array'],
            'interviews.*.interview_title' => ['required_with:interviews.*', 'string', 'max:255'],
            'interviews.*.video_path' => ['nullable', 'string'],
            'interviews.*.company_name' => ['nullable', 'string'],
            'interviews.*.job_title' => ['nullable', 'string'],
            'interviews.*.feedback' => ['nullable', 'string'],
            'interviews.*.transcript' => ['nullable', 'string'],

            'posts' => ['nullable', 'array'],
            'posts.*.title' => ['required_with:posts.*', 'string', 'max:255'],
            'posts.*.body' => ['nullable', 'string'],
            'posts.*.media' => ['nullable', 'string'],
            'posts.*.scheduled_at' => ['nullable', 'date'],

            'questions_lists' => ['nullable', 'array'],
            'questions_lists.*.company_name' => ['required_with:questions_lists.*', 'string', 'max:255'],
            'questions_lists.*.job_title' => ['required_with:questions_lists.*', 'string', 'max:255'],
            'questions_lists.*.questions' => ['nullable', 'array'],
            'questions_lists.*.questions.*.question' => ['required_with:questions_lists.*.questions.*', 'string'],
            'questions_lists.*.questions.*.answer' => ['nullable', 'string'],

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
            'applications.*.job_title.required_with' => 'Job title is required for each application.',
            'applications.*.company_name.required_with' => 'Company name is required for each application.',
            'interviews.*.interview_title.required_with' => 'Interview title is required for each interview.',
            'posts.*.title.required_with' => 'Post title is required for each post.',
            'questions_lists.*.company_name.required_with' => 'Company name is required for each questions list.',
            'questions_lists.*.job_title.required_with' => 'Job title is required for each questions list.',
            'questions_lists.*.questions.*.question.required_with' => 'Question is required.',
        ];

    }
}
?>