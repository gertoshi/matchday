<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Equipo;
use App\Models\Evento;
use App\Models\Reporte;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'totalUsuarios' => User::count(),
            'equiposActivos' => Equipo::where('estado_equipo', 'activo')->count(),
            'torneosActivos' => Evento::where('estado_evento', 'abierto')->count(),
            'usuariosSuspendidos' => User::whereIn('status', ['suspendido', 'bloqueado'])->count(),
            'reportesPendientes' => Reporte::where('estado', 'pendiente')->count(),
            'usuariosRecientes' => User::query()
                ->latest()
                ->limit(5)
                ->get(['id', 'name', 'email', 'status', 'created_at']),
            'torneosRecientes' => Evento::query()
                ->with('user:id,name')
                ->latest()
                ->limit(5)
                ->get(['id', 'user_id', 'nombre_evento', 'estado_evento', 'fecha_inicio']),
            'reportesRecientes' => Reporte::query()
                ->with(['usuarioReportado:id,name,email', 'usuarioReportante:id,name,email'])
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }
}
