<?php

namespace App\Http\Controllers;

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
                'ubicacion_evento' => $evento->ubicacion_evento,
                'cupo_evento' => $evento->cupo_evento,
                'estado_evento' => $evento->estado_evento,
                'fecha_inicio' => optional($evento->fecha_inicio)->format('Y-m-d'),
                'fecha_fin' => optional($evento->fecha_fin)->format('Y-m-d'),
                'formato_evento' => $evento->formato_evento,
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
                        ->sortBy('posicion')
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
                    'equipo_local' => $partido->equipoLocal ? [
                        'id' => $partido->equipoLocal->id,
                        'nombre_equipo' => $partido->equipoLocal->nombre_equipo,
                    ] : null,
                    'equipo_visitante' => $partido->equipoVisitante ? [
                        'id' => $partido->equipoVisitante->id,
                        'nombre_equipo' => $partido->equipoVisitante->nombre_equipo,
                    ] : null,
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
                ->whereIn('estado_inscripcion', ['pendiente', 'confirmada'])
                ->get()
                ->pluck('equipo')
                ->filter()
                ->unique('id')
                ->values();

            abort_if($equipos->count() !== (int) $evento->cupo_evento, 422);

            $equiposMezclados = $equipos->shuffle();
            $equiposPorGrupo = (int) ((int) $evento->cupo_evento / 2);

            collect(['Grupo A', 'Grupo B'])->each(function (string $nombreGrupo, int $index) use ($evento, $equiposMezclados, $equiposPorGrupo): void {
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

        if ((int) $evento->cupo_evento === 4) {
            $this->crearFinalDirectaSiCorresponde($evento);

            return;
        }

        if ((int) $evento->cupo_evento === 8) {
            $this->crearSemifinalesSiCorresponde($evento);
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
            (int) $tablaB[0]->equipo_id,
            (int) $tablaA[1]->equipo_id,
        );
    }

    private function crearFinalDirectaSiCorresponde(Evento $evento): void
    {
        if ($evento->partidos()->where('fase', 'final')->exists()) {
            return;
        }

        $grupos = $this->gruposOrdenadosConTabla($evento);
        $grupoA = $grupos->firstWhere('nombre_grupo', 'Grupo A');
        $grupoB = $grupos->firstWhere('nombre_grupo', 'Grupo B');

        if (! $grupoA || ! $grupoB) {
            return;
        }

        $primeroA = $grupoA->equiposGrupo->sortBy('posicion')->first();
        $primeroB = $grupoB->equiposGrupo->sortBy('posicion')->first();

        if (! $primeroA || ! $primeroB) {
            return;
        }

        $this->crearPartidoEliminatorio(
            $evento,
            'final',
            (int) $primeroA->equipo_id,
            (int) $primeroB->equipo_id,
        );
    }

    private function generarFinalSiCorresponde(Evento $evento): void
    {
        if ($evento->partidos()->where('fase', 'final')->exists()) {
            return;
        }

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
            ->whereIn('estado_inscripcion', ['pendiente', 'confirmada'])
            ->count();
    }

    private function estaCompleto(Evento $evento, int $inscripcionesActuales): bool
    {
        return in_array((int) $evento->cupo_evento, [4, 8], true)
            && $inscripcionesActuales === (int) $evento->cupo_evento;
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
