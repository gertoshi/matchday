<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerfilUsuario extends Model
{
    // Permite usar factories para testing o seeders
    use HasFactory;

    /**
     * Nombre de la tabla
     * Porque no sigue el plural estándar de Laravel
     */
    protected $table = 'perfil_usuario';

    /**
     * Campos que se pueden guardar masivamente
     * (Mass Assignment)
     */
    protected $fillable = [

        'user_id',

        'nombre',

        'apellido',

        'foto_perfil',

    ];

    /**
     * RELACION:
     * Este perfil pertenece a un usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
