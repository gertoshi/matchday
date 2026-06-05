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
        Schema::table('partidos', function (Blueprint $table) {
            $table->foreignId('equipo_local_id')
                ->nullable()
                ->after('evento_id')
                ->constrained('equipos')
                ->nullOnDelete();
            $table->foreignId('equipo_visitante_id')
                ->nullable()
                ->after('equipo_local_id')
                ->constrained('equipos')
                ->nullOnDelete();
            $table->enum('fase', ['grupo', 'semifinal', 'final'])
                ->default('grupo')
                ->after('categoria_partido');
            $table->foreignId('grupo_id')
                ->nullable()
                ->after('fase')
                ->constrained('fixture_grupos')
                ->nullOnDelete();
            $table->integer('goles_local')
                ->nullable()
                ->after('grupo_id');
            $table->integer('goles_visitante')
                ->nullable()
                ->after('goles_local');
            $table->enum('estado_partido', ['pendiente', 'jugado'])
                ->default('pendiente')
                ->after('goles_visitante');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('partidos', function (Blueprint $table) {
            $table->dropForeign(['equipo_local_id']);
            $table->dropForeign(['equipo_visitante_id']);
            $table->dropForeign(['grupo_id']);
            $table->dropColumn([
                'equipo_local_id',
                'equipo_visitante_id',
                'fase',
                'grupo_id',
                'goles_local',
                'goles_visitante',
                'estado_partido',
            ]);
        });
    }
};
