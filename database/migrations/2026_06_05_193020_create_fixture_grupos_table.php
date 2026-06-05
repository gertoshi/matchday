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
        Schema::create('fixture_grupos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evento_id')
                ->constrained('eventos')
                ->cascadeOnDelete();
            $table->string('nombre_grupo');
            $table->timestamps();

            $table->unique(['evento_id', 'nombre_grupo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixture_grupos');
    }
};
