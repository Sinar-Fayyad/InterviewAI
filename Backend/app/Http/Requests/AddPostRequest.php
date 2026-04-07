<?php

namespace App\Http\Requests;


class AddPostRequest extends ApiFormRequest
{
    public function rules()
    {
        return [
            'user_id' => 'required|integer|exists:users,id',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'media' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
        ];
    }

    public function messages()
    {
        return [
            'user_id.required' => 'User ID is required.',
            'user_id.exists' => 'User not found.',
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
