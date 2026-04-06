<?php

namespace App\Http\Requests;

use App\Http\Requests\ApiFormRequest;

class SchedulePostRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id'      => 'required|exists:users,id',
            'title'        => 'required|string|max:255',
            'body'         => 'required|string', 
            'media'        => 'nullable|url',
            'scheduled_at' => 'required|date_format:Y-m-d H:i:s', 
        ];
    }

    /**
     * Optional: Custom error messages
     */
    public function messages(): array
    {
        return [
            'title.string' => 'Title must be a string.',
            'body.string'  => 'Body must be a string.',
        ];
    }
}
