<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FixtureGrupo extends Model
{
    use HasFactory;

    protected $table = 'fixture_grupos';

    protected $fillable = [
        'evento_id',
        'nombre_grupo',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Evento::class);
    }

    public function equiposGrupo(): HasMany
    {
        return $this->hasMany(FixtureGrupoEquipo::class);
    }

    public function equipos(): BelongsToMany
    {
        return $this->belongsToMany(Equipo::class, 'fixture_grupo_equipos')
            ->withPivot([
                'posicion',
                'puntos',
                'partidos_jugados',
                'ganados',
                'empatados',
                'perdidos',
                'goles_favor',
                'goles_contra',
                'diferencia_goles',
            ])
            ->withTimestamps();
    }
}
