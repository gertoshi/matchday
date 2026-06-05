<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixtureGrupoEquipo extends Model
{
    use HasFactory;

    protected $table = 'fixture_grupo_equipos';

    protected $fillable = [
        'fixture_grupo_id',
        'equipo_id',
        'posicion',
        'puntos',
        'partidos_jugados',
        'ganados',
        'empatados',
        'perdidos',
        'goles_favor',
        'goles_contra',
        'diferencia_goles',
    ];

    public function fixtureGrupo(): BelongsTo
    {
        return $this->belongsTo(FixtureGrupo::class);
    }

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class);
    }
}
