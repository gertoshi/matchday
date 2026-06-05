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
        Schema::table('eventos', function (Blueprint $table) {
            $table->enum('tipo_inscripcion', ['gratis', 'pago'])
                ->default('gratis')
                ->after('formato_evento');
            $table->decimal('monto_inscripcion', 10, 2)
                ->nullable()
                ->after('tipo_inscripcion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('eventos', function (Blueprint $table) {
            $table->dropColumn([
                'tipo_inscripcion',
                'monto_inscripcion',
            ]);
        });
    }
};
