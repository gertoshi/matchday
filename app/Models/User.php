<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'birth_date',
        'phone',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    public function perfilUsuario(): HasOne
    {
        return $this->hasOne(PerfilUsuario::class);
    }

    public function equipo(): HasOne
    {
        return $this->hasOne(Equipo::class);
    }

    public function eventos(): HasMany
    {
        return $this->hasMany(Evento::class);
    }

    public function sanciones(): HasMany
    {
        return $this->hasMany(Sancion::class);
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    public function isActive(): bool
    {
        return $this->status === 'activo';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspendido'
            || $this->sancionActiva()?->tipo === 'suspension';
    }

    public function isBanned(): bool
    {
        return in_array($this->status, ['bloqueado', 'eliminado'], true)
            || $this->sancionActiva()?->tipo === 'baneo';
    }

    public function sancionActiva(): ?Sancion
    {
        return $this->sanciones()
            ->where(function ($query): void {
                $query->where(function ($query): void {
                    $query->where('tipo', 'suspension')
                        ->where(function ($query): void {
                            $query->whereNull('fecha_fin')
                                ->orWhere('fecha_fin', '>=', now());
                        });
                })->orWhere(function ($query): void {
                    $query->where('tipo', 'baneo')
                        ->where(function ($query): void {
                            $query->whereNull('fecha_fin')
                                ->orWhere('fecha_fin', '>=', now());
                        });
                });
            })
            ->latest()
            ->first();
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'birth_date' => 'date',
            'is_admin' => 'boolean',
        ];
    }
}
