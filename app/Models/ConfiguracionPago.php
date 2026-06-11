<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfiguracionPago extends Model
{
    protected $table = 'configuraciones_pago';

    protected $fillable = [
        'user_id',
        'proveedor',
        'public_key',
        'access_token',
        'activo',
        'modo',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'public_key' => 'encrypted',
            'access_token' => 'encrypted',
            'activo' => 'boolean',
        ];
    }
}
