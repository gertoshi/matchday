<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();

            // Relacion:
            // Una inscripción pertenece a un evento
            $table  ->foreignId('evento_id')
                    ->constrained('eventos')
                    ->cascadeOnDelete();
            //Relacion:
            //Una inscripcion pertenece a un equipo
            $table  ->foreignId('equipo_id')
                    ->constrained('equipos')
                    ->cascadeOnDelete();

            //Datos de la inscripcion
            $table->datetime('fecha_inscripcion');
            $table->enum('estado_inscripcion', [
                'pendiente',
                'confirmada',
                'rechazada',
                'cancelada',
            ])->default('pendiente');
            $table->decimal('cuota_inscripcion', 10,2)->default(0);
            $table->boolean('cuota_pagada')->default(false);
            $table->datetime('fecha_pago')->nullable();
            $table->string('metodo_pago', 50)->nullable();
            $table->text('observaciones')->nullable();

            $table->timestamps();
            $table->unique(['evento_id', 'equipo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscripciones');
    }
};
