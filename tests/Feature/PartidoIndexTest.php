<?php

use App\Models\Equipo;
use App\Models\Evento;
use App\Models\Partido;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('user without team sees empty matches page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('partidos.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('partidos/index')
            ->where('equipo', null)
            ->where('partidosPendientes', [])
            ->where('partidosJugados', []));
});

test('matches page only lists authenticated user team matches', function () {
    $user = User::factory()->create();
    $equipo = Equipo::create([
        'user_id' => $user->id,
        'nombre_equipo' => 'Mi Equipo',
        'plantilla' => 0,
        'estado_equipo' => 'activo',
    ]);

    $rival = createPartidoIndexEquipo('Rival');
    $otroLocal = createPartidoIndexEquipo('Otro Local');
    $otroVisitante = createPartidoIndexEquipo('Otro Visitante');
    $evento = createPartidoIndexEvento($user);

    $pendiente = createPartidoIndexPartido($evento, $equipo, $rival, [
        'estado_partido' => 'pendiente',
        'fecha_hora' => now()->addDay(),
    ]);

    $jugado = createPartidoIndexPartido($evento, $rival, $equipo, [
        'estado_partido' => 'jugado',
        'fecha_hora' => now()->subDay(),
        'goles_local' => 1,
        'goles_visitante' => 3,
    ]);

    createPartidoIndexPartido($evento, $otroLocal, $otroVisitante, [
        'estado_partido' => 'jugado',
        'fecha_hora' => now()->subDays(2),
        'goles_local' => 2,
        'goles_visitante' => 0,
    ]);

    $this->actingAs($user)
        ->get(route('partidos.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('partidos/index')
            ->where('equipo.id', $equipo->id)
            ->has('partidosPendientes', 1)
            ->where('partidosPendientes.0.id', $pendiente->id)
            ->has('partidosJugados', 1)
            ->where('partidosJugados.0.id', $jugado->id));
});

function createPartidoIndexEquipo(string $nombre): Equipo
{
    $user = User::factory()->create();

    return Equipo::create([
        'user_id' => $user->id,
        'nombre_equipo' => $nombre,
        'plantilla' => 0,
        'estado_equipo' => 'activo',
    ]);
}

function createPartidoIndexEvento(User $user): Evento
{
    return Evento::create([
        'user_id' => $user->id,
        'nombre_evento' => 'Torneo Partidos',
        'ubicacion_evento' => 'Cancha Central',
        'cupo_evento' => 8,
        'estado_evento' => 'abierto',
        'fecha_inicio' => now()->toDateString(),
        'fecha_fin' => now()->addWeek()->toDateString(),
        'descripcion_evento' => null,
        'formato_evento' => 'futbol_5',
        'tipo_inscripcion' => 'gratis',
        'monto_inscripcion' => null,
    ]);
}

/**
 * @param  array<string, mixed>  $overrides
 */
function createPartidoIndexPartido(
    Evento $evento,
    Equipo $local,
    Equipo $visitante,
    array $overrides = []
): Partido {
    return Partido::create(array_merge([
        'evento_id' => $evento->id,
        'equipo_local_id' => $local->id,
        'equipo_visitante_id' => $visitante->id,
        'fecha_hora' => now(),
        'ubicacion_partido' => $evento->ubicacion_evento,
        'categoria_partido' => 'Infantil',
        'fase' => 'grupo',
        'estado_partido' => 'pendiente',
    ], $overrides));
}
