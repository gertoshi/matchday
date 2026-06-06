<?php

use App\Models\Equipo;
use App\Models\Evento;
use App\Models\FixtureGrupo;
use App\Models\FixtureGrupoEquipo;
use App\Models\Inscripcion;
use App\Models\Partido;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('organizer can generate fixture when tournament is full', function () {
    $organizer = User::factory()->create();
    $evento = createEvento($organizer, 8);
    createInscripciones($evento, 8);

    $this->actingAs($organizer)
        ->post(route('eventos.fixture.generar', $evento))
        ->assertRedirect(route('eventos.fixture.show', $evento));

    expect(FixtureGrupo::where('evento_id', $evento->id)->count())->toBe(2)
        ->and(FixtureGrupoEquipo::count())->toBe(8)
        ->and(Partido::where('evento_id', $evento->id)->where('fase', 'grupo')->count())->toBe(12);
});

test('fixture cannot be generated before cup is full', function () {
    $organizer = User::factory()->create();
    $evento = createEvento($organizer, 8);
    createInscripciones($evento, 7);

    $this->actingAs($organizer)
        ->from(route('eventos.fixture.show', $evento))
        ->post(route('eventos.fixture.generar', $evento))
        ->assertRedirect(route('eventos.fixture.show', $evento));

    expect(FixtureGrupo::where('evento_id', $evento->id)->count())->toBe(0)
        ->and(Partido::where('evento_id', $evento->id)->count())->toBe(0);
});

test('normal users cannot generate fixture for another tournament', function () {
    $organizer = User::factory()->create();
    $user = User::factory()->create();
    $evento = createEvento($organizer, 8);
    createInscripciones($evento, 8);

    $this->actingAs($user)
        ->post(route('eventos.fixture.generar', $evento))
        ->assertForbidden();

    expect(FixtureGrupo::where('evento_id', $evento->id)->count())->toBe(0);
});

test('fixture is not generated twice', function () {
    $organizer = User::factory()->create();
    $evento = createEvento($organizer, 8);
    createInscripciones($evento, 8);

    $this->actingAs($organizer)
        ->post(route('eventos.fixture.generar', $evento));

    $this->actingAs($organizer)
        ->post(route('eventos.fixture.generar', $evento))
        ->assertRedirect(route('eventos.fixture.show', $evento));

    expect(FixtureGrupo::where('evento_id', $evento->id)->count())->toBe(2)
        ->and(Partido::where('evento_id', $evento->id)->count())->toBe(12);
});

test('organizer can update result and group standings are recalculated', function () {
    $organizer = User::factory()->create();
    $evento = createEvento($organizer, 8);
    createInscripciones($evento, 8);

    $this->actingAs($organizer)
        ->post(route('eventos.fixture.generar', $evento));

    $partido = Partido::query()
        ->where('evento_id', $evento->id)
        ->firstOrFail();

    $this->actingAs($organizer)
        ->put(route('partidos.resultado.update', $partido), [
            'goles_local' => 2,
            'goles_visitante' => 1,
        ])
        ->assertRedirect();

    $partido->refresh();

    $local = FixtureGrupoEquipo::query()
        ->where('fixture_grupo_id', $partido->grupo_id)
        ->where('equipo_id', $partido->equipo_local_id)
        ->firstOrFail();

    $visitante = FixtureGrupoEquipo::query()
        ->where('fixture_grupo_id', $partido->grupo_id)
        ->where('equipo_id', $partido->equipo_visitante_id)
        ->firstOrFail();

    expect($partido->marcador_partido)->toBe('2 - 1')
        ->and($partido->estado_partido)->toBe('jugado')
        ->and($local->puntos)->toBe(3)
        ->and($local->ganados)->toBe(1)
        ->and($local->diferencia_goles)->toBe(1)
        ->and($visitante->puntos)->toBe(0)
        ->and($visitante->perdidos)->toBe(1);
});

test('played result cannot be updated again', function () {
    $organizer = User::factory()->create();
    $evento = createEvento($organizer, 8);
    createInscripciones($evento, 8);

    $this->actingAs($organizer)
        ->post(route('eventos.fixture.generar', $evento));

    $partido = Partido::query()
        ->where('evento_id', $evento->id)
        ->firstOrFail();

    $this->actingAs($organizer)
        ->put(route('partidos.resultado.update', $partido), [
            'goles_local' => 2,
            'goles_visitante' => 1,
        ]);

    $this->actingAs($organizer)
        ->from(route('eventos.fixture.show', $evento))
        ->put(route('partidos.resultado.update', $partido), [
            'goles_local' => 3,
            'goles_visitante' => 0,
        ])
        ->assertSessionHasErrors([
            'resultado' => 'El resultado de este partido ya fue cargado y no puede modificarse.',
        ]);

    expect($partido->fresh()->marcador_partido)->toBe('2 - 1');
});

test('semifinals and final are generated for eight team tournament', function () {
    $organizer = User::factory()->create();
    $evento = createEvento($organizer, 8);
    createInscripciones($evento, 8);

    $this->actingAs($organizer)
        ->post(route('eventos.fixture.generar', $evento));

    Partido::query()
        ->where('evento_id', $evento->id)
        ->where('fase', 'grupo')
        ->get()
        ->each(function (Partido $partido) use ($organizer): void {
            $this->actingAs($organizer)
                ->put(route('partidos.resultado.update', $partido), [
                    'goles_local' => 1,
                    'goles_visitante' => 0,
                ])
                ->assertRedirect();
        });

    expect(Partido::where('evento_id', $evento->id)->where('fase', 'semifinal')->count())->toBe(2)
        ->and(Partido::where('evento_id', $evento->id)->where('fase', 'final')->count())->toBe(0);

    Partido::query()
        ->where('evento_id', $evento->id)
        ->where('fase', 'semifinal')
        ->get()
        ->each(function (Partido $partido) use ($organizer): void {
            $this->actingAs($organizer)
                ->put(route('partidos.resultado.update', $partido), [
                    'goles_local' => 2,
                    'goles_visitante' => 1,
                ])
                ->assertRedirect();
        });

    expect(Partido::where('evento_id', $evento->id)->where('fase', 'final')->count())->toBe(1);
});

test('normal users cannot update results', function () {
    $organizer = User::factory()->create();
    $user = User::factory()->create();
    $evento = createEvento($organizer, 8);
    createInscripciones($evento, 8);

    $this->actingAs($organizer)
        ->post(route('eventos.fixture.generar', $evento));

    $partido = Partido::query()
        ->where('evento_id', $evento->id)
        ->firstOrFail();

    $this->actingAs($user)
        ->put(route('partidos.resultado.update', $partido), [
            'goles_local' => 2,
            'goles_visitante' => 1,
        ])
        ->assertForbidden();

    expect($partido->fresh()->estado_partido)->toBe('pendiente');
});

test('admin can update results for any tournament', function () {
    $organizer = User::factory()->create();
    $admin = User::factory()->create(['is_admin' => true]);
    $evento = createEvento($organizer, 8);
    createInscripciones($evento, 8);

    $this->actingAs($organizer)
        ->post(route('eventos.fixture.generar', $evento));

    $partido = Partido::query()
        ->where('evento_id', $evento->id)
        ->firstOrFail();

    $this->actingAs($admin)
        ->put(route('partidos.resultado.update', $partido), [
            'goles_local' => 2,
            'goles_visitante' => 1,
        ])
        ->assertRedirect();

    expect($partido->fresh()->estado_partido)->toBe('jugado');
});

test('knockout results cannot be tied and final result determines champion', function () {
    $organizer = User::factory()->create();
    $evento = createEvento($organizer, 8);
    createInscripciones($evento, 8);

    $this->actingAs($organizer)
        ->post(route('eventos.fixture.generar', $evento));

    Partido::query()
        ->where('evento_id', $evento->id)
        ->where('fase', 'grupo')
        ->get()
        ->each(function (Partido $partido) use ($organizer): void {
            $this->actingAs($organizer)
                ->put(route('partidos.resultado.update', $partido), [
                    'goles_local' => 1,
                    'goles_visitante' => 0,
                ]);
        });

    Partido::query()
        ->where('evento_id', $evento->id)
        ->where('fase', 'semifinal')
        ->get()
        ->each(function (Partido $partido) use ($organizer): void {
            $this->actingAs($organizer)
                ->put(route('partidos.resultado.update', $partido), [
                    'goles_local' => 2,
                    'goles_visitante' => 1,
                ])
                ->assertRedirect();
        });

    $final = Partido::query()
        ->where('evento_id', $evento->id)
        ->where('fase', 'final')
        ->firstOrFail();

    $this->actingAs($organizer)
        ->from(route('eventos.fixture.show', $evento))
        ->put(route('partidos.resultado.update', $final), [
            'goles_local' => 1,
            'goles_visitante' => 1,
        ])
        ->assertSessionHasErrors([
            'resultado' => 'En eliminatorias debe haber un ganador.',
        ]);

    $this->actingAs($organizer)
        ->put(route('partidos.resultado.update', $final), [
            'goles_local' => 3,
            'goles_visitante' => 2,
        ])
        ->assertRedirect();

    $final->refresh();

    expect($final->estado_partido)->toBe('jugado')
        ->and($final->marcador_partido)->toBe('3 - 2')
        ->and($final->ganador_partido)->toBe($final->equipoLocal->nombre_equipo);
});

test('quarterfinals semifinals and final are generated for sixteen team tournament', function () {
    $organizer = User::factory()->create();
    $evento = createEvento($organizer, 16);
    createInscripciones($evento, 16);

    $this->actingAs($organizer)
        ->post(route('eventos.fixture.generar', $evento));

    expect(FixtureGrupo::where('evento_id', $evento->id)->count())->toBe(4)
        ->and(Partido::where('evento_id', $evento->id)->where('fase', 'grupo')->count())->toBe(24);

    Partido::query()
        ->where('evento_id', $evento->id)
        ->where('fase', 'grupo')
        ->get()
        ->each(function (Partido $partido) use ($organizer): void {
            $this->actingAs($organizer)
                ->put(route('partidos.resultado.update', $partido), [
                    'goles_local' => 1,
                    'goles_visitante' => 0,
                ])
                ->assertRedirect();
        });

    expect(Partido::where('evento_id', $evento->id)->where('fase', 'cuartos')->count())->toBe(4)
        ->and(Partido::where('evento_id', $evento->id)->where('fase', 'semifinal')->count())->toBe(0);

    Partido::query()
        ->where('evento_id', $evento->id)
        ->where('fase', 'cuartos')
        ->get()
        ->each(function (Partido $partido) use ($organizer): void {
            $this->actingAs($organizer)
                ->put(route('partidos.resultado.update', $partido), [
                    'goles_local' => 2,
                    'goles_visitante' => 1,
                ]);
        });

    expect(Partido::where('evento_id', $evento->id)->where('fase', 'semifinal')->count())->toBe(2);

    Partido::query()
        ->where('evento_id', $evento->id)
        ->where('fase', 'semifinal')
        ->get()
        ->each(function (Partido $partido) use ($organizer): void {
            $this->actingAs($organizer)
                ->put(route('partidos.resultado.update', $partido), [
                    'goles_local' => 2,
                    'goles_visitante' => 1,
                ]);
        });

    expect(Partido::where('evento_id', $evento->id)->where('fase', 'final')->count())->toBe(1);
});

function createEvento(User $organizer, int $cupo): Evento
{
    return Evento::create([
        'user_id' => $organizer->id,
        'nombre_evento' => 'Torneo Fixture',
        'ubicacion_evento' => 'Cancha Central',
        'cupo_evento' => $cupo,
        'estado_evento' => 'abierto',
        'fecha_inicio' => now()->addDay()->toDateString(),
        'fecha_fin' => now()->addWeek()->toDateString(),
        'descripcion_evento' => null,
        'formato_evento' => 'futbol_5',
        'tipo_inscripcion' => 'gratis',
        'monto_inscripcion' => null,
    ]);
}

function createInscripciones(Evento $evento, int $cantidad): void
{
    for ($i = 1; $i <= $cantidad; $i++) {
        $user = User::factory()->create();
        $equipo = Equipo::create([
            'user_id' => $user->id,
            'nombre_equipo' => "Equipo {$i}",
            'plantilla' => 0,
            'estado_equipo' => 'activo',
        ]);

        Inscripcion::create([
            'evento_id' => $evento->id,
            'equipo_id' => $equipo->id,
            'fecha_inscripcion' => now(),
            'estado_inscripcion' => 'confirmada',
            'cuota_inscripcion' => 0,
            'cuota_pagada' => true,
        ]);
    }
}
