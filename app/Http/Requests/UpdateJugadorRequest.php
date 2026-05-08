<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJugadorRequest extends FormRequest
{
    /**
     * Autorizar la petición
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas de validación
     */
    public function rules(): array
    {
        return [
            'nombre_jugador' => [
                'required',
                'string',
                'max:100',
            ],
            'apellido_jugador' => [
                'required',
                'string',
                'max:100',
            ],
            'contacto_jugador' => [
                'nullable',
                'string',
                'max:20',
            ],
            'posicion_jugador' => [
                'required',
                'in:arquero,defensor,mediocampista,delantero',
            ],
            'numero_jugador' => [
                'required',
                'integer',
                'min:1',
                'max:99',
            ],
            'sexo_jugador' => [
                'required',
                'in:masculino,femenino',
            ],
        ];
    }
}
