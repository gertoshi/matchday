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
        Schema::create('fixture_grupo_equipos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fixture_grupo_id')
                ->constrained('fixture_grupos')
                ->cascadeOnDelete();
            $table->foreignId('equipo_id')
                ->constrained('equipos')
                ->cascadeOnDelete();
            $table->integer('posicion')->nullable();
            $table->integer('puntos')->default(0);
            $table->integer('partidos_jugados')->default(0);
            $table->integer('ganados')->default(0);
            $table->integer('empatados')->default(0);
            $table->integer('perdidos')->default(0);
            $table->integer('goles_favor')->default(0);
            $table->integer('goles_contra')->default(0);
            $table->integer('diferencia_goles')->default(0);
            $table->timestamps();

            $table->unique(['fixture_grupo_id', 'equipo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixture_grupo_equipos');
    }
};
