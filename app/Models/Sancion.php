<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sancion extends Model
{
    protected $table = 'sanciones';

    protected $fillable = [
        'user_id',
        'admin_id',
        'tipo',
        'motivo',
        'duracion_dias',
        'comentarios',
        'fecha_inicio',
        'fecha_fin',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'datetime',
            'fecha_fin' => 'datetime',
        ];
    }
}
