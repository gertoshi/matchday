<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evento extends Model
{
    use HasFactory;

    protected $table = 'eventos';

    protected $fillable = [
        'user_id',
        'nombre_evento',
        'ubicacion_evento',
        'cupo_evento',
        'estado_evento',
        'fecha_inicio',
        'fecha_fin',
        'descripcion_evento',
        'formato_evento',
        'tipo_inscripcion',
        'monto_inscripcion',
    ];

    // Relacion:
    // Un Evento pertenece a un usuario
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relacion:
    // Un evento tiene muchos partidos
    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class);
    }

    public function fixtureGrupos(): HasMany
    {
        return $this->hasMany(FixtureGrupo::class);
    }

    // Relacion:
    // Un evento tiene muhcas inscripciones
    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class);
    }

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'monto_inscripcion' => 'decimal:2',
        ];
    }
}
