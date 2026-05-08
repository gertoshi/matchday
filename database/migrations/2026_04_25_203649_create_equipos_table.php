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
        Schema::create('equipos', function (Blueprint $table) {
            $table->id();
            //1 usuario -> 1 equipo
            $table  ->foreignId('user_id')
                    ->constrained('users')
                    ->cascadeOnDelete()
                    ->unique();
            
            $table->string('nombre_equipo');
            $table->string('escudo_equipo')->nullable();
            $table->integer('plantilla')->default(0);        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipos');
    }
};
