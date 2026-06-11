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
                'tipo_inscripcion' => $evento->tipo_inscripcion,
                'monto_inscripcion' => $evento->monto_inscripcion,
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
        $datos = $this->datosEvento($request->validated());

        Evento::create([
            'user_id' => auth()->id(),
            ...$datos,
            'estado_evento' => $datos['estado_evento'] ?? 'abierto',
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
        $evento->loadCount('fixtureGrupos');

        $user = auth()->user();
        $inscripcionesActuales = $evento->inscripciones
            ->where('estado_inscripcion', 'confirmada')
            ->count();
        $canManage = $user !== null
            && ($evento->user_id === $user->id || (bool) $user->is_admin);

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
                'tipo_inscripcion' => $evento->tipo_inscripcion,
                'monto_inscripcion' => $evento->monto_inscripcion,
                'inscripciones_actuales' => $inscripcionesActuales,
                'fixture_generado' => $evento->fixture_grupos_count > 0,
                'can_generate_fixture' => $canManage
                    && $evento->fixture_grupos_count === 0
                    && in_array((int) $evento->cupo_evento, [8, 16], true)
                    && $inscripcionesActuales === (int) $evento->cupo_evento,
                'user' => $evento->user ? [
                    'id' => $evento->user->id,
                    'name' => $evento->user->name,
                ] : null,
                'inscripciones' => $evento->inscripciones->map(fn ($inscripcion) => [
                    'id' => $inscripcion->id,
                    'estado_inscripcion' => $inscripcion->estado_inscripcion,
                    'cuota_pagada' => $inscripcion->cuota_pagada,
                    'mercadopago_status' => $inscripcion->mercadopago_status,
                    'equipo' => $inscripcion->equipo ? [
                        'id' => $inscripcion->equipo->id,
                        'nombre_equipo' => $inscripcion->equipo->nombre_equipo,
                        'escudo_equipo' => $inscripcion->equipo->escudo_equipo,
                    ] : null,
                ])->values(),
                'partidos' => $evento->partidos->map(fn ($partido) => [
                    'id' => $partido->id,
                    'fecha_hora' => $partido->fecha_hora,
                    'ubicacion_partido' => $partido->ubicacion_partido,
                    'categoria_partido' => $partido->categoria_partido,
                ])->values(),
                'can_manage' => $canManage,
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
                'tipo_inscripcion' => $evento->tipo_inscripcion,
                'monto_inscripcion' => $evento->monto_inscripcion,
            ],
        ]);
    }

    public function update(UpdateEventoRequest $request, Evento $evento): RedirectResponse
    {
        $this->autorizarGestionEvento($evento);

        $evento->update($this->datosEvento($request->validated()));

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

    /**
     * @param  array<string, mixed>  $datos
     * @return array<string, mixed>
     */
    private function datosEvento(array $datos): array
    {
        if (($datos['tipo_inscripcion'] ?? 'gratis') === 'gratis') {
            $datos['monto_inscripcion'] = null;
        }

        return $datos;
    }
}
