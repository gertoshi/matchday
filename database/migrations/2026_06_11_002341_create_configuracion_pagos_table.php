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
        Schema::create('configuraciones_pago', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('proveedor', ['mercadopago'])->default('mercadopago');
            $table->string('public_key', 1024)->nullable();
            $table->text('access_token')->nullable();
            $table->boolean('activo')->default(true);
            $table->enum('modo', ['test', 'produccion'])->default('test');
            $table->timestamps();

            $table->unique(['user_id', 'proveedor']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuraciones_pago');
    }
};
