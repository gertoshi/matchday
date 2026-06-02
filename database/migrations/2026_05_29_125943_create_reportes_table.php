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
        if (Schema::hasTable('reportes')) {
            return;
        }

        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_reportado_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('usuario_reportante_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('motivo');
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['pendiente', 'revisado', 'resuelto'])->default('pendiente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reportes');
    }
};
