<?php

use App\Models\Equipo;
use App\Models\Evento;
use App\Models\Inscripcion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('paid event inscription must use mercado pago flow', function () {
    $organizer = User::factory()->create();
    $user = User::factory()->create();
    Equipo::create([
        'user_id' => $user->id,
        'nombre_equipo' => 'Equipo Pago',
        'plantilla' => 0,
        'estado_equipo' => 'activo',
    ]);
    $evento = createEventoCuota($organizer, 'pago', 5000);

    $this->actingAs($user)
        ->post(route('inscripciones.store'), [
            'evento_id' => $evento->id,
            'cuota_inscripcion' => 1,
        ])
        ->assertRedirect(route('inscripciones.create', ['evento_id' => $evento->id]))
        ->assertSessionHas('error', 'Para inscribirte a este torneo tenés que pagar con Mercado Pago.');

    expect(Inscripcion::count())->toBe(0);
});

test('free event inscription stores no fee', function () {
    $organizer = User::factory()->create();
    $user = User::factory()->create();
    Equipo::create([
        'user_id' => $user->id,
        'nombre_equipo' => 'Equipo Gratis',
        'plantilla' => 0,
        'estado_equipo' => 'activo',
    ]);
    $evento = createEventoCuota($organizer, 'gratis', null);

    $this->actingAs($user)
        ->post(route('inscripciones.store'), [
            'evento_id' => $evento->id,
        ])
        ->assertRedirect(route('inscripciones.index'));

    $inscripcion = Inscripcion::firstOrFail();

    expect((float) $inscripcion->cuota_inscripcion)->toBe(0.0)
        ->and($inscripcion->cuota_pagada)->toBeTrue()
        ->and($inscripcion->metodo_pago)->toBe('gratis');
});

test('mercado pago preference requires organizer payment configuration', function () {
    $organizer = User::factory()->create();
    $user = User::factory()->create();
    Equipo::create([
        'user_id' => $user->id,
        'nombre_equipo' => 'Equipo Pago',
        'plantilla' => 0,
        'estado_equipo' => 'activo',
    ]);
    $evento = createEventoCuota($organizer, 'pago', 2000);

    $this->actingAs($user)
        ->post(route('mercadopago.preferencia', $evento))
        ->assertRedirect()
        ->assertSessionHas('error', 'El organizador todavía no configuró su cuenta de Mercado Pago.');

    expect(Inscripcion::count())->toBe(0);
});

function createEventoCuota(User $organizer, string $tipoInscripcion, ?int $monto): Evento
{
    return Evento::create([
        'user_id' => $organizer->id,
        'nombre_evento' => 'Torneo Cuota',
        'ubicacion_evento' => 'Cancha Central',
        'cupo_evento' => 8,
        'estado_evento' => 'abierto',
        'fecha_inicio' => now()->addDay()->toDateString(),
        'fecha_fin' => now()->addWeek()->toDateString(),
        'descripcion_evento' => null,
        'formato_evento' => 'Fútbol 5',
        'tipo_inscripcion' => $tipoInscripcion,
        'monto_inscripcion' => $monto,
    ]);
}
