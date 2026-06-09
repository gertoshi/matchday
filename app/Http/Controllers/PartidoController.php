<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartidoRequest;
use App\Http\Requests\UpdatePartidoRequest;
use App\Models\Partido;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Response;

class PartidoController extends Controller
{
    /**
     * LISTAR partidos
     */
    public function index(Request $request): Response
    {
        $equipo = $request->user()
            ->equipo()
            ->first(['id', 'nombre_equipo', 'escudo_equipo']);

        if (! $equipo) {
            return inertia('partidos/index', [
                'equipo' => null,
                'partidosPendientes' => [],
                'partidosJugados' => [],
            ]);
        }

        $partidosQuery = Partido::query()
            ->with([
                'evento:id,nombre_evento',
                'equipoLocal:id,nombre_equipo,escudo_equipo',
                'equipoVisitante:id,nombre_equipo,escudo_equipo',
                'grupo:id,nombre_grupo',
            ])
            ->where(function ($query) use ($equipo): void {
                $query->where('equipo_local_id', $equipo->id)
                    ->orWhere('equipo_visitante_id', $equipo->id);
            });

        $partidosPendientes = (clone $partidosQuery)
            ->where('estado_partido', 'pendiente')
            ->orderBy('fecha_hora')
            ->get()
            ->map(fn (Partido $partido) => $this->partidoPayload($partido))
            ->values();

        $partidosJugados = (clone $partidosQuery)
            ->where('estado_partido', 'jugado')
            ->orderByDesc('fecha_hora')
            ->get()
            ->map(fn (Partido $partido) => $this->partidoPayload($partido))
            ->values();

        return inertia('partidos/index', [
            'equipo' => [
                'id' => $equipo->id,
                'nombre_equipo' => $equipo->nombre_equipo,
                'escudo_equipo' => $equipo->escudo_equipo,
            ],
            'partidosPendientes' => $partidosPendientes,
            'partidosJugados' => $partidosJugados,
        ]);
    }

    /**
     * FORMULARIO crear partido
     */
    public function create()
    {
        return redirect()
            ->route('partidos.index')
            ->with('info', 'La vista de creación de partidos todavía no está disponible.');
    }

    /**
     * GUARDAR partido
     */
    public function store(
        StorePartidoRequest $request
    ) {
        Partido::create(
            $request->validated()
        );

        return redirect()
            ->route('partidos.index')
            ->with('success', 'Partido creado correctamente');
    }

    /**
     * VER partido
     */
    public function show(
        Partido $partido
    ) {
        return redirect()
            ->route('partidos.index')
            ->with('info', 'La vista de detalle del partido todavía no está disponible.');
    }

    /**
     * FORMULARIO editar partido
     */
    public function edit(
        Partido $partido
    ) {
        return redirect()
            ->route('partidos.index')
            ->with('info', 'La vista de edición de partidos todavía no está disponible.');
    }

    /**
     * ACTUALIZAR partido
     */
    public function update(
        UpdatePartidoRequest $request,
        Partido $partido
    ) {
        $partido->update(
            $request->validated()
        );

        return redirect()
            ->route('partidos.index')
            ->with('success', 'Partido actualizado');
    }

    /**
     * ELIMINAR partido
     */
    public function destroy(
        Partido $partido
    ) {
        $partido->delete();

        return redirect()
            ->route('partidos.index')
            ->with('success', 'Partido eliminado');
    }

    /**
     * @return array<string, mixed>
     */
    private function partidoPayload(Partido $partido): array
    {
        return [
            'id' => $partido->id,
            'fase' => $partido->fase,
            'fecha_hora' => $partido->fecha_hora
                ? Carbon::parse($partido->fecha_hora)->format('Y-m-d')
                : null,
            'goles_local' => $partido->goles_local,
            'goles_visitante' => $partido->goles_visitante,
            'estado_partido' => $partido->estado_partido,
            'evento' => $partido->evento ? [
                'id' => $partido->evento->id,
                'nombre_evento' => $partido->evento->nombre_evento,
            ] : null,
            'equipo_local' => $partido->equipoLocal ? [
                'id' => $partido->equipoLocal->id,
                'nombre_equipo' => $partido->equipoLocal->nombre_equipo,
                'escudo_equipo' => $partido->equipoLocal->escudo_equipo,
            ] : null,
            'equipo_visitante' => $partido->equipoVisitante ? [
                'id' => $partido->equipoVisitante->id,
                'nombre_equipo' => $partido->equipoVisitante->nombre_equipo,
                'escudo_equipo' => $partido->equipoVisitante->escudo_equipo,
            ] : null,
            'grupo' => $partido->grupo ? [
                'id' => $partido->grupo->id,
                'nombre_grupo' => $partido->grupo->nombre_grupo,
            ] : null,
        ];
    }
}
