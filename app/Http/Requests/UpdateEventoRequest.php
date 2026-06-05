<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventoRequest extends FormRequest
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
                'in:4,8',
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

            'tipo_inscripcion' => [
                'required',
                'in:gratis,pago',
            ],

            'monto_inscripcion' => [
                'nullable',
                'required_if:tipo_inscripcion,pago',
                'numeric',
                'min:1',
            ],

            'estado_evento' => [
                'required',
                'in:abierto,cerrado,finalizado',
            ],

            'descripcion_evento' => [
                'nullable',
                'string',
            ],
        ];
    }
}
