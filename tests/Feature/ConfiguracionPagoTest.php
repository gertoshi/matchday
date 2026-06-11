<?php

use App\Models\ConfiguracionPago;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('user can view payment configuration screen', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('configuracion-pago.edit'))
        ->assertOk();
});

test('user can store encrypted mercado pago credentials', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('configuracion-pago.store'), [
            'modo' => 'test',
            'public_key' => 'TEST_PUBLIC_KEY',
            'access_token' => 'TEST_ACCESS_TOKEN',
            'activo' => true,
        ])
        ->assertRedirect();

    $configuracion = ConfiguracionPago::firstOrFail();
    $raw = DB::table('configuraciones_pago')->where('id', $configuracion->id)->first();

    expect($configuracion->user_id)->toBe($user->id)
        ->and($configuracion->proveedor)->toBe('mercadopago')
        ->and($configuracion->public_key)->toBe('TEST_PUBLIC_KEY')
        ->and($configuracion->access_token)->toBe('TEST_ACCESS_TOKEN')
        ->and($raw->public_key)->not->toBe('TEST_PUBLIC_KEY')
        ->and($raw->access_token)->not->toBe('TEST_ACCESS_TOKEN');
});

test('user can update payment configuration without replacing access token', function () {
    $user = User::factory()->create();

    ConfiguracionPago::create([
        'user_id' => $user->id,
        'proveedor' => 'mercadopago',
        'public_key' => 'OLD_PUBLIC_KEY',
        'access_token' => 'OLD_ACCESS_TOKEN',
        'activo' => true,
        'modo' => 'test',
    ]);

    $this->actingAs($user)
        ->put(route('configuracion-pago.update'), [
            'modo' => 'produccion',
            'public_key' => 'NEW_PUBLIC_KEY',
            'access_token' => '',
            'activo' => false,
        ])
        ->assertRedirect();

    $configuracion = $user->configuracionPago()->firstOrFail();

    expect($configuracion->modo)->toBe('produccion')
        ->and($configuracion->public_key)->toBe('NEW_PUBLIC_KEY')
        ->and($configuracion->access_token)->toBe('OLD_ACCESS_TOKEN')
        ->and($configuracion->activo)->toBeFalse();
});
