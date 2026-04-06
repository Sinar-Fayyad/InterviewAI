<?php

namespace App\Http\Requests;

use App\Http\Requests\ApiFormRequest;

class UserUpdateRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $input = $this->all();
        foreach ($input as $key => $value) {
            if (is_string($value)) {
                $input[$key] = trim($value);
            }
        }
        $this->merge($input);
    }

    public function rules(): array
    {
        return [
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,' . $this->route('id')],
            'phone' => ['nullable', 'string', 'min:8', 'max:20'],
            'location' => ['nullable', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already taken.',
            'email.email' => 'Please provide a valid email.',
            'phone.min' => 'The phone number must be at least 8 characters.',
        ];
    }
}

