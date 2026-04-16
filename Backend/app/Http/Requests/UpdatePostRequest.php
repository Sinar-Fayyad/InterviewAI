<?php

namespace App\Http\Requests;

use App\Http\Requests\ApiFormRequest;

class UpdatePostRequest extends ApiFormRequest
{
    public function rules()
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'body' => 'sometimes|required|string',
            'media' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'Title is required.',
            'title.max' => 'Title may not be greater than 255 characters.',
            'body.required' => 'Body is required.',
            'media.string' => 'Media must be a valid string (URL/path).',
            'scheduled_at.date' => 'Scheduled at must be a valid date.',
        ];
    }

    public function authorize()
    {
        return true;
    }
}
