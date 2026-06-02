<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminAdministradorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/administradores/index', [
            'administradores' => User::query()
                ->where('is_admin', true)
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/administradores/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'digits:10'],
            'birth_date' => ['required', 'date'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        User::create([
            ...$data,
            'status' => 'activo',
            'is_admin' => true,
        ]);

        return redirect()->route('admin.administradores.index')->with('success', 'Administrador creado.');
    }
}
