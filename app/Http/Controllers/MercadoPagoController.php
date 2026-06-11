<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Models\Inscripcion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Exceptions\MPApiException;
use MercadoPago\MercadoPagoConfig;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

class MercadoPagoController extends Controller
{
    public function crearPreferencia(Request $request, Evento $evento): SymfonyResponse|RedirectResponse
    {
        $user = $request->user();
        $equipo = $user?->equipo()->first();

        if (! $user || ! $equipo) {
            return back()->with('error', 'Necesitás un equipo para inscribirte a un torneo.');
        }

        if ($evento->estado_evento !== 'abierto') {
            return back()->with('error', 'Este torneo no acepta nuevas inscripciones.');
        }

        if ($evento->tipo_inscripcion !== 'pago' || (float) $evento->monto_inscripcion <= 0) {
            return back()->with('error', 'Este torneo no tiene pago configurado.');
        }

        $configuracionPago = $evento->user
            ?->configuracionPago()
            ->where('proveedor', 'mercadopago')
            ->where('activo', true)
            ->first();
        $accessToken = $configuracionPago?->access_token;

        if (! is_string($accessToken) || $accessToken === '') {
            return back()->with('error', 'El organizador todavía no configuró su cuenta de Mercado Pago.');
        }

        $inscripcion = null;

        try {
            $inscripcion = DB::transaction(function () use ($evento, $equipo): Inscripcion {
                $eventoBloqueado = Evento::query()
                    ->whereKey($evento->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $inscripcionExistente = Inscripcion::query()
                    ->where('evento_id', $eventoBloqueado->id)
                    ->where('equipo_id', $equipo->id)
                    ->first();

                if ($inscripcionExistente) {
                    abort(409, 'Tu equipo ya está inscripto en este torneo.');
                }

                $ocupados = Inscripcion::query()
                    ->where('evento_id', $eventoBloqueado->id)
                    ->whereIn('estado_inscripcion', ['pendiente', 'confirmada'])
                    ->lockForUpdate()
                    ->count();

                if ($ocupados >= $eventoBloqueado->cupo_evento) {
                    abort(409, 'El torneo ya alcanzó el cupo máximo.');
                }

                return Inscripcion::create([
                    'evento_id' => $eventoBloqueado->id,
                    'equipo_id' => $equipo->id,
                    'fecha_inscripcion' => now(),
                    'estado_inscripcion' => 'pendiente',
                    'cuota_inscripcion' => $eventoBloqueado->monto_inscripcion,
                    'cuota_pagada' => false,
                    'fecha_pago' => null,
                    'metodo_pago' => null,
                    'mercadopago_status' => 'pending',
                ]);
            });

            MercadoPagoConfig::setAccessToken($accessToken);

            $preference = (new PreferenceClient)->create([
                'items' => [
                    [
                        'title' => "Inscripción a {$evento->nombre_evento}",
                        'quantity' => 1,
                        'unit_price' => (float) $evento->monto_inscripcion,
                        'currency_id' => 'ARS',
                    ],
                ],
                'payer' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'external_reference' => (string) $inscripcion->id,
                'back_urls' => [
                    'success' => url('/inscripciones/mercadopago/success'),
                    'failure' => url('/inscripciones/mercadopago/failure'),
                    'pending' => url('/inscripciones/mercadopago/pending'),
                ],
                'auto_return' => 'approved',
                'notification_url' => url('/webhooks/mercadopago').'?'.http_build_query(['inscripcion_id' => $inscripcion->id]),
            ]);

            $inscripcion->update([
                'mercadopago_preference_id' => $preference->id,
            ]);

            $initPoint = $preference->init_point ?: $preference->sandbox_init_point;

            if (! $initPoint) {
                $inscripcion->delete();

                return back()->with('error', 'Mercado Pago no devolvió una URL de pago.');
            }

            return Inertia::location($initPoint);
        } catch (MPApiException $exception) {
            $inscripcion?->delete();

            Log::error('Error al crear preferencia de Mercado Pago.', [
                'status' => $exception->getApiResponse()->getStatusCode(),
                'content' => $exception->getApiResponse()->getContent(),
            ]);

            return back()->with('error', 'No pudimos iniciar el pago con Mercado Pago.');
        } catch (\Throwable $exception) {
            $inscripcion?->delete();

            if ($exception instanceof HttpException && $exception->getStatusCode() === 409) {
                return back()->with('error', $exception->getMessage());
            }

            report($exception);

            return back()->with('error', 'No pudimos iniciar el pago con Mercado Pago.');
        }
    }

    public function webhook(Request $request): Response
    {
        if (! $this->firmaValida($request)) {
            return response(status: 401);
        }

        $paymentId = $this->obtenerPaymentId($request);

        if (! $paymentId) {
            return response(status: 200);
        }

        $inscripcionNotificada = $this->obtenerInscripcionNotificada($request);
        $configuracionPago = $inscripcionNotificada?->evento?->user
            ?->configuracionPago()
            ->where('proveedor', 'mercadopago')
            ->where('activo', true)
            ->first();
        $accessToken = $configuracionPago?->access_token;

        if (! is_string($accessToken) || $accessToken === '') {
            Log::warning('Webhook de Mercado Pago recibido sin configuración de pago del organizador.', [
                'inscripcion_id' => $request->query('inscripcion_id'),
                'x_request_id' => $request->header('x-request-id'),
                'payment_id' => $paymentId,
            ]);

            return response(status: 200);
        }

        try {
            MercadoPagoConfig::setAccessToken($accessToken);

            $payment = (new PaymentClient)->get($paymentId);
            $inscripcionId = (int) $payment->external_reference;

            if ($inscripcionId <= 0) {
                return response(status: 200);
            }

            $inscripcion = Inscripcion::find($inscripcionId);

            if (! $inscripcion) {
                return response(status: 200);
            }

            if ($inscripcionNotificada && (int) $inscripcionNotificada->id !== (int) $inscripcion->id) {
                Log::warning('Webhook de Mercado Pago con referencia externa inconsistente.', [
                    'inscripcion_notificada_id' => $inscripcionNotificada->id,
                    'external_reference' => $inscripcionId,
                ]);

                return response(status: 200);
            }

            $status = $payment->status ?? 'unknown';

            if ($status === 'approved') {
                DB::statement('CALL sp_confirmar_pago_inscripcion(?, ?)', [
                    $inscripcion->id,
                    (string) $payment->id,
                ]);

                return response(status: 200);
            }

            $inscripcion->update([
                'mercadopago_payment_id' => (string) $payment->id,
                'mercadopago_status' => $status,
            ]);
        } catch (\Throwable $exception) {
            report($exception);
        }

        return response(status: 200);
    }

    public function success(): RedirectResponse
    {
        return redirect()
            ->route('inscripciones.index')
            ->with('success', 'Pago recibido. Tu inscripción quedó registrada.');
    }

    public function failure(): RedirectResponse
    {
        return redirect()
            ->route('inscripciones.index')
            ->with('error', 'El pago no pudo completarse.');
    }

    public function pending(): RedirectResponse
    {
        return redirect()
            ->route('inscripciones.index')
            ->with('info', 'El pago está pendiente de confirmación.');
    }

    private function firmaValida(Request $request): bool
    {
        $secret = config('services.mercadopago.webhook_secret');
        $paymentId = $this->obtenerPaymentId($request);
        $requestId = $request->header('x-request-id');

        if (app()->environment('local') || ! is_string($secret) || $secret === '') {
            Log::warning('Webhook sin validación de firma porque no hay secret configurado.', [
                'environment' => app()->environment(),
                'x_request_id' => $requestId,
                'payment_id' => $paymentId,
            ]);

            return true;
        }

        $signature = $this->parseMercadoPagoSignature($request->header('x-signature'));

        if (! $signature['ts'] || ! $signature['v1']) {
            Log::warning('Firma inválida en webhook de Mercado Pago.', [
                'x_request_id' => $requestId,
                'payment_id' => $paymentId,
                'motivo' => 'Header x-signature incompleto o mal formado.',
            ]);

            return false;
        }

        $dataId = $this->obtenerDataIdParaFirma($request);

        if (! $dataId || ! $requestId) {
            Log::warning('Firma inválida en webhook de Mercado Pago.', [
                'x_request_id' => $requestId,
                'payment_id' => $paymentId,
                'motivo' => 'Falta data.id o x-request-id para construir el manifest.',
            ]);

            return false;
        }

        $manifest = "id:{$dataId};request-id:{$requestId};ts:{$signature['ts']};";
        $expectedSignature = hash_hmac('sha256', $manifest, $secret);

        if (! hash_equals($expectedSignature, $signature['v1'])) {
            Log::warning('Firma inválida en webhook de Mercado Pago.', [
                'x_request_id' => $requestId,
                'payment_id' => $paymentId,
                'motivo' => 'SignatureMismatch',
            ]);

            return false;
        }

        $driftSeconds = $this->timestampDriftSeconds($signature['ts']);

        if ($driftSeconds !== null && $driftSeconds > 3600) {
            Log::warning('Webhook de Mercado Pago con diferencia de timestamp.', [
                'x_request_id' => $requestId,
                'payment_id' => $paymentId,
                'drift_seconds' => $driftSeconds,
                'sugerencia' => 'Verificar que la hora del servidor sea correcta con el comando timedatectl.',
            ]);
        }

        return true;
    }

    /**
     * @return array{ts: string|null, v1: string|null}
     */
    private function parseMercadoPagoSignature(?string $header): array
    {
        $signature = [
            'ts' => null,
            'v1' => null,
        ];

        if (! $header) {
            return $signature;
        }

        foreach (explode(',', $header) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, null);

            if (! $key || ! $value) {
                continue;
            }

            $key = strtolower(trim($key));
            $value = trim($value);

            if ($key === 'ts' || $key === 'v1') {
                $signature[$key] = $value;
            }
        }

        return $signature;
    }

    private function obtenerDataIdParaFirma(Request $request): ?string
    {
        $dataId = $this->obtenerValorWebhook($request, 'data.id')
            ?? $this->obtenerValorWebhook($request, 'data_id')
            ?? $this->obtenerValorWebhook($request, 'id');

        return is_scalar($dataId) && (string) $dataId !== '' ? strtolower((string) $dataId) : null;
    }

    private function timestampDriftSeconds(string $timestamp): ?int
    {
        if (! ctype_digit($timestamp)) {
            return null;
        }

        $timestampMs = (int) $timestamp;
        $nowMs = (int) round(microtime(true) * 1000);

        return (int) floor(abs($nowMs - $timestampMs) / 1000);
    }

    private function obtenerPaymentId(Request $request): ?int
    {
        $paymentId = $this->obtenerValorWebhook($request, 'data.id')
            ?? $this->obtenerValorWebhook($request, 'data_id')
            ?? $this->obtenerValorWebhook($request, 'id');

        $resource = $this->obtenerValorWebhook($request, 'resource');

        if (! $paymentId && is_string($resource)) {
            $path = parse_url($resource, PHP_URL_PATH);
            $paymentId = $path ? basename($path) : null;
        }

        return is_numeric($paymentId) ? (int) $paymentId : null;
    }

    private function obtenerValorWebhook(Request $request, string $key): mixed
    {
        $query = $request->query->all();
        $payload = $request->all();

        return $query[$key]
            ?? data_get($query, $key)
            ?? $payload[$key]
            ?? data_get($payload, $key);
    }

    private function obtenerInscripcionNotificada(Request $request): ?Inscripcion
    {
        $inscripcionId = $request->query('inscripcion_id');

        if (! is_numeric($inscripcionId)) {
            return null;
        }

        return Inscripcion::with('evento.user')->find((int) $inscripcionId);
    }
}
