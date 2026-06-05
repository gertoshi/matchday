<?php

use App\Models\Evento;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('event format must be one of the allowed football formats', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('eventos.store'), eventoPayload(['formato_evento' => 'texto libre']))
        ->assertSessionHasErrors('formato_evento');

    expect(Evento::count())->toBe(0);
});

test('event can be created with normalized football format', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('eventos.store'), eventoPayload(['formato_evento' => 'futbol_7']))
        ->assertRedirect(route('eventos.index'));

    expect(Evento::first()?->formato_evento)->toBe('futbol_7');
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function eventoPayload(array $overrides = []): array
{
    return [
        'nombre_evento' => 'Torneo Relampago',
        'ubicacion_evento' => 'Cancha Central',
        'cupo_evento' => 4,
        'fecha_inicio' => now()->addDay()->toDateString(),
        'fecha_fin' => now()->addDays(2)->toDateString(),
        'formato_evento' => 'futbol_5',
        'tipo_inscripcion' => 'gratis',
        'monto_inscripcion' => null,
        'descripcion_evento' => null,
        ...$overrides,
    ];
}
