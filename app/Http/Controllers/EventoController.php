<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventoRequest;
use App\Http\Requests\UpdateEventoRequest;
use App\Models\Evento;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class EventoController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $eventos = Evento::with('user')
            ->withCount('inscripciones')
            ->latest()
            ->get()
            ->map(fn (Evento $evento) => [
                'id' => $evento->id,
                'nombre_evento' => $evento->nombre_evento,
                'ubicacion_evento' => $evento->ubicacion_evento,
                'cupo_evento' => $evento->cupo_evento,
                'estado_evento' => $evento->estado_evento,
                'fecha_inicio' => optional($evento->fecha_inicio)->format('Y-m-d'),
                'fecha_fin' => optional($evento->fecha_fin)->format('Y-m-d'),
                'descripcion_evento' => $evento->descripcion_evento,
                'formato_evento' => $evento->formato_evento,
                'inscripciones_count' => $evento->inscripciones_count,
                'user' => $evento->user ? [
                    'id' => $evento->user->id,
                    'name' => $evento->user->name,
                ] : null,
                'can_manage' => $user !== null
                    && ($evento->user_id === $user->id || (bool) $user->is_admin),
            ]);

        return inertia('eventos/index', [
            'eventos' => $eventos,
        ]);
    }

    public function create(): Response
    {
        return inertia('eventos/create');
    }

    public function store(StoreEventoRequest $request): RedirectResponse
    {
        Evento::create([
            'user_id' => auth()->id(),
            ...$request->validated(),
            'estado_evento' => $request->validated()['estado_evento'] ?? 'abierto',
        ]);

        return redirect()
            ->route('eventos.index')
            ->with('success', 'Evento creado correctamente');
    }

    public function show(Evento $evento): Response
    {
        $evento->load([
            'user',
            'inscripciones.equipo',
            'partidos',
        ]);

        $user = auth()->user();

        return inertia('eventos/show', [
            'evento' => [
                'id' => $evento->id,
                'nombre_evento' => $evento->nombre_evento,
                'ubicacion_evento' => $evento->ubicacion_evento,
                'cupo_evento' => $evento->cupo_evento,
                'estado_evento' => $evento->estado_evento,
                'fecha_inicio' => optional($evento->fecha_inicio)->format('Y-m-d'),
                'fecha_fin' => optional($evento->fecha_fin)->format('Y-m-d'),
                'descripcion_evento' => $evento->descripcion_evento,
                'formato_evento' => $evento->formato_evento,
                'user' => $evento->user ? [
                    'id' => $evento->user->id,
                    'name' => $evento->user->name,
                ] : null,
                'inscripciones' => $evento->inscripciones->map(fn ($inscripcion) => [
                    'id' => $inscripcion->id,
                    'estado_inscripcion' => $inscripcion->estado_inscripcion,
                    'equipo' => $inscripcion->equipo ? [
                        'id' => $inscripcion->equipo->id,
                        'nombre_equipo' => $inscripcion->equipo->nombre_equipo,
                    ] : null,
                ])->values(),
                'partidos' => $evento->partidos->map(fn ($partido) => [
                    'id' => $partido->id,
                    'fecha_hora' => $partido->fecha_hora,
                    'ubicacion_partido' => $partido->ubicacion_partido,
                    'categoria_partido' => $partido->categoria_partido,
                ])->values(),
                'can_manage' => $user !== null
                    && ($evento->user_id === $user->id || (bool) $user->is_admin),
            ],
            'hasEquipo' => $user?->equipo()->exists() ?? false,
        ]);
    }

    public function edit(Evento $evento): Response
    {
        $this->autorizarGestionEvento($evento);

        return inertia('eventos/edit', [
            'evento' => [
                'id' => $evento->id,
                'nombre_evento' => $evento->nombre_evento,
                'ubicacion_evento' => $evento->ubicacion_evento,
                'cupo_evento' => $evento->cupo_evento,
                'estado_evento' => $evento->estado_evento,
                'fecha_inicio' => optional($evento->fecha_inicio)->format('Y-m-d'),
                'fecha_fin' => optional($evento->fecha_fin)->format('Y-m-d'),
                'descripcion_evento' => $evento->descripcion_evento,
                'formato_evento' => $evento->formato_evento,
            ],
        ]);
    }

    public function update(UpdateEventoRequest $request, Evento $evento): RedirectResponse
    {
        $this->autorizarGestionEvento($evento);

        $evento->update($request->validated());

        return redirect()
            ->route('eventos.show', $evento)
            ->with('success', 'Evento actualizado');
    }

    public function destroy(Evento $evento): RedirectResponse
    {
        $this->autorizarGestionEvento($evento);

        $evento->delete();

        return redirect()
            ->route('eventos.index')
            ->with('success', 'Evento eliminado');
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
