<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEquipoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre_equipo' => [
                'required',
                'string',
                'max:100',
            ],
            'plantilla' => [
                'nullable',
                'integer',
                'min:0',
                'max:50',
            ],
            'escudo_equipo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ];
    }
}
