<?php

namespace App\Http\Requests;

class SubmitAnswerRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'audio' => 'required|file|mimes:webm,wav,mp3|max:10240', // 10MB
            'emotion' => 'nullable|string|in:happy,sad,neutral,excited,anxious',
            'end_now' => 'nullable|boolean',
        ];
    }
}
