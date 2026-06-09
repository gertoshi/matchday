<?php

use App\Models\Sancion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('banned users cannot authenticate', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user = User::factory()->create(['status' => 'bloqueado']);

    Sancion::create([
        'user_id' => $user->id,
        'admin_id' => $admin->id,
        'tipo' => 'baneo',
        'motivo' => 'Conducta antideportiva',
        'fecha_inicio' => now(),
        'fecha_fin' => null,
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('suspended users can browse get routes but cannot perform write actions', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user = User::factory()->create(['status' => 'suspendido']);

    Sancion::create([
        'user_id' => $user->id,
        'admin_id' => $admin->id,
        'tipo' => 'suspension',
        'motivo' => 'Incumplimiento de reglas',
        'duracion_dias' => 7,
        'fecha_inicio' => now(),
        'fecha_fin' => now()->addDays(7),
    ]);

    $this->actingAs($user)
        ->get(route('equipos.index'))
        ->assertOk();

    $this->actingAs($user)
        ->from(route('equipos.index'))
        ->post(route('equipos.store'), [
            'nombre_equipo' => 'Equipo Bloqueado',
            'plantilla' => 0,
        ])
        ->assertRedirect(route('equipos.index'))
        ->assertSessionHas('error', 'Tu cuenta está suspendida y no podés realizar esta acción.');
});

test('reactivating users closes active sanctions', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user = User::factory()->create(['status' => 'suspendido']);

    $sancion = Sancion::create([
        'user_id' => $user->id,
        'admin_id' => $admin->id,
        'tipo' => 'suspension',
        'motivo' => 'Incumplimiento de reglas',
        'fecha_inicio' => now(),
        'fecha_fin' => now()->addDays(7),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.usuarios.reactivar', $user))
        ->assertRedirect();

    expect($user->refresh()->status)->toBe('activo')
        ->and($sancion->refresh()->fecha_fin->isPast())->toBeTrue();
});
