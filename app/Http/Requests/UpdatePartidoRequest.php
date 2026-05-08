<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePartidoRequest extends FormRequest
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
            'fecha_hora' => [
                'required',
                'date',
            ],

            'ubicacion_partido' => [
                'required',
                'string',
                'max:255',
            ],

            'marcador_partido' => [
                'nullable',
                'string',
                'max:255',
            ],

            'ganador_partido' => [
                'nullable',
                'string',
                'max:255',
            ],

            'categoria_partido' => [
                'required',
                'in:Infantil,Adolescente,Juvenil,Senior',
            ],
        ];
    }
}
