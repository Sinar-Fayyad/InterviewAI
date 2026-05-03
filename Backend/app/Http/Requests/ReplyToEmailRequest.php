<?php

namespace App\Http\Requests;

class ReplyToEmailRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email_id' => 'required|string',
            'reply_content' => 'required|string',
            'context' => 'sometimes|string',
        ];
    }

    public function messages(): array
    {
        return [
            'email_id.required' => 'Email ID is required.',
            'reply_content.required' => 'Reply content is required.',
        ];
    }
}

?>