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
            'answer_text' => 'nullable|string|min:1',
            'emotion' => 'nullable|string',
            'end_now' => 'nullable|boolean',
        ];
    }
}
