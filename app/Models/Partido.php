<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Partido extends Model
{
    use HasFactory;

    protected $table = 'partidos';

    protected $fillable = [
        'evento_id',
        'equipo_local_id',
        'equipo_visitante_id',
        'fecha_hora',
        'ubicacion_partido',
        'marcador_partido',
        'ganador_partido',
        'categoria_partido',
        'fase',
        'grupo_id',
        'goles_local',
        'goles_visitante',
        'estado_partido',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELACIONES
    |--------------------------------------------------------------------------
    */

    // Un partido pertenece a un evento

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Evento::class);
    }

    public function equipoLocal(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_local_id');
    }

    public function equipoVisitante(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_visitante_id');
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(FixtureGrupo::class, 'grupo_id');
    }
}
