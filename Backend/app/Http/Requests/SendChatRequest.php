<?php

namespace App\Http\Requests;

class SendChatRequest extends ApiFormRequest
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
     */
    public function rules(): array
    {
        return [
            'collection_id' => 'required|string',
            'message' => 'required|string',
            'chat_history' => 'nullable|array', 
        ];
    }

    /**
     * Get custom validation error messages.
     */
    public function messages(): array
    {
        return [
            'message.required' => 'The message is required.',
            'message.string' => 'The message must be a string.',
            'collection_id.required' => 'The collection ID is required.',
            'collection_id.string' => 'The collection ID must be a string.',
            'chat_history.array' => 'The chat history must be an array.',
        ];
    }
}

