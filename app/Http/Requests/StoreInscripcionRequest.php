<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInscripcionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'evento_id' => [
                'required',
                'exists:eventos,id',
            ],
            'observaciones' => [
                'nullable',
                'string',
            ],
        ];
    }
}
