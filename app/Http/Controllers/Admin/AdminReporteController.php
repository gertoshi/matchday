<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reporte;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminReporteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/reportes/index', [
            'reportes' => Reporte::query()
                ->with(['usuarioReportado:id,name,email,status', 'usuarioReportante:id,name,email'])
                ->latest()
                ->paginate(10),
        ]);
    }

    public function show(Reporte $reporte): Response
    {
        $reporte->load(['usuarioReportado:id,name,email,status,phone', 'usuarioReportante:id,name,email']);

        return Inertia::render('admin/reportes/show', [
            'reporte' => $reporte,
        ]);
    }

    public function resolver(Reporte $reporte): RedirectResponse
    {
        $reporte->update(['estado' => 'resuelto']);

        return back()->with('success', 'Reporte resuelto.');
    }
}
