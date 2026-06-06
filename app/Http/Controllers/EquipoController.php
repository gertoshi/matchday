<?php

// Namespace: ubicación del controlador

namespace App\Http\Controllers;

use App\Http\Requests\StoreEquipoRequest;
use App\Http\Requests\UpdateEquipoRequest;
use App\Models\Equipo;
use Illuminate\Support\Facades\Storage;

class EquipoController extends Controller
{
    /**
     * LISTAR todos los equipos del usuario logueado
     */
    public function index()
    {
        // Buscamos los equipos que pertenecen al usuario actual
        // auth()->id() devuelve el id del usuario logueado

        $equipos = Equipo::where('user_id', auth()->id())
            ->with('jugadores')
            ->latest() // ordena por created_at descendente
            ->get();   // ejecuta la consulta

        // Enviamos los equipos a la vista React con Inertia

        return inertia('equipos/index', [
            'equipos' => $equipos,
        ]);
    }

    /**
     * MOSTRAR el formulario para crear un equipo
     */
    public function create()
    {
        // Solo renderiza la vista del formulario

        return inertia('equipos/create');
    }

    /**
     * GUARDAR un nuevo equipo en la base de datos
     */
    public function store(StoreEquipoRequest $request)
    {
        $datos = $request->validated();

        if ($request->hasFile('escudo_equipo')) {
            if ($equipo->escudo_equipo) {
                Storage::disk('public')->delete($equipo->escudo_equipo);
            }

            $datos['escudo_equipo'] = $request
                ->file('escudo_equipo')
                ->store('escudos', 'public');
        }

        Equipo::create([
            'user_id' => auth()->id(),
            'nombre_equipo' => $datos['nombre_equipo'],
            'plantilla' => $datos['plantilla'] ?? 0,
            'escudo_equipo' => $datos['escudo_equipo'] ?? null,
        ]);

        return redirect()
            ->route('equipos.index')
            ->with('success', 'Equipo creado correctamente');
    }

    /**
     * MOSTRAR un equipo específico
     */
    public function show(Equipo $equipo)
    {
        return redirect()
            ->route('equipos.index')
            ->with('info', 'La vista de detalle del equipo todavía no está disponible.');
    }

    /**
     * MOSTRAR el formulario para editar un equipo
     */
    public function edit(Equipo $equipo)
    {
        return inertia('equipos/edit', [
            'equipo' => $equipo,
        ]);
    }

    /**
     * ACTUALIZAR un equipo existente
     */
    public function update(UpdateEquipoRequest $request, Equipo $equipo)
    {
        $datos = $request->validated();

        if ($request->hasFile('escudo_equipo')) {
            $datos['escudo_equipo'] = $request
                ->file('escudo_equipo')
                ->store('escudos', 'public');
        }

        $equipo->update([
            'nombre_equipo' => $datos['nombre_equipo'],
            'plantilla' => $datos['plantilla'] ?? 0,
            'escudo_equipo' => $datos['escudo_equipo'] ?? $equipo->escudo_equipo,
        ]);

        return redirect()
            ->route('equipos.index')
            ->with('success', 'Equipo actualizado');
    }

    /**
     * ELIMINAR un equipo
     */
    public function destroy(Equipo $equipo)
    {
        // Eliminamos el equipo de la base de datos

        $equipo->delete();

        // Redirigimos al listado

        return redirect()
            ->route('equipos.index')
            ->with('success', 'Equipo eliminado');
    }
}
