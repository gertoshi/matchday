<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Jugador extends Model
{
    use HasFactory;

    protected $table = 'jugadores';

    protected $fillable = [
        'equipo_id',
        'nombre_jugador',
        'apellido_jugador',
        'contacto_jugador',
        'posicion_jugador',
        'numero_jugador',
        'sexo_jugador',
    ];

    //Relacion:
    //Un Jugador pertenece a un Equipo
    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class);
    }
}
