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
        Schema::create('jugadores', function (Blueprint $table) {
            $table->id();

            //
            $table  ->foreignId('equipo_id')
                    ->constrained('equipos')
                    ->cascadeOnDelete();

            $table->enum('posicion_jugador', [
                'arquero',
                'defensor',
                'mediocampista',
                'delantero',
            ]);
            $table->integer('numero_jugador');
            $table->enum('sexo', [
                'masculino',
                'femenino',
            ]);
            $table->timestamps();
            $table->unique(['equipo_id', 'numero_jugador']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jugadores');
    }
};
