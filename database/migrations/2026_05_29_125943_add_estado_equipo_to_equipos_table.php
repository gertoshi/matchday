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
        Schema::table('equipos', function (Blueprint $table) {
            if (! Schema::hasColumn('equipos', 'estado_equipo')) {
                $table->enum('estado_equipo', ['activo', 'suspendido', 'eliminado'])->default('activo')->after('plantilla');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipos', function (Blueprint $table) {
            if (Schema::hasColumn('equipos', 'estado_equipo')) {
                $table->dropColumn('estado_equipo');
            }
        });
    }
};
