<?php

namespace App\Http\Requests;

use App\Models\Jugador;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $jugador = $this->route('jugador');
        $jugadorId = $jugador instanceof Jugador ? $jugador->id : null;
        $equipoId = $jugador instanceof Jugador ? $jugador->equipo_id : $this->user()?->equipo?->id;

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
                'max:10',
                Rule::unique('jugadores', 'numero_jugador')
                    ->where('equipo_id', $equipoId)
                    ->ignore($jugadorId),
            ],
            'sexo_jugador' => [
                'required',
                'in:masculino,femenino',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'numero_jugador.unique' => 'Ese número de camiseta ya está asignado a otro jugador.',
        ];
    }
}
