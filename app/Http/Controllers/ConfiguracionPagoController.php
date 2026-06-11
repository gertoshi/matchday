<?php

namespace App\Http\Controllers;

use App\Models\ConfiguracionPago;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ConfiguracionPagoController extends Controller
{
    public function edit(Request $request): Response
    {
        $configuracion = $request->user()
            ->configuracionPago()
            ->where('proveedor', 'mercadopago')
            ->first();

        return inertia('configuracion-pago/edit', [
            'configuracion' => [
                'configurado' => (bool) $configuracion?->access_token,
                'public_key_masked' => $this->mask($configuracion?->public_key),
                'tiene_public_key' => (bool) $configuracion?->public_key,
                'modo' => $configuracion?->modo ?? 'test',
                'activo' => $configuracion?->activo ?? true,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate($this->rules(accessTokenRequired: true));

        $request->user()->configuracionPago()->updateOrCreate(
            ['proveedor' => 'mercadopago'],
            [
                'public_key' => $datos['public_key'] ?? null,
                'access_token' => $datos['access_token'],
                'activo' => (bool) ($datos['activo'] ?? false),
                'modo' => $datos['modo'],
            ],
        );

        return redirect()
            ->route('configuracion-pago.edit')
            ->with('success', 'Configuración de pago guardada correctamente.');
    }

    public function update(Request $request): RedirectResponse
    {
        $configuracion = $request->user()
            ->configuracionPago()
            ->where('proveedor', 'mercadopago')
            ->first();

        $datos = $request->validate($this->rules(accessTokenRequired: ! $configuracion?->access_token));

        $payload = [
            'activo' => (bool) ($datos['activo'] ?? false),
            'modo' => $datos['modo'],
        ];

        if (($datos['public_key'] ?? '') !== '') {
            $payload['public_key'] = $datos['public_key'];
        }

        if (! empty($datos['access_token'])) {
            $payload['access_token'] = $datos['access_token'];
        }

        ConfiguracionPago::query()->updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'proveedor' => 'mercadopago',
            ],
            $payload,
        );

        return redirect()
            ->route('configuracion-pago.edit')
            ->with('success', 'Configuración de pago actualizada correctamente.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(bool $accessTokenRequired): array
    {
        return [
            'modo' => ['required', 'in:test,produccion'],
            'public_key' => ['nullable', 'string', 'max:255'],
            'access_token' => [$accessTokenRequired ? 'required' : 'nullable', 'string'],
            'activo' => ['boolean'],
        ];
    }

    private function mask(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        $length = strlen($value);

        if ($length <= 8) {
            return str_repeat('*', $length);
        }

        return substr($value, 0, 4).str_repeat('*', max(4, $length - 8)).substr($value, -4);
    }
}
