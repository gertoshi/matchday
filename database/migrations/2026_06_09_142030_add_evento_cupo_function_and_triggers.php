<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        /**
         * Prueba manual:
         * 1. Crear un evento con cupo_evento = 8 y estado_evento = "abierto".
         * 2. Confirmar inscripciones hasta llegar al cupo.
         * 3. Verificar con: SELECT id, cupo_evento, estado_evento FROM eventos WHERE id = X;
         * 4. Verificar la función con: SELECT fn_evento_cupo_completo(X);
         *
         * Esta regla solo cierra por cupo completo. No reabre automáticamente al rechazar
         * o cancelar inscripciones para no interferir con eventos que ya tengan fixture generado.
         */
        DB::unprepared('DROP TRIGGER IF EXISTS trg_inscripciones_cerrar_evento_update');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_inscripciones_cerrar_evento_insert');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_evento_cupo_completo');

        DB::unprepared(<<<'SQL'
            CREATE FUNCTION fn_evento_cupo_completo(p_evento_id BIGINT)
            RETURNS TINYINT
            READS SQL DATA
            DETERMINISTIC
            BEGIN
                DECLARE v_confirmadas INT DEFAULT 0;
                DECLARE v_cupo INT DEFAULT 0;

                SELECT COUNT(*)
                INTO v_confirmadas
                FROM inscripciones
                WHERE evento_id = p_evento_id
                    AND estado_inscripcion = 'confirmada';

                SELECT cupo_evento
                INTO v_cupo
                FROM eventos
                WHERE id = p_evento_id;

                RETURN IF(v_cupo IS NOT NULL AND v_confirmadas >= v_cupo, 1, 0);
            END
        SQL);

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
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS trg_inscripciones_cerrar_evento_update');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_inscripciones_cerrar_evento_insert');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_evento_cupo_completo');
    }
};
