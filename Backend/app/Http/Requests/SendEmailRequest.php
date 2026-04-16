<?php

namespace App\Http\Requests;

class SendEmailRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'to' => 'required|email',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'to.required' => 'The recipient email is required.',
            'to.email' => 'The recipient must be a valid email address.',
            'subject.required' => 'The email subject is required.',
            'subject.max' => 'The subject may not be greater than 255 characters.',
            'body.required' => 'The email body is required.',
        ];
    }
}

