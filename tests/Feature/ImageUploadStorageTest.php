<?php

use App\Models\Equipo;
use App\Models\PerfilUsuario;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('team creation stores shield path relative to public storage', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('equipos.store'), equipoPayload([
            'escudo_equipo' => UploadedFile::fake()->image('escudo.png'),
        ]))
        ->assertRedirect(route('equipos.index'));

    $path = Equipo::query()->firstOrFail()->escudo_equipo;

    expect($path)
        ->toStartWith('escudos/')
        ->not->toStartWith('storage/')
        ->not->toStartWith('/public/storage/');

    Storage::disk('public')->assertExists($path);
});

test('team update stores new shield path relative to public storage', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    Storage::disk('public')->put('escudos/anterior.png', 'anterior');
    $equipo = Equipo::create([
        'user_id' => $user->id,
        'nombre_equipo' => 'Los Verdes',
        'plantilla' => 0,
        'escudo_equipo' => 'escudos/anterior.png',
    ]);

    $this->actingAs($user)
        ->put(route('equipos.update', $equipo), equipoPayload([
            'nombre_equipo' => 'Los Verdes FC',
            'escudo_equipo' => UploadedFile::fake()->image('nuevo.png'),
        ]))
        ->assertRedirect(route('equipos.index'));

    $path = $equipo->fresh()->escudo_equipo;

    expect($path)
        ->toStartWith('escudos/')
        ->not->toStartWith('storage/')
        ->not->toStartWith('/public/storage/')
        ->not->toBe('escudos/anterior.png');

    Storage::disk('public')->assertExists($path);
    Storage::disk('public')->assertMissing('escudos/anterior.png');
});

test('profile creation stores photo path relative to public storage', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('perfil.store'), perfilPayload([
            'foto_perfil' => UploadedFile::fake()->image('perfil.png'),
        ]))
        ->assertRedirect(route('perfil.show'));

    $path = PerfilUsuario::query()->firstOrFail()->foto_perfil;

    expect($path)
        ->toStartWith('perfiles/')
        ->not->toStartWith('storage/')
        ->not->toStartWith('/public/storage/');

    Storage::disk('public')->assertExists($path);
});

test('profile update stores new photo path relative to public storage', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    Storage::disk('public')->put('perfiles/anterior.png', 'anterior');
    $perfil = PerfilUsuario::create([
        'user_id' => $user->id,
        'nombre' => 'German',
        'apellido' => 'Tester',
        'foto_perfil' => 'perfiles/anterior.png',
    ]);

    $this->actingAs($user)
        ->put(route('perfil.update'), perfilPayload([
            'nombre' => 'German',
            'apellido' => 'Actualizado',
            'foto_perfil' => UploadedFile::fake()->image('nuevo.png'),
        ]))
        ->assertRedirect(route('perfil.show'));

    $path = $perfil->fresh()->foto_perfil;

    expect($path)
        ->toStartWith('perfiles/')
        ->not->toStartWith('storage/')
        ->not->toStartWith('/public/storage/')
        ->not->toBe('perfiles/anterior.png');

    Storage::disk('public')->assertExists($path);
    Storage::disk('public')->assertMissing('perfiles/anterior.png');
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function equipoPayload(array $overrides = []): array
{
    return [
        'nombre_equipo' => 'Los Verdes',
        'plantilla' => 0,
        ...$overrides,
    ];
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function perfilPayload(array $overrides = []): array
{
    return [
        'nombre' => 'German',
        'apellido' => 'Tester',
        ...$overrides,
    ];
}
