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
        Schema::create('partidos', function (Blueprint $table) {
            $table->id();
            //Relacion:
            //Muchos partidos -> estan dentro de un solo evento

            $table  ->foreignId('evento_id')
                    ->constrained('eventos')
                    ->cascadeOnDelete();

            $table->datetime('fecha_hora');
            $table->string('ubicacion_partido');
            $table->string('marcador_partido')->nullable();
            $table->string('ganador_partido')->nullable();
            $table->enum('categoria_partido', [
                'Infantil',
                'Adolescente',
                'Juvenil',
                'Senior',
            ])->default('Infantil');       
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partidos');
    }
};
