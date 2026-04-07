<?php

namespace App\Http\Requests;

class CreateLinkedinPostRequest extends ApiFormRequest
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
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'media' => 'nullable|url',
            'scheduled_at' => 'nullable|date',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Title is required.',
            'title.max' => 'Title may not be greater than 255 characters.',
            'body.required' => 'Body is required.',
            'media.url' => 'Media must be a valid URL.',
            'scheduled_at.date' => 'Scheduled at must be a valid date.',
        ];
    }
}

