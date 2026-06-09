<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            $this->rebuildSqliteEventosTable(['abierto', 'en_curso', 'finalizado'], true);

            return;
        }

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS trg_inscripciones_cerrar_evento_insert');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_inscripciones_cerrar_evento_update');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_inscripciones_cupo_insert');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_inscripciones_cupo_update');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_partidos_finalizar_evento');

        DB::unprepared("ALTER TABLE eventos MODIFY COLUMN estado_evento ENUM('abierto','cerrado','en_curso','finalizado') NOT NULL DEFAULT 'abierto'");
        DB::unprepared("UPDATE eventos SET estado_evento = 'en_curso' WHERE estado_evento = 'cerrado'");
        DB::unprepared("ALTER TABLE eventos MODIFY COLUMN estado_evento ENUM('abierto','en_curso','finalizado') NOT NULL DEFAULT 'abierto'");

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER trg_inscripciones_cupo_insert
            AFTER INSERT ON inscripciones
            FOR EACH ROW
            BEGIN
                IF fn_evento_cupo_completo(NEW.evento_id) = 1 THEN
                    UPDATE eventos
                    SET estado_evento = 'en_curso'
                    WHERE id = NEW.evento_id
                        AND estado_evento = 'abierto';
                END IF;
            END
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER trg_inscripciones_cupo_update
            AFTER UPDATE ON inscripciones
            FOR EACH ROW
            BEGIN
                IF OLD.estado_inscripcion <> NEW.estado_inscripcion
                    OR OLD.evento_id <> NEW.evento_id THEN
                    IF fn_evento_cupo_completo(NEW.evento_id) = 1 THEN
                        UPDATE eventos
                        SET estado_evento = 'en_curso'
                        WHERE id = NEW.evento_id
                            AND estado_evento = 'abierto';
                    END IF;
                END IF;
            END
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER trg_partidos_finalizar_evento
            AFTER UPDATE ON partidos
            FOR EACH ROW
            BEGIN
                IF NEW.fase = 'final'
                    AND NEW.estado_partido = 'jugado'
                    AND NEW.ganador_partido IS NOT NULL
                    AND NEW.ganador_partido <> ''
                    AND (OLD.estado_partido <> 'jugado' OR OLD.estado_partido IS NULL) THEN
                    UPDATE eventos
                    SET estado_evento = 'finalizado'
                    WHERE id = NEW.evento_id
                        AND estado_evento = 'en_curso';
                END IF;
            END
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            $this->rebuildSqliteEventosTable(['abierto', 'cerrado', 'en_curso', 'finalizado']);

            return;
        }

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS trg_partidos_finalizar_evento');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_inscripciones_cupo_update');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_inscripciones_cupo_insert');

        DB::unprepared("ALTER TABLE eventos MODIFY COLUMN estado_evento ENUM('abierto','cerrado','en_curso','finalizado') NOT NULL DEFAULT 'abierto'");

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER trg_inscripciones_cerrar_evento_insert
            AFTER INSERT ON inscripciones
            FOR EACH ROW
            BEGIN
                IF fn_evento_cupo_completo(NEW.evento_id) = 1 THEN
                    UPDATE eventos
                    SET estado_evento = 'cerrado'
                    WHERE id = NEW.evento_id
                        AND estado_evento = 'abierto';
                END IF;
            END
        SQL);

        DB::unprepared(<<<'SQL'
            CREATE TRIGGER trg_inscripciones_cerrar_evento_update
            AFTER UPDATE ON inscripciones
            FOR EACH ROW
            BEGIN
                IF OLD.estado_inscripcion <> NEW.estado_inscripcion
                    OR OLD.evento_id <> NEW.evento_id THEN
                    IF fn_evento_cupo_completo(NEW.evento_id) = 1 THEN
                        UPDATE eventos
                        SET estado_evento = 'cerrado'
                        WHERE id = NEW.evento_id
                            AND estado_evento = 'abierto';
                    END IF;
                END IF;
            END
        SQL);
    }

    /**
     * @param  array<int, string>  $estados
     */
    private function rebuildSqliteEventosTable(array $estados, bool $convertirCerrados = false): void
    {
        DB::statement('PRAGMA foreign_keys = OFF');
        DB::statement('PRAGMA legacy_alter_table = ON');
        DB::statement('ALTER TABLE eventos RENAME TO eventos_old');

        Schema::create('eventos', function (Blueprint $table) use ($estados): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nombre_evento');
            $table->string('ubicacion_evento');
            $table->integer('cupo_evento');
            $table->enum('estado_evento', $estados)->default('abierto');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->text('descripcion_evento')->nullable();
            $table->string('formato_evento');
            $table->timestamps();
            $table->enum('tipo_inscripcion', ['gratis', 'pago'])->default('gratis');
            $table->decimal('monto_inscripcion', 10, 2)->nullable();
        });

        $estadoSelect = $convertirCerrados
            ? "CASE WHEN estado_evento = 'cerrado' THEN 'en_curso' ELSE estado_evento END"
            : 'estado_evento';

        DB::statement("
            INSERT INTO eventos (
                id, user_id, nombre_evento, ubicacion_evento, cupo_evento,
                estado_evento, fecha_inicio, fecha_fin, descripcion_evento,
                formato_evento, created_at, updated_at, tipo_inscripcion,
                monto_inscripcion
            )
            SELECT
                id, user_id, nombre_evento, ubicacion_evento, cupo_evento,
                {$estadoSelect}, fecha_inicio, fecha_fin, descripcion_evento,
                formato_evento, created_at, updated_at, tipo_inscripcion,
                monto_inscripcion
            FROM eventos_old
        ");

        Schema::drop('eventos_old');
        DB::statement('PRAGMA legacy_alter_table = OFF');
        DB::statement('PRAGMA foreign_keys = ON');
    }
};
