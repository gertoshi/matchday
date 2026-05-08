<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EquipoController;
use App\Http\Controllers\JugadorController;
use App\Http\Controllers\EventoController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\PartidoController;
use App\Http\Controllers\PerfilUsuarioController;

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
