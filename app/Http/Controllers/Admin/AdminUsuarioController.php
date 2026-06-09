<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sancion;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminUsuarioController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:activo,suspendido,bloqueado,eliminado'],
        ]);

        $usuarios = User::query()
            ->with(['perfilUsuario', 'equipo'])
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/usuarios/index', [
            'usuarios' => $usuarios,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->load([
            'perfilUsuario',
            'equipo.jugadores',
            'eventos.inscripciones',
            'sanciones.admin:id,name,email',
        ]);

        return Inertia::render('admin/usuarios/show', [
            'usuario' => $user,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'phone' => ['required', 'digits:10'],
            'birth_date' => ['nullable', 'date'],
            'status' => ['required', 'in:activo,suspendido,bloqueado,eliminado'],
        ]);

        $user->update($data);

        if ($user->isActive()) {
            $this->cerrarSancionesActivas($user);
        }

        return back()->with('success', 'Usuario actualizado.');
    }

    public function suspender(Request $request, User $user): RedirectResponse
    {
        $this->ensureNotSelf($request, $user);
        $data = $this->validateSancion($request, false);

        $user->update(['status' => 'suspendido']);
        $this->createSancion($request, $user, 'suspension', $data);

        return back()->with('success', 'Usuario suspendido.');
    }

    public function banear(Request $request, User $user): RedirectResponse
    {
        $this->ensureNotSelf($request, $user);
        $data = $this->validateSancion($request, true);

        $user->update(['status' => 'bloqueado']);
        $this->createSancion($request, $user, 'baneo', $data);

        return back()->with('success', 'Usuario baneado.');
    }

    public function reactivar(Request $request, User $user): RedirectResponse
    {
        $this->ensureNotSelf($request, $user);
        $user->update(['status' => 'activo']);
        $this->cerrarSancionesActivas($user);

        return back()->with('success', 'Usuario reactivado.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->ensureNotSelf($request, $user);
        $user->update(['status' => 'eliminado']);

        return redirect()->route('admin.usuarios.index')->with('success', 'Usuario marcado como eliminado.');
    }

    /**
     * @return array{motivo: string, duracion_dias?: int|null, comentarios?: string|null}
     */
    private function validateSancion(Request $request, bool $baneo): array
    {
        return $request->validate([
            'motivo' => ['required', 'string', 'max:255'],
            'duracion_dias' => ['nullable', 'integer', 'min:1', 'max:3650'],
            'comentarios' => ['nullable', 'string'],
        ]);
    }

    /**
     * @param  array{motivo: string, duracion_dias?: int|null, comentarios?: string|null}  $data
     */
    private function createSancion(Request $request, User $user, string $tipo, array $data): void
    {
        $inicio = Carbon::now();
        $duracion = $data['duracion_dias'] ?? null;

        Sancion::create([
            'user_id' => $user->id,
            'admin_id' => $request->user()?->id,
            'tipo' => $tipo,
            'motivo' => $data['motivo'],
            'duracion_dias' => $duracion,
            'comentarios' => $data['comentarios'] ?? null,
            'fecha_inicio' => $inicio,
            'fecha_fin' => $duracion ? $inicio->copy()->addDays($duracion) : null,
        ]);
    }

    private function ensureNotSelf(Request $request, User $user): void
    {
        abort_if($request->user()?->is($user), 422, 'No podés aplicar esta acción sobre tu propio usuario.');
    }

    private function cerrarSancionesActivas(User $user): void
    {
        $user->sanciones()
            ->where(function ($query): void {
                $query->whereNull('fecha_fin')
                    ->orWhere('fecha_fin', '>=', now());
            })
            ->update(['fecha_fin' => now()]);
    }
}
