<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Equipo;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminEquipoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/equipos/index', [
            'equipos' => Equipo::query()
                ->with('user:id,name,email,status')
                ->withCount('jugadores')
                ->latest()
                ->paginate(10),
        ]);
    }

    public function show(Equipo $equipo): Response
    {
        $equipo->load(['user:id,name,email,phone,status', 'jugadores', 'inscripciones.evento']);

        return Inertia::render('admin/equipos/show', [
            'equipo' => $equipo,
        ]);
    }

    public function suspender(Equipo $equipo): RedirectResponse
    {
        $equipo->update(['estado_equipo' => 'suspendido']);

        return back()->with('success', 'Equipo suspendido.');
    }

    public function destroy(Equipo $equipo): RedirectResponse
    {
        $equipo->update(['estado_equipo' => 'eliminado']);

        return back()->with('success', 'Equipo marcado como eliminado.');
    }
}
