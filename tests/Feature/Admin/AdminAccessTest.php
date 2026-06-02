<?php

use App\Models\Sancion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guest is redirected away from admin panel', function () {
    $this->get('/admin')->assertRedirect(route('login'));
});

test('regular user cannot access admin panel', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/admin')
        ->assertForbidden();
});

test('admin can access admin panel', function () {
    $admin = User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)
        ->get('/admin')
        ->assertOk();
});

test('admin can suspend a user and create a sanction', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.usuarios.suspender', $user), [
            'motivo' => 'Conducta antideportiva',
            'duracion_dias' => 7,
            'comentarios' => 'Revisión administrativa.',
        ])
        ->assertRedirect();

    expect($user->refresh()->status)->toBe('suspendido')
        ->and(Sancion::where('user_id', $user->id)->where('tipo', 'suspension')->exists())->toBeTrue();
});

test('admin cannot sanction own user', function () {
    $admin = User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)
        ->post(route('admin.usuarios.banear', $admin), [
            'motivo' => 'No permitido',
        ])
        ->assertStatus(422);
});
