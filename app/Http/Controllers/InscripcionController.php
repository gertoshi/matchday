<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInscripcionRequest;
use App\Http\Requests\UpdateInscripcionRequest;
use App\Models\Evento;
use App\Models\Inscripcion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class InscripcionController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $equipo = auth()->user()?->equipo()->first();

        if (! $equipo) {
            return redirect()
                ->route('equipos.index')
                ->with('error', 'Necesitás un equipo para ver tus inscripciones.');
        }

        $inscripciones = Inscripcion::with([
            'evento',
            'equipo',
        ])
            ->where('equipo_id', $equipo->id)
            ->latest()
            ->get()
            ->map(fn (Inscripcion $inscripcion) => [
                'id' => $inscripcion->id,
                'estado_inscripcion' => $inscripcion->estado_inscripcion,
                'cuota_inscripcion' => $inscripcion->cuota_inscripcion,
                'cuota_pagada' => $inscripcion->cuota_pagada,
                'fecha_inscripcion' => optional($inscripcion->fecha_inscripcion)->format('Y-m-d H:i'),
                'fecha_pago' => optional($inscripcion->fecha_pago)->format('Y-m-d H:i'),
                'metodo_pago' => $inscripcion->metodo_pago,
                'mercadopago_status' => $inscripcion->mercadopago_status,
                'observaciones' => $inscripcion->observaciones,
                'evento' => $inscripcion->evento ? [
                    'id' => $inscripcion->evento->id,
                    'nombre_evento' => $inscripcion->evento->nombre_evento,
                    'estado_evento' => $inscripcion->evento->estado_evento,
                ] : null,
                'equipo' => $inscripcion->equipo ? [
                    'id' => $inscripcion->equipo->id,
                    'nombre_equipo' => $inscripcion->equipo->nombre_equipo,
                    'escudo_equipo' => $inscripcion->equipo->escudo_equipo,
                ] : null,
            ]);

        return inertia('inscripciones/index', [
            'inscripciones' => $inscripciones,
        ]);
    }

    public function create(Request $request): Response
    {
        $eventoId = $request->integer('evento_id');
        $eventoSeleccionado = null;

        if ($eventoId) {
            $evento = Evento::query()
                ->where('estado_evento', 'abierto')
                ->find($eventoId);

            if ($evento) {
                $eventoSeleccionado = [
                    'id' => $evento->id,
                    'nombre_evento' => $evento->nombre_evento,
                    'ubicacion_evento' => $evento->ubicacion_evento,
                    'fecha_inicio' => optional($evento->fecha_inicio)->format('Y-m-d'),
                    'fecha_fin' => optional($evento->fecha_fin)->format('Y-m-d'),
                    'cupo_evento' => $evento->cupo_evento,
                    'tipo_inscripcion' => $evento->tipo_inscripcion,
                    'monto_inscripcion' => $evento->monto_inscripcion,
                ];
            }
        }

        $eventos = Evento::query()
            ->where('estado_evento', 'abierto')
            ->orderBy('fecha_inicio')
            ->get()
            ->map(fn (Evento $evento) => [
                'id' => $evento->id,
                'nombre_evento' => $evento->nombre_evento,
                'ubicacion_evento' => $evento->ubicacion_evento,
                'fecha_inicio' => optional($evento->fecha_inicio)->format('Y-m-d'),
                'fecha_fin' => optional($evento->fecha_fin)->format('Y-m-d'),
                'cupo_evento' => $evento->cupo_evento,
                'tipo_inscripcion' => $evento->tipo_inscripcion,
                'monto_inscripcion' => $evento->monto_inscripcion,
            ]);

        return inertia('inscripciones/create', [
            'eventoSeleccionado' => $eventoSeleccionado,
            'eventos' => $eventos,
        ]);
    }

    public function store(StoreInscripcionRequest $request): RedirectResponse
    {
        $equipo = auth()->user()?->equipo()->first();

        if (! $equipo) {
            return redirect()
                ->route('equipos.index')
                ->with('error', 'Necesitás un equipo para inscribirte a un torneo.');
        }

        $datos = $request->validated();

        $evento = Evento::findOrFail($datos['evento_id']);

        if ($evento->estado_evento !== 'abierto') {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'Este torneo no acepta nuevas inscripciones.');
        }

        if ($evento->tipo_inscripcion === 'pago') {
            return redirect()
                ->route('inscripciones.create', ['evento_id' => $evento->id])
                ->with('error', 'Para inscribirte a este torneo tenés que pagar con Mercado Pago.');
        }

        $duplicada = Inscripcion::query()
            ->where('evento_id', $evento->id)
            ->where('equipo_id', $equipo->id)
            ->exists();

        if ($duplicada) {
            return redirect()
                ->route('inscripciones.index')
                ->with('error', 'Tu equipo ya está inscripto en este torneo.');
        }

        $ocupados = Inscripcion::query()
            ->where('evento_id', $evento->id)
            ->whereIn('estado_inscripcion', ['pendiente', 'confirmada'])
            ->count();

        if ($ocupados >= $evento->cupo_evento) {
            return redirect()
                ->route('eventos.show', $evento)
                ->with('error', 'El torneo ya alcanzó el cupo máximo.');
        }

        Inscripcion::create([
            'evento_id' => $evento->id,
            'equipo_id' => $equipo->id,
            'fecha_inscripcion' => now(),
            'estado_inscripcion' => 'pendiente',
            'cuota_inscripcion' => $evento->tipo_inscripcion === 'pago'
                ? $evento->monto_inscripcion
                : 0,
            'cuota_pagada' => true,
            'fecha_pago' => now(),
            'metodo_pago' => 'gratis',
            'observaciones' => $datos['observaciones'] ?? null,
        ]);

        return redirect()
            ->route('inscripciones.index')
            ->with('success', 'Inscripción creada correctamente');
    }

    public function show(Inscripcion $inscripcion): RedirectResponse
    {
        $this->autorizarInscripcion($inscripcion);

        return redirect()
            ->route('inscripciones.index')
            ->with('info', 'La vista de detalle de la inscripción todavía no está disponible.');
    }

    public function edit(Inscripcion $inscripcion): RedirectResponse
    {
        $this->autorizarInscripcion($inscripcion);

        return redirect()
            ->route('inscripciones.index')
            ->with('info', 'La vista de edición de inscripciones todavía no está disponible.');
    }

    public function update(
        UpdateInscripcionRequest $request,
        Inscripcion $inscripcion
    ): RedirectResponse {
        $this->autorizarInscripcion($inscripcion);

        $inscripcion->update($request->validated());

        return redirect()
            ->route('inscripciones.index')
            ->with('success', 'Inscripción actualizada');
    }

    public function destroy(Inscripcion $inscripcion): RedirectResponse
    {
        $this->autorizarInscripcion($inscripcion);

        $inscripcion->delete();

        return redirect()
            ->route('inscripciones.index')
            ->with('success', 'Inscripción eliminada');
    }

    public function aceptar(Inscripcion $inscripcion): RedirectResponse
    {
        $this->autorizarGestionInscripcion($inscripcion);

        $cupoCompleto = false;

        DB::transaction(function () use ($inscripcion, &$cupoCompleto): void {
            $inscripcion->refresh();

            $evento = Evento::query()
                ->whereKey($inscripcion->evento_id)
                ->lockForUpdate()
                ->firstOrFail();

            $confirmadas = Inscripcion::query()
                ->where('evento_id', $evento->id)
                ->where('estado_inscripcion', 'confirmada')
                ->lockForUpdate()
                ->count();

            if ($inscripcion->estado_inscripcion !== 'confirmada' && $confirmadas >= $evento->cupo_evento) {
                $cupoCompleto = true;

                return;
            }

            $inscripcion->update([
                'estado_inscripcion' => 'confirmada',
            ]);

            $confirmadasActualizadas = Inscripcion::query()
                ->where('evento_id', $evento->id)
                ->where('estado_inscripcion', 'confirmada')
                ->count();

            if ($confirmadasActualizadas >= $evento->cupo_evento) {
                $evento->update([
                    'estado_evento' => 'en_curso',
                ]);
            }
        });

        if ($cupoCompleto) {
            return back()->with('error', 'El torneo ya completó su cupo.');
        }

        return back()->with('success', 'Inscripción aceptada.');
    }

    public function rechazar(Inscripcion $inscripcion): RedirectResponse
    {
        $this->autorizarGestionInscripcion($inscripcion);

        $inscripcion->update([
            'estado_inscripcion' => 'rechazada',
        ]);

        return back()->with('success', 'Inscripción rechazada.');
    }

    private function autorizarInscripcion(Inscripcion $inscripcion): void
    {
        $user = auth()->user();
        $equipoId = $user?->equipo()->value('id');

        abort_if(
            ! $user || ($inscripcion->equipo_id !== $equipoId && ! $user->is_admin),
            403
        );
    }

    private function autorizarGestionInscripcion(Inscripcion $inscripcion): void
    {
        $inscripcion->loadMissing('evento');

        $user = auth()->user();

        abort_if(
            ! $user || ($inscripcion->evento?->user_id !== $user->id && ! $user->is_admin),
            403
        );
    }
}
