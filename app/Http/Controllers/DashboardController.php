<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $equipo = $user->equipo()
            ->withCount('jugadores')
            ->first();

        $eventosQuery = Evento::query()
            ->orderByDesc('fecha_inicio')
            ->orderByDesc('created_at');

        $eventosDisponibles = $eventosQuery->count();

        $ultimosEventos = (clone $eventosQuery)
            ->limit(3)
            ->get([
                'id',
                'nombre_evento',
                'ubicacion_evento',
                'fecha_inicio',
                'estado_evento',
            ]);

        $inscripcionesCount = 0;
        $ultimasInscripciones = collect();

        if ($equipo) {
            $inscripcionesQuery = $equipo->inscripciones()
                ->with('evento:id,nombre_evento,fecha_inicio,estado_evento')
                ->latest('fecha_inscripcion');

            $inscripcionesCount = $inscripcionesQuery->count();
            $ultimasInscripciones = (clone $inscripcionesQuery)
                ->limit(3)
                ->get();
        }

        return Inertia::render('dashboard', [
            'equipo' => $equipo ? [
                'id' => $equipo->id,
                'nombre_equipo' => $equipo->nombre_equipo,
                'jugadores_count' => $equipo->jugadores_count,
            ] : null,
            'eventos_disponibles_count' => $eventosDisponibles,
            'ultimos_eventos' => $ultimosEventos->map(fn (Evento $evento) => [
                'id' => $evento->id,
                'nombre_evento' => $evento->nombre_evento,
                'ubicacion_evento' => $evento->ubicacion_evento,
                'fecha_inicio' => optional($evento->fecha_inicio)?->format('d/m/Y'),
                'estado_evento' => $evento->estado_evento,
            ])->values(),
            'inscripciones_count' => $inscripcionesCount,
            'ultimas_inscripciones' => $ultimasInscripciones->map(fn ($inscripcion) => [
                'id' => $inscripcion->id,
                'estado_inscripcion' => $inscripcion->estado_inscripcion,
                'fecha_inscripcion' => optional($inscripcion->fecha_inscripcion)?->format('d/m/Y'),
                'evento' => $inscripcion->evento ? [
                    'id' => $inscripcion->evento->id,
                    'nombre_evento' => $inscripcion->evento->nombre_evento,
                    'fecha_inicio' => optional($inscripcion->evento->fecha_inicio)?->format('d/m/Y'),
                    'estado_evento' => $inscripcion->evento->estado_evento,
                ] : null,
            ])->values(),
        ]);
    }
}
