<?php

use App\Http\Controllers\Admin\AdminAdministradorController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminEquipoController;
use App\Http\Controllers\Admin\AdminReporteController;
use App\Http\Controllers\Admin\AdminUsuarioController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EquipoController;
use App\Http\Controllers\EventoController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\JugadorController;
use App\Http\Controllers\PartidoController;
use App\Http\Controllers\PerfilUsuarioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Redirección inicial
|--------------------------------------------------------------------------
*/

Route::inertia('/', 'landing')->name('home');

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get(
        'dashboard',
        DashboardController::class
    )->name('dashboard');

});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('/usuarios', [AdminUsuarioController::class, 'index'])->name('usuarios.index');
    Route::get('/usuarios/{user}', [AdminUsuarioController::class, 'show'])->name('usuarios.show');
    Route::put('/usuarios/{user}', [AdminUsuarioController::class, 'update'])->name('usuarios.update');
    Route::post('/usuarios/{user}/suspender', [AdminUsuarioController::class, 'suspender'])->name('usuarios.suspender');
    Route::post('/usuarios/{user}/banear', [AdminUsuarioController::class, 'banear'])->name('usuarios.banear');
    Route::post('/usuarios/{user}/reactivar', [AdminUsuarioController::class, 'reactivar'])->name('usuarios.reactivar');
    Route::delete('/usuarios/{user}', [AdminUsuarioController::class, 'destroy'])->name('usuarios.destroy');

    Route::get('/administradores', [AdminAdministradorController::class, 'index'])->name('administradores.index');
    Route::get('/administradores/create', [AdminAdministradorController::class, 'create'])->name('administradores.create');
    Route::post('/administradores', [AdminAdministradorController::class, 'store'])->name('administradores.store');

    Route::get('/equipos', [AdminEquipoController::class, 'index'])->name('equipos.index');
    Route::get('/equipos/{equipo}', [AdminEquipoController::class, 'show'])->name('equipos.show');
    Route::post('/equipos/{equipo}/suspender', [AdminEquipoController::class, 'suspender'])->name('equipos.suspender');
    Route::delete('/equipos/{equipo}', [AdminEquipoController::class, 'destroy'])->name('equipos.destroy');

    Route::get('/reportes', [AdminReporteController::class, 'index'])->name('reportes.index');
    Route::get('/reportes/{reporte}', [AdminReporteController::class, 'show'])->name('reportes.show');
    Route::post('/reportes/{reporte}/resolver', [AdminReporteController::class, 'resolver'])->name('reportes.resolver');
});

/*
|--------------------------------------------------------------------------
| Rutas protegidas (requieren login)
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Recursos principales del sistema
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'equipos',
        EquipoController::class
    );

    Route::resource(
        'jugadores',
        JugadorController::class
    )->parameters([
        'jugadores' => 'jugador',
    ]);

    Route::resource(
        'eventos',
        EventoController::class
    );

    Route::resource(
        'inscripciones',
        InscripcionController::class
    );

    Route::resource(
        'partidos',
        PartidoController::class
    );

    /*
    |--------------------------------------------------------------------------
    | Perfil de usuario
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/perfil',
        [PerfilUsuarioController::class, 'show']
    )->name('perfil.show');

    Route::get(
        '/perfil/create',
        [PerfilUsuarioController::class, 'create']
    )->name('perfil.create');

    Route::post(
        '/perfil',
        [PerfilUsuarioController::class, 'store']
    )->name('perfil.store');

    Route::get(
        '/perfil/edit',
        [PerfilUsuarioController::class, 'edit']
    )->name('perfil.edit');

    Route::put(
        '/perfil',
        [PerfilUsuarioController::class, 'update']
    )->name('perfil.update');

});

require __DIR__.'/settings.php';
