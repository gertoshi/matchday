<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipo extends Model
{
    use HasFactory;

    protected $table = 'equipos';

    // campos que se pueden guardar
    protected $fillable = [
        'user_id',
        'nombre_equipo',
        'escudo_equipo',
        'plantilla',
        'estado_equipo',
    ];

    /*
    RELACIÓN
    Este equipo pertenece a un usuario
    equipo.user_id → users.id
    */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relacion:
    // Un equipo tiene muchos jugadores
    public function jugadores(): HasMany
    {
        return $this->hasMany(Jugador::class);
    }

    // Relacion:
    // Un equipo tiene muchas inscripciones
    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class);
    }
}
