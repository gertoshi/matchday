<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reporte extends Model
{
    protected $table = 'reportes';

    protected $fillable = [
        'usuario_reportado_id',
        'usuario_reportante_id',
        'motivo',
        'descripcion',
        'estado',
    ];

    public function usuarioReportado(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_reportado_id');
    }

    public function usuarioReportante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_reportante_id');
    }
}
