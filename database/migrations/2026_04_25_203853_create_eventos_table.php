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
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            // RELACIÓN:
            // 1 usuario crea muchos eventos
            // evento pertenece a un usuario
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // DATOS DEL EVENTO
            $table->string('nombre_evento');
            $table->string('ubicacion_evento');
            $table->integer('cupo_evento');

            // estado del torneo
            $table->enum('estado_evento', [
                'abierto',
                'cerrado',
                'finalizado'
            ])->default('abierto');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->text('descripcion_evento')->nullable();
            $table->string('formato_evento');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eventos');
    }
};
