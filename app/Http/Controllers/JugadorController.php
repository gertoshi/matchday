<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJugadorRequest;
use App\Http\Requests\UpdateJugadorRequest;
use App\Models\Equipo;
use App\Models\Jugador;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class JugadorController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $equipo = auth()->user()?->equipo;

        if (! $equipo) {
            return redirect()
                ->route('equipos.index')
                ->with('info', 'Primero tenés que crear tu equipo para poder cargar jugadores.');
        }

        $jugadores = $equipo->jugadores()
            ->latest()
            ->get();

        return inertia('jugadores/index', [
            'jugadores' => $jugadores,
            'equipo' => [
                'id' => $equipo->id,
                'nombre_equipo' => $equipo->nombre_equipo,
            ],
        ]);
    }

    public function create(): Response|RedirectResponse
    {
        $equipo = auth()->user()?->equipo;

        if (! $equipo) {
            return redirect()
                ->route('equipos.index')
                ->with('info', 'Primero tenés que crear tu equipo para poder cargar jugadores.');
        }

        if ($this->equipoTienePlantillaCompleta($equipo->id)) {
            return redirect()
                ->route('equipos.index')
                ->with('info', 'La plantilla ya tiene el máximo de 10 jugadores');
        }

        return inertia('jugadores/create', [
            'equipo' => [
                'id' => $equipo->id,
                'nombre_equipo' => $equipo->nombre_equipo,
            ],
        ]);
    }

    public function store(StoreJugadorRequest $request): RedirectResponse
    {
        $equipo = auth()->user()?->equipo;

        if (! $equipo) {
            return redirect()
                ->route('equipos.index')
                ->with('info', 'Primero tenés que crear tu equipo para poder cargar jugadores.');
        }

        if ($this->equipoTienePlantillaCompleta($equipo->id)) {
            return redirect()
                ->route('equipos.index')
                ->with('info', 'La plantilla ya tiene el máximo de 10 jugadores');
        }

        $equipo->jugadores()->create($request->validated());

        return redirect()
            ->route('equipos.index')
            ->with('success', 'Jugador creado correctamente');
    }

    public function show(Jugador $jugador): RedirectResponse
    {
        $this->asegurarJugadorDelEquipoAutenticado($jugador);

        return redirect()
            ->route('jugadores.index')
            ->with('info', 'La vista de detalle del jugador todavía no está disponible.');
    }

    public function edit(Jugador $jugador): Response|RedirectResponse
    {
        $this->asegurarJugadorDelEquipoAutenticado($jugador);

        return inertia('jugadores/edit', [
            'jugador' => $jugador,
        ]);
    }

    public function update(UpdateJugadorRequest $request, Jugador $jugador): RedirectResponse
    {
        $this->asegurarJugadorDelEquipoAutenticado($jugador);

        $jugador->update($request->validated());

        return redirect()
            ->route('equipos.index')
            ->with('success', 'Jugador actualizado correctamente');
    }

    public function destroy(Jugador $jugador): RedirectResponse
    {
        $this->asegurarJugadorDelEquipoAutenticado($jugador);

        $jugador->delete();

        return redirect()
            ->route('equipos.index')
            ->with('success', 'Jugador eliminado correctamente');
    }

    private function asegurarJugadorDelEquipoAutenticado(Jugador $jugador): void
    {
        $equipo = $this->obtenerEquipoDelUsuarioAutenticado();

        if (! $equipo || (int) $jugador->equipo_id !== (int) $equipo->id) {
            throw new AuthorizationException('No tenés permiso para eliminar ese jugador.');
        }
    }

    private function equipoTienePlantillaCompleta(int $equipoId): bool
    {
        return Jugador::where('equipo_id', $equipoId)->count() >= 10;
    }

    private function obtenerEquipoDelUsuarioAutenticado(): ?Equipo
    {
        $user = auth()->user();

        if (! $user) {
            return null;
        }

        return $user->equipo()->first();
    }
}
