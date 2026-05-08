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
        Schema::create('perfil_usuario', function (Blueprint $table) {
            $table->id();
            //Relacion con la tabla users 1 a 1
            $table  ->foreignId('user_id')
                    ->constrained('users')
                    ->cascadeOnDelete()
                    ->unique();
            
            //Datos personales
            $table->string('nombre');
            $table->string('apellido');
            $table->string('foto_perfil')->nullable();

            //Fechas automaticas
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perfil_usuario');
    }
};
