<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInscripcionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado_inscripcion' => [
                'nullable',
                'in:pendiente,confirmada,rechazada,cancelada',
            ],
            'cuota_inscripcion' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            'cuota_pagada' => [
                'nullable',
                'boolean',
            ],
            'fecha_pago' => [
                'nullable',
                'date',
            ],
            'metodo_pago' => [
                'nullable',
                'string',
                'max:50',
            ],
            'observaciones' => [
                'nullable',
                'string',
            ],
        ];
    }
}
