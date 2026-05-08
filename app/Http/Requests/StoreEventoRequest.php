<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre_evento' => [
                'required',
                'string',
                'max:255',
            ],

            'ubicacion_evento' => [
                'required',
                'string',
                'max:255',
            ],

            'cupo_evento' => [
                'required',
                'integer',
                'min:2',
                'max:100',
            ],

            'fecha_inicio' => [
                'required',
                'date',
            ],

            'fecha_fin' => [
                'required',
                'date',
                'after_or_equal:fecha_inicio',
            ],

            'formato_evento' => [
                'required',
                'string',
                'max:255',
            ],

            'estado_evento' => [
                'nullable',
                'in:abierto,cerrado,finalizado',
            ],

            'descripcion_evento' => [
                'nullable',
                'string',
            ],
        ];
    }
}
