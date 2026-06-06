<?php

namespace App\Http\Controllers;

use App\Models\Equipo;
use App\Models\Evento;
use App\Models\FixtureGrupo;
use App\Models\FixtureGrupoEquipo;
use App\Models\Partido;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class FixtureController extends Controller
{
    public function show(Evento $evento): Response
    {
        $this->generarEliminatoriasSiCorresponde($evento);

        $evento->load([
            'user',
            'fixtureGrupos.equiposGrupo.equipo.user',
            'partidos.equipoLocal.user',
            'partidos.equipoVisitante.user',
            'partidos.grupo',
        ]);

        $inscripcionesActuales = $this->inscripcionesActuales($evento);
        $fixtureGenerado = $evento->fixtureGrupos->isNotEmpty();
        $user = auth()->user();
        $canManage = $user !== null
            && ($evento->user_id === $user->id || (bool) $user->is_admin);

        return inertia('eventos/fixture', [
            'evento' => [
                'id' => $evento->id,
                'nombre_evento' => $evento->nombre_evento,
                'descripcion_evento' => $evento->descripcion_evento,
                'ubicacion_evento' => $evento->ubicacion_evento,
                'cupo_evento' => $evento->cupo_evento,
                'estado_evento' => $evento->estado_evento,
                'fecha_inicio' => optional($evento->fecha_inicio)->format('Y-m-d'),
                'fecha_fin' => optional($evento->fecha_fin)->format('Y-m-d'),
                'formato_evento' => $evento->formato_evento,
                'tipo_inscripcion' => $evento->tipo_inscripcion,
                'monto_inscripcion' => $evento->monto_inscripcion,
                'user' => $evento->user ? [
                    'id' => $evento->user->id,
                    'name' => $evento->user->name,
                ] : null,
                'inscripciones_actuales' => $inscripcionesActuales,
                'fixture_generado' => $fixtureGenerado,
                'fixture_disponible' => $fixtureGenerado || $this->estaCompleto($evento, $inscripcionesActuales),
                'can_manage' => $canManage,
                'can_generate' => $canManage
                    && ! $fixtureGenerado
                    && $this->estaCompleto($evento, $inscripcionesActuales),
            ],
            'grupos' => $evento->fixtureGrupos
                ->sortBy('nombre_grupo')
                ->map(fn (FixtureGrupo $grupo) => [
                    'id' => $grupo->id,
                    'nombre_grupo' => $grupo->nombre_grupo,
                    'equipos' => $grupo->equiposGrupo
                        ->sort(fn (FixtureGrupoEquipo $a, FixtureGrupoEquipo $b): int => [
                            $b->puntos,
                            $b->diferencia_goles,
                            $b->goles_favor,
                        ] <=> [
                            $a->puntos,
                            $a->diferencia_goles,
                            $a->goles_favor,
                        ])
                        ->map(fn (FixtureGrupoEquipo $grupoEquipo) => [
                            'id' => $grupoEquipo->id,
                            'posicion' => $grupoEquipo->posicion,
                            'puntos' => $grupoEquipo->puntos,
                            'partidos_jugados' => $grupoEquipo->partidos_jugados,
                            'ganados' => $grupoEquipo->ganados,
                            'empatados' => $grupoEquipo->empatados,
                            'perdidos' => $grupoEquipo->perdidos,
                            'goles_favor' => $grupoEquipo->goles_favor,
                            'goles_contra' => $grupoEquipo->goles_contra,
                            'diferencia_goles' => $grupoEquipo->diferencia_goles,
                            'equipo' => $grupoEquipo->equipo ? [
                                'id' => $grupoEquipo->equipo->id,
                                'nombre_equipo' => $grupoEquipo->equipo->nombre_equipo,
                                'escudo_equipo' => $grupoEquipo->equipo->escudo_equipo,
                                'responsable' => $grupoEquipo->equipo->user?->name,
                            ] : null,
                        ])->values(),
                ])->values(),
            'partidos' => $evento->partidos
                ->sortBy([
                    ['fase', 'asc'],
                    ['grupo_id', 'asc'],
                    ['id', 'asc'],
                ])
                ->map(fn (Partido $partido) => [
                    'id' => $partido->id,
                    'fase' => $partido->fase,
                    'grupo' => $partido->grupo ? [
                        'id' => $partido->grupo->id,
                        'nombre_grupo' => $partido->grupo->nombre_grupo,
                    ] : null,
                    'equipo_local' => $this->equipoPayload($partido->equipoLocal),
                    'equipo_visitante' => $this->equipoPayload($partido->equipoVisitante),
                    'marcador_partido' => $partido->marcador_partido,
                    'ganador_partido' => $partido->ganador_partido,
                    'goles_local' => $partido->goles_local,
                    'goles_visitante' => $partido->goles_visitante,
                    'estado_partido' => $partido->estado_partido,
                ])->values(),
        ]);
    }

    public function generar(Evento $evento): RedirectResponse
    {
        $this->autorizarGestionEvento($evento);

        $inscripcionesActuales = $this->inscripcionesActuales($evento);

        if (! $this->estaCompleto($evento, $inscripcionesActuales)) {
            return back()->with('error', 'El fixture estará disponible cuando se complete el cupo de inscripciones.');
        }

        if ($evento->fixtureGrupos()->exists()) {
            return redirect()
                ->route('eventos.fixture.show', $evento)
                ->with('info', 'El fixture ya fue generado.');
        }

        DB::transaction(function () use ($evento): void {
            if ($evento->fixtureGrupos()->lockForUpdate()->exists()) {
                return;
            }

            $equipos = $evento->inscripciones()
                ->with('equipo')
                ->where('estado_inscripcion', 'confirmada')
                ->get()
                ->pluck('equipo')
                ->filter()
                ->unique('id')
                ->values();

            abort_if($equipos->count() !== (int) $evento->cupo_evento, 422);

            $equiposMezclados = $equipos->shuffle();
            $equiposPorGrupo = 4;
            $nombresGrupos = (int) $evento->cupo_evento === 16
                ? ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D']
                : ['Grupo A', 'Grupo B'];

            collect($nombresGrupos)->each(function (string $nombreGrupo, int $index) use ($evento, $equiposMezclados, $equiposPorGrupo): void {
                $grupo = FixtureGrupo::create([
                    'evento_id' => $evento->id,
                    'nombre_grupo' => $nombreGrupo,
                ]);

                $equiposGrupo = $equiposMezclados
                    ->slice($index * $equiposPorGrupo, $equiposPorGrupo)
                    ->values();

                $equiposGrupo->each(fn ($equipo, int $posicion) => FixtureGrupoEquipo::create([
                    'fixture_grupo_id' => $grupo->id,
                    'equipo_id' => $equipo->id,
                    'posicion' => $posicion + 1,
                ]));

                $this->crearPartidosGrupo($evento, $grupo, $equiposGrupo);
            });
        });

        return redirect()
            ->route('eventos.fixture.show', $evento)
            ->with('success', 'Fixture generado correctamente.');
    }

    public function actualizarResultado(Request $request, Partido $partido): RedirectResponse
    {
        $partido->load(['evento', 'equipoLocal', 'equipoVisitante']);

        $this->autorizarGestionEvento($partido->evento);

        if ($partido->estado_partido === 'jugado') {
            return back()->withErrors([
                'resultado' => 'El resultado de este partido ya fue cargado y no puede modificarse.',
            ]);
        }

        $datos = $request->validate([
            'goles_local' => ['required', 'integer', 'min:0'],
            'goles_visitante' => ['required', 'integer', 'min:0'],
        ]);

        if (in_array($partido->fase, ['cuartos', 'semifinal', 'final'], true) && $datos['goles_local'] === $datos['goles_visitante']) {
            return back()->withErrors([
                'resultado' => 'En eliminatorias debe haber un ganador.',
            ]);
        }

        abort_if(
            ! $partido->equipo_local_id || ! $partido->equipo_visitante_id,
            422,
            'El partido no tiene equipos asignados.'
        );

        $ganador = match (true) {
            $datos['goles_local'] > $datos['goles_visitante'] => $partido->equipoLocal?->nombre_equipo,
            $datos['goles_visitante'] > $datos['goles_local'] => $partido->equipoVisitante?->nombre_equipo,
            default => 'Empate',
        };

        DB::transaction(function () use ($partido, $datos, $ganador): void {
            $partido->update([
                'goles_local' => $datos['goles_local'],
                'goles_visitante' => $datos['goles_visitante'],
                'marcador_partido' => "{$datos['goles_local']} - {$datos['goles_visitante']}",
                'ganador_partido' => $ganador,
                'estado_partido' => 'jugado',
            ]);

            if ($partido->grupo_id) {
                $this->recalcularTablaGrupo((int) $partido->grupo_id);
                $this->generarEliminatoriasSiCorresponde($partido->evento);

                return;
            }

            if ($partido->fase === 'cuartos') {
                $this->generarSemifinalesDesdeCuartosSiCorresponde($partido->evento);
            }

            if ($partido->fase === 'semifinal') {
                $this->generarFinalSiCorresponde($partido->evento);
            }
        });

        return back()->with('success', 'Resultado actualizado correctamente.');
    }

    private function crearPartidosGrupo(Evento $evento, FixtureGrupo $grupo, Collection $equipos): void
    {
        for ($i = 0; $i < $equipos->count(); $i++) {
            for ($j = $i + 1; $j < $equipos->count(); $j++) {
                Partido::create([
                    'evento_id' => $evento->id,
                    'grupo_id' => $grupo->id,
                    'equipo_local_id' => $equipos[$i]->id,
                    'equipo_visitante_id' => $equipos[$j]->id,
                    'fecha_hora' => $evento->fecha_inicio?->copy()->setTime(12, 0) ?? now(),
                    'ubicacion_partido' => $evento->ubicacion_evento,
                    'categoria_partido' => 'Infantil',
                    'fase' => 'grupo',
                    'estado_partido' => 'pendiente',
                    'marcador_partido' => null,
                    'ganador_partido' => null,
                ]);
            }
        }
    }

    private function recalcularTablaGrupo(int $grupoId): void
    {
        FixtureGrupoEquipo::query()
            ->where('fixture_grupo_id', $grupoId)
            ->update([
                'puntos' => 0,
                'partidos_jugados' => 0,
                'ganados' => 0,
                'empatados' => 0,
                'perdidos' => 0,
                'goles_favor' => 0,
                'goles_contra' => 0,
                'diferencia_goles' => 0,
            ]);

        Partido::query()
            ->where('grupo_id', $grupoId)
            ->where('estado_partido', 'jugado')
            ->get()
            ->each(function (Partido $partido): void {
                $local = FixtureGrupoEquipo::query()
                    ->where('fixture_grupo_id', $partido->grupo_id)
                    ->where('equipo_id', $partido->equipo_local_id)
                    ->firstOrFail();

                $visitante = FixtureGrupoEquipo::query()
                    ->where('fixture_grupo_id', $partido->grupo_id)
                    ->where('equipo_id', $partido->equipo_visitante_id)
                    ->firstOrFail();

                $this->aplicarResultadoEquipo($local, (int) $partido->goles_local, (int) $partido->goles_visitante);
                $this->aplicarResultadoEquipo($visitante, (int) $partido->goles_visitante, (int) $partido->goles_local);
            });

        FixtureGrupoEquipo::query()
            ->where('fixture_grupo_id', $grupoId)
            ->get()
            ->sort(fn (FixtureGrupoEquipo $a, FixtureGrupoEquipo $b): int => [
                $b->puntos,
                $b->diferencia_goles,
                $b->goles_favor,
            ] <=> [
                $a->puntos,
                $a->diferencia_goles,
                $a->goles_favor,
            ])
            ->values()
            ->each(fn (FixtureGrupoEquipo $equipo, int $index) => $equipo->update([
                'posicion' => $index + 1,
            ]));
    }

    private function aplicarResultadoEquipo(FixtureGrupoEquipo $equipo, int $golesFavor, int $golesContra): void
    {
        $equipo->increment('partidos_jugados');
        $equipo->increment('goles_favor', $golesFavor);
        $equipo->increment('goles_contra', $golesContra);
        $equipo->increment('diferencia_goles', $golesFavor - $golesContra);

        if ($golesFavor > $golesContra) {
            $equipo->increment('ganados');
            $equipo->increment('puntos', 3);

            return;
        }

        if ($golesFavor === $golesContra) {
            $equipo->increment('empatados');
            $equipo->increment('puntos');

            return;
        }

        $equipo->increment('perdidos');
    }

    private function generarEliminatoriasSiCorresponde(Evento $evento): void
    {
        $partidosGrupoPendientes = $evento->partidos()
            ->where('fase', 'grupo')
            ->where('estado_partido', '!=', 'jugado')
            ->count();

        if ($partidosGrupoPendientes > 0) {
            return;
        }

        if ((int) $evento->cupo_evento === 8) {
            $this->crearSemifinalesSiCorresponde($evento);

            return;
        }

        if ((int) $evento->cupo_evento === 16) {
            $this->crearCuartosSiCorresponde($evento);
        }
    }

    private function crearSemifinalesSiCorresponde(Evento $evento): void
    {
        if ($evento->partidos()->where('fase', 'semifinal')->exists()) {
            return;
        }

        $grupos = $this->gruposOrdenadosConTabla($evento);
        $grupoA = $grupos->firstWhere('nombre_grupo', 'Grupo A');
        $grupoB = $grupos->firstWhere('nombre_grupo', 'Grupo B');

        if (! $grupoA || ! $grupoB) {
            return;
        }

        $tablaA = $grupoA->equiposGrupo->sortBy('posicion')->values();
        $tablaB = $grupoB->equiposGrupo->sortBy('posicion')->values();

        if ($tablaA->count() < 2 || $tablaB->count() < 2) {
            return;
        }

        $this->crearPartidoEliminatorio(
            $evento,
            'semifinal',
            (int) $tablaA[0]->equipo_id,
            (int) $tablaB[1]->equipo_id,
        );

        $this->crearPartidoEliminatorio(
            $evento,
            'semifinal',
            (int) $tablaA[1]->equipo_id,
            (int) $tablaB[0]->equipo_id,
        );
    }

    private function crearCuartosSiCorresponde(Evento $evento): void
    {
        if ($evento->partidos()->where('fase', 'cuartos')->exists()) {
            return;
        }

        $grupos = $this->gruposOrdenadosConTabla($evento);
        $clasificados = $grupos
            ->flatMap(fn (FixtureGrupo $grupo) => $grupo->equiposGrupo
                ->sortBy('posicion')
                ->take(2)
                ->map(fn (FixtureGrupoEquipo $grupoEquipo) => [
                    'equipo_id' => (int) $grupoEquipo->equipo_id,
                    'grupo_id' => (int) $grupo->id,
                ]))
            ->values();

        if ($clasificados->count() !== 8) {
            return;
        }

        $cruces = $this->crearCrucesCuartos($clasificados);

        if ($cruces->count() !== 4) {
            return;
        }

        foreach ($cruces as $cruce) {
            $this->crearPartidoEliminatorio(
                $evento,
                'cuartos',
                $cruce[0]['equipo_id'],
                $cruce[1]['equipo_id'],
            );
        }
    }

    private function generarSemifinalesDesdeCuartosSiCorresponde(Evento $evento): void
    {
        if ($evento->partidos()->where('fase', 'semifinal')->exists()) {
            return;
        }

        $cuartos = $evento->partidos()
            ->where('fase', 'cuartos')
            ->where('estado_partido', 'jugado')
            ->orderBy('id')
            ->get();

        if ($cuartos->count() !== 4) {
            return;
        }

        $ganadores = $cuartos
            ->map(fn (Partido $partido): ?int => $this->ganadorEquipoId($partido))
            ->filter()
            ->values();

        if ($ganadores->count() !== 4) {
            return;
        }

        $this->crearPartidoEliminatorio($evento, 'semifinal', (int) $ganadores[0], (int) $ganadores[1]);
        $this->crearPartidoEliminatorio($evento, 'semifinal', (int) $ganadores[2], (int) $ganadores[3]);
    }

    private function generarFinalSiCorresponde(Evento $evento): void
    {
        $semifinales = $evento->partidos()
            ->where('fase', 'semifinal')
            ->where('estado_partido', 'jugado')
            ->orderBy('id')
            ->get();

        if ($semifinales->count() !== 2) {
            return;
        }

        $finalistas = $semifinales
            ->map(fn (Partido $partido): ?int => $this->ganadorEquipoId($partido))
            ->filter()
            ->values();

        if ($finalistas->count() !== 2) {
            return;
        }

        $final = $evento->partidos()->where('fase', 'final')->first();

        if ($final) {
            if ($final->estado_partido === 'pendiente' && (! $final->equipo_local_id || ! $final->equipo_visitante_id)) {
                $final->update([
                    'equipo_local_id' => $final->equipo_local_id ?: (int) $finalistas[0],
                    'equipo_visitante_id' => $final->equipo_visitante_id ?: (int) $finalistas[1],
                ]);
            }

            return;
        }

        $this->crearPartidoEliminatorio(
            $evento,
            'final',
            (int) $finalistas[0],
            (int) $finalistas[1],
        );
    }

    private function crearPartidoEliminatorio(Evento $evento, string $fase, int $equipoLocalId, int $equipoVisitanteId): void
    {
        Partido::create([
            'evento_id' => $evento->id,
            'grupo_id' => null,
            'equipo_local_id' => $equipoLocalId,
            'equipo_visitante_id' => $equipoVisitanteId,
            'fecha_hora' => $evento->fecha_inicio?->copy()->addDay()->setTime(16, 0) ?? now(),
            'ubicacion_partido' => $evento->ubicacion_evento,
            'categoria_partido' => 'Infantil',
            'fase' => $fase,
            'estado_partido' => 'pendiente',
            'marcador_partido' => null,
            'ganador_partido' => null,
        ]);
    }

    private function ganadorEquipoId(Partido $partido): ?int
    {
        if ($partido->goles_local === null || $partido->goles_visitante === null) {
            return null;
        }

        if ($partido->goles_local > $partido->goles_visitante) {
            return $partido->equipo_local_id;
        }

        if ($partido->goles_visitante > $partido->goles_local) {
            return $partido->equipo_visitante_id;
        }

        return null;
    }

    /**
     * @param  Collection<int, array{equipo_id: int, grupo_id: int}>  $clasificados
     * @return Collection<int, array{0: array{equipo_id: int, grupo_id: int}, 1: array{equipo_id: int, grupo_id: int}}>
     */
    private function crearCrucesCuartos(Collection $clasificados): Collection
    {
        for ($intento = 0; $intento < 25; $intento++) {
            $equipos = $clasificados->shuffle()->values();
            $cruces = collect();
            $cruceValido = true;

            while ($equipos->isNotEmpty()) {
                $local = $equipos->shift();
                $indiceRival = $equipos->search(fn (array $rival): bool => $rival['grupo_id'] !== $local['grupo_id']);

                if ($indiceRival === false) {
                    $cruceValido = false;
                    break;
                }

                $visitante = $equipos->pull($indiceRival);
                $equipos = $equipos->values();
                $cruces->push([$local, $visitante]);
            }

            if ($cruceValido && $cruces->count() === 4) {
                return $cruces;
            }
        }

        return $clasificados
            ->shuffle()
            ->values()
            ->chunk(2)
            ->map(fn (Collection $cruce) => $cruce->values()->all())
            ->values();
    }

    /**
     * @return Collection<int, FixtureGrupo>
     */
    private function gruposOrdenadosConTabla(Evento $evento): Collection
    {
        return $evento->fixtureGrupos()
            ->with('equiposGrupo')
            ->orderBy('nombre_grupo')
            ->get();
    }

    private function inscripcionesActuales(Evento $evento): int
    {
        return $evento->inscripciones()
            ->where('estado_inscripcion', 'confirmada')
            ->count();
    }

    private function estaCompleto(Evento $evento, int $inscripcionesActuales): bool
    {
        return in_array((int) $evento->cupo_evento, [8, 16], true)
            && $inscripcionesActuales === (int) $evento->cupo_evento;
    }

    /**
     * @return array{id: int, nombre_equipo: string, escudo_equipo: string|null}|null
     */
    private function equipoPayload(?Equipo $equipo): ?array
    {
        if (! $equipo) {
            return null;
        }

        return [
            'id' => $equipo->id,
            'nombre_equipo' => $equipo->nombre_equipo,
            'escudo_equipo' => $equipo->escudo_equipo,
        ];
    }

    private function autorizarGestionEvento(Evento $evento): void
    {
        $user = auth()->user();

        abort_if(
            ! $user || ($evento->user_id !== $user->id && ! $user->is_admin),
            403
        );
    }
}
