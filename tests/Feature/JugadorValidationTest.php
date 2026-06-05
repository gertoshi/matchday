<?php

use App\Models\Equipo;
use App\Models\Jugador;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('player shirt number must be between one and ten', function () {
    $user = User::factory()->create();

    Equipo::create([
        'user_id' => $user->id,
        'nombre_equipo' => 'Los Verdes',
        'plantilla' => 0,
        'estado_equipo' => 'activo',
    ]);

    $this->actingAs($user)
        ->post(route('jugadores.store'), jugadorPayload(['numero_jugador' => 11]))
        ->assertSessionHasErrors('numero_jugador');
});

test('player shirt number cannot be duplicated in the same team', function () {
    $user = User::factory()->create();
    $equipo = Equipo::create([
        'user_id' => $user->id,
        'nombre_equipo' => 'Los Verdes',
        'plantilla' => 0,
        'estado_equipo' => 'activo',
    ]);

    Jugador::create([
        'equipo_id' => $equipo->id,
        ...jugadorPayload(['numero_jugador' => 7]),
    ]);

    $this->actingAs($user)
        ->post(route('jugadores.store'), jugadorPayload(['numero_jugador' => 7]))
        ->assertSessionHasErrors([
            'numero_jugador' => 'Ese número de camiseta ya está asignado a otro jugador.',
        ]);
});

test('player update can keep current shirt number but cannot use another teammate number', function () {
    $user = User::factory()->create();
    $equipo = Equipo::create([
        'user_id' => $user->id,
        'nombre_equipo' => 'Los Verdes',
        'plantilla' => 0,
        'estado_equipo' => 'activo',
    ]);

    $jugador = Jugador::create([
        'equipo_id' => $equipo->id,
        ...jugadorPayload(['numero_jugador' => 4]),
    ]);

    Jugador::create([
        'equipo_id' => $equipo->id,
        ...jugadorPayload([
            'nombre_jugador' => 'Pedro',
            'numero_jugador' => 8,
        ]),
    ]);

    $this->actingAs($user)
        ->put(route('jugadores.update', $jugador), jugadorPayload(['numero_jugador' => 4]))
        ->assertRedirect();

    $this->actingAs($user)
        ->from(route('jugadores.edit', $jugador))
        ->put(route('jugadores.update', $jugador), jugadorPayload(['numero_jugador' => 8]))
        ->assertSessionHasErrors([
            'numero_jugador' => 'Ese número de camiseta ya está asignado a otro jugador.',
        ]);
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function jugadorPayload(array $overrides = []): array
{
    return [
        'nombre_jugador' => 'Juan',
        'apellido_jugador' => 'Perez',
        'contacto_jugador' => '3511234567',
        'posicion_jugador' => 'arquero',
        'numero_jugador' => 1,
        'sexo_jugador' => 'masculino',
        ...$overrides,
    ];
}
