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

        DB::unprepared('DROP PROCEDURE IF EXISTS sp_confirmar_pago_inscripcion');

        DB::unprepared(<<<'SQL'
            CREATE PROCEDURE sp_confirmar_pago_inscripcion(
                IN p_inscripcion_id BIGINT,
                IN p_payment_id VARCHAR(255)
            )
            BEGIN
                UPDATE inscripciones
                SET
                    estado_inscripcion = 'confirmada',
                    cuota_pagada = 1,
                    fecha_pago = NOW(),
                    metodo_pago = 'mercadopago',
                    mercadopago_payment_id = p_payment_id,
                    mercadopago_status = 'approved',
                    updated_at = NOW()
                WHERE id = p_inscripcion_id
                    AND estado_inscripcion NOT IN ('rechazada', 'cancelada');
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

        DB::unprepared('DROP PROCEDURE IF EXISTS sp_confirmar_pago_inscripcion');
    }
};
