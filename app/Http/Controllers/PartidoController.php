<?php

namespace App\Http\Controllers;

use App\Models\Partido;
use App\Models\Evento;

use App\Http\Requests\StorePartidoRequest;
use App\Http\Requests\UpdatePartidoRequest;

class PartidoController extends Controller
{
    /**
     * LISTAR partidos
     */
    public function index()
    {
        $partidos = Partido::with('evento')
                            ->latest()
                            ->get();

        return inertia('partidos/index', [
            'partidos' => $partidos
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
    )
    {
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
    )
    {
        return redirect()
            ->route('partidos.index')
            ->with('info', 'La vista de detalle del partido todavía no está disponible.');
    }

    /**
     * FORMULARIO editar partido
     */
    public function edit(
        Partido $partido
    )
    {
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
    )
    {
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
    )
    {
        $partido->delete();

        return redirect()
            ->route('partidos.index')
            ->with('success', 'Partido eliminado');
    }
}
