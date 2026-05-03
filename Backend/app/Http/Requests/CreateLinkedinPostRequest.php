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
        'description' => 'required|string',

        'image_description' => 'nullable|string',

        'image_style' => 'nullable|string|in:realistic,illustration,three_d,minimal,comic,professional_poster',

        'image_mood' => 'nullable|string|in:professional,friendly,inspirational,modern,confident',

        'image_colors' => 'nullable|string|in:blue_purple,black_white,warm,pastel,custom',
        'custom_image_colors' => 'nullable|string|max:100',

        'image_people' => 'nullable|string|in:no_people,female,male,group_of_people',

        'image_text_option' => 'nullable|string|in:no_text,short_title,custom_text',
        'image_text' => 'nullable|string|max:255',
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
            'description.required' => 'Description is required.',
            'description.string' => 'Description must be a string.',
        ];
    }
}

