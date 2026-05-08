<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inscripcion extends Model
{
    use HasFactory;

    protected $table = 'inscripciones';

    protected $fillable = [
        'evento_id',
        'equipo_id',
        'fecha_inscripcion',
        'estado_inscripcion',
        'cuota_inscripcion',
        'cuota_pagada',
        'fecha_pago',
        'metodo_pago',
        'observaciones',
    ];

    //Relacion:
    //Esta Inscripcion pertenecen a un evento
    public function evento(): BelongsTo
    {
        return $this->belongsTo(Evento::class);
    }

    //Relacion:
    //Esta inscripcion pueden pertenecer a un solo equipo
    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class);
    }

    protected function casts(): array
    {
        return [
            'fecha_inscripcion' => 'datetime',
            'fecha_pago' => 'datetime',
            'cuota_inscripcion' => 'decimal:2',
            'cuota_pagada' => 'boolean',
        ];
    }
}
