<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('jugadores', 'sexo') && ! Schema::hasColumn('jugadores', 'sexo_jugador')) {
            Schema::table('jugadores', function (Blueprint $table) {
                $table->renameColumn('sexo', 'sexo_jugador');
            });
        }

        Schema::table('jugadores', function (Blueprint $table) {
            if (! Schema::hasColumn('jugadores', 'nombre_jugador')) {
                $table->string('nombre_jugador', 100)->nullable()->after('equipo_id');
            }

            if (! Schema::hasColumn('jugadores', 'apellido_jugador')) {
                $table->string('apellido_jugador', 100)->nullable()->after('nombre_jugador');
            }

            if (! Schema::hasColumn('jugadores', 'contacto_jugador')) {
                $table->string('contacto_jugador', 20)->nullable()->after('apellido_jugador');
            }
        });
    }

    public function down(): void
    {
        Schema::table('jugadores', function (Blueprint $table) {
            if (Schema::hasColumn('jugadores', 'contacto_jugador')) {
                $table->dropColumn('contacto_jugador');
            }

            if (Schema::hasColumn('jugadores', 'apellido_jugador')) {
                $table->dropColumn('apellido_jugador');
            }

            if (Schema::hasColumn('jugadores', 'nombre_jugador')) {
                $table->dropColumn('nombre_jugador');
            }
        });

        if (Schema::hasColumn('jugadores', 'sexo_jugador') && ! Schema::hasColumn('jugadores', 'sexo')) {
            Schema::table('jugadores', function (Blueprint $table) {
                $table->renameColumn('sexo_jugador', 'sexo');
            });
        }
    }
};
