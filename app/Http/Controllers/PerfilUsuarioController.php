<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePerfilUsuarioRequest;
use App\Http\Requests\UpdatePerfilUsuarioRequest;
use App\Models\PerfilUsuario;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;

class PerfilUsuarioController extends Controller
{
    public function show(): Response
    {
        $perfil = PerfilUsuario::where('user_id', auth()->id())->first();

        return inertia('perfil_usuario/show', [
            'perfil' => $perfil,
        ]);
    }

    public function create(): Response|RedirectResponse
    {
        $perfil = PerfilUsuario::where('user_id', auth()->id())->first();

        if ($perfil) {
            return redirect()->route('perfil.show');
        }

        return inertia('perfil_usuario/create');
    }

    public function store(StorePerfilUsuarioRequest $request): RedirectResponse
    {
        $datos = $request->validated();

        if ($request->hasFile('foto_perfil')) {
            if ($perfil->foto_perfil) {
                Storage::disk('public')->delete($perfil->foto_perfil);
            }

            $datos['foto_perfil'] = $request
                ->file('foto_perfil')
                ->store('perfiles', 'public');
        }

        PerfilUsuario::updateOrCreate(
            ['user_id' => auth()->id()],
            [
                'nombre' => $datos['nombre'],
                'apellido' => $datos['apellido'],
                'foto_perfil' => $datos['foto_perfil'] ?? null,
            ]
        );

        return redirect()
            ->route('perfil.show')
            ->with('success', 'Perfil creado');
    }

    public function edit(): Response|RedirectResponse
    {
        $perfil = PerfilUsuario::where('user_id', auth()->id())->first();

        if (! $perfil) {
            return redirect()
                ->route('perfil.create')
                ->with('info', 'Primero completá tu perfil.');
        }

        return inertia('perfil_usuario/edit', [
            'perfil' => $perfil,
        ]);
    }

    public function update(UpdatePerfilUsuarioRequest $request): RedirectResponse
    {
        $perfil = PerfilUsuario::where('user_id', auth()->id())->first();

        if (! $perfil) {
            return redirect()->route('perfil.create');
        }

        $datos = $request->validated();

        if ($request->hasFile('foto_perfil')) {
            $datos['foto_perfil'] = $request
                ->file('foto_perfil')
                ->store('perfiles', 'public');
        }

        $perfil->update([
            'nombre' => $datos['nombre'],
            'apellido' => $datos['apellido'],
            'foto_perfil' => $datos['foto_perfil'] ?? $perfil->foto_perfil,
        ]);

        return redirect()
            ->route('perfil.show')
            ->with('success', 'Perfil actualizado');
    }
}
