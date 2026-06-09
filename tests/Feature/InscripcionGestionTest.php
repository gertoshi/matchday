<?php

use App\Models\Equipo;
use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('organizer can accept and reject tournament inscriptions', function () {
    $organizer = User::factory()->create();
    $evento = createEventoGestion($organizer);
    $inscripcion = createInscripcionGestion($evento);

    $this->actingAs($organizer)
        ->post(route('inscripciones.aceptar', $inscripcion))
        ->assertRedirect();

    expect($inscripcion->fresh()->estado_inscripcion)->toBe('confirmada');

    $this->actingAs($organizer)
        ->post(route('inscripciones.rechazar', $inscripcion))
        ->assertRedirect();

    expect($inscripcion->fresh()->estado_inscripcion)->toBe('rechazada');
});

test('admin can manage inscriptions for any tournament', function () {
    $organizer = User::factory()->create();
    $admin = User::factory()->create(['is_admin' => true]);
    $inscripcion = createInscripcionGestion(createEventoGestion($organizer));

    $this->actingAs($admin)
        ->post(route('inscripciones.aceptar', $inscripcion))
        ->assertRedirect();

    expect($inscripcion->fresh()->estado_inscripcion)->toBe('confirmada');
});

test('accepting the last available inscription moves tournament to in progress', function () {
    $organizer = User::factory()->create();
    $evento = createEventoGestion($organizer, ['cupo_evento' => 1]);
    $inscripcion = createInscripcionGestion($evento);

    $this->actingAs($organizer)
        ->post(route('inscripciones.aceptar', $inscripcion))
        ->assertRedirect();

    expect($inscripcion->fresh()->estado_inscripcion)->toBe('confirmada')
        ->and($evento->fresh()->estado_evento)->toBe('en_curso');
});

test('organizer cannot accept an inscription when tournament quota is full', function () {
    $organizer = User::factory()->create();
    $evento = createEventoGestion($organizer, ['cupo_evento' => 1]);

    createInscripcionGestion($evento, ['estado_inscripcion' => 'confirmada']);
    $pendiente = createInscripcionGestion($evento);

    $this->actingAs($organizer)
        ->post(route('inscripciones.aceptar', $pendiente))
        ->assertRedirect()
        ->assertSessionHas('error', 'El torneo ya completó su cupo.');

    expect($pendiente->fresh()->estado_inscripcion)->toBe('pendiente');
});

test('normal users cannot manage inscriptions for another tournament', function () {
    $organizer = User::factory()->create();
    $user = User::factory()->create();
    $inscripcion = createInscripcionGestion(createEventoGestion($organizer));

    $this->actingAs($user)
        ->post(route('inscripciones.aceptar', $inscripcion))
        ->assertForbidden();

    expect($inscripcion->fresh()->estado_inscripcion)->toBe('pendiente');
});

function createEventoGestion(User $organizer, array $overrides = []): Evento
{
    return Evento::create(array_merge([
        'user_id' => $organizer->id,
        'nombre_evento' => 'Torneo Gestion',
        'ubicacion_evento' => 'Cancha Central',
        'cupo_evento' => 8,
        'estado_evento' => 'abierto',
        'fecha_inicio' => now()->addDay()->toDateString(),
        'fecha_fin' => now()->addWeek()->toDateString(),
        'descripcion_evento' => null,
        'formato_evento' => 'futbol_5',
        'tipo_inscripcion' => 'gratis',
        'monto_inscripcion' => null,
    ], $overrides));
}

function createInscripcionGestion(Evento $evento, array $overrides = []): Inscripcion
{
    $user = User::factory()->create();
    $equipo = Equipo::create([
        'user_id' => $user->id,
        'nombre_equipo' => 'Equipo Pendiente',
        'plantilla' => 0,
        'estado_equipo' => 'activo',
    ]);

    return Inscripcion::create(array_merge([
        'evento_id' => $evento->id,
        'equipo_id' => $equipo->id,
        'fecha_inscripcion' => now(),
        'estado_inscripcion' => 'pendiente',
        'cuota_inscripcion' => 0,
        'cuota_pagada' => false,
    ], $overrides));
}
