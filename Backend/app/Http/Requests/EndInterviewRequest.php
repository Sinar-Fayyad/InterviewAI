<?php

namespace App\Http\Requests;

class EndInterviewRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'video' => 'required|file|mimes:webm,mp4',
            'interview_title' => 'nullable|string|max:255',
            'feedback' => 'nullable|string',
        ];
    }
}
