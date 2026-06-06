<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('partidos', 'fase')) {
            return;
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE partidos MODIFY fase ENUM('grupo', 'cuartos', 'semifinal', 'final') NOT NULL DEFAULT 'grupo'");

            return;
        }

        if (DB::getDriverName() === 'sqlite') {
            $this->rebuildPartidosTable(['grupo', 'cuartos', 'semifinal', 'final']);
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('partidos', 'fase')) {
            return;
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE partidos MODIFY fase ENUM('grupo', 'semifinal', 'final') NOT NULL DEFAULT 'grupo'");

            return;
        }

        if (DB::getDriverName() === 'sqlite') {
            $this->rebuildPartidosTable(['grupo', 'semifinal', 'final']);
        }
    }

    /**
     * @param  array<int, string>  $fases
     */
    private function rebuildPartidosTable(array $fases): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::rename('partidos', 'partidos_old');

        Schema::create('partidos', function (Blueprint $table) use ($fases): void {
            $table->id();
            $table->foreignId('evento_id')->constrained('eventos')->cascadeOnDelete();
            $table->foreignId('equipo_local_id')->nullable()->constrained('equipos')->nullOnDelete();
            $table->foreignId('equipo_visitante_id')->nullable()->constrained('equipos')->nullOnDelete();
            $table->dateTime('fecha_hora');
            $table->string('ubicacion_partido');
            $table->string('marcador_partido')->nullable();
            $table->string('ganador_partido')->nullable();
            $table->enum('categoria_partido', [
                'Infantil',
                'Adolescente',
                'Juvenil',
                'Senior',
            ])->default('Infantil');
            $table->enum('fase', $fases)->default('grupo');
            $table->foreignId('grupo_id')->nullable()->constrained('fixture_grupos')->nullOnDelete();
            $table->integer('goles_local')->nullable();
            $table->integer('goles_visitante')->nullable();
            $table->enum('estado_partido', ['pendiente', 'jugado'])->default('pendiente');
            $table->timestamps();
        });

        $faseSelect = in_array('cuartos', $fases, true)
            ? 'fase'
            : "CASE WHEN fase = 'cuartos' THEN 'semifinal' ELSE fase END";

        DB::statement("
            INSERT INTO partidos (
                id, evento_id, equipo_local_id, equipo_visitante_id, fecha_hora,
                ubicacion_partido, marcador_partido, ganador_partido, categoria_partido,
                fase, grupo_id, goles_local, goles_visitante, estado_partido,
                created_at, updated_at
            )
            SELECT
                id, evento_id, equipo_local_id, equipo_visitante_id, fecha_hora,
                ubicacion_partido, marcador_partido, ganador_partido, categoria_partido,
                {$faseSelect}, grupo_id, goles_local, goles_visitante, estado_partido,
                created_at, updated_at
            FROM partidos_old
        ");

        Schema::drop('partidos_old');
        Schema::enableForeignKeyConstraints();
    }
};
