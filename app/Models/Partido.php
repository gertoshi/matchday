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
        'fecha_hora',
        'ubicacion_partido',
        'marcador_partido',
        'ganador_partido',
        'categoria_partido',
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
}
