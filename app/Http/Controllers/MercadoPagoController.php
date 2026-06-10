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
use MercadoPago\Webhook\WebhookSignatureValidator;
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

        $accessToken = config('services.mercadopago.access_token');

        if (! is_string($accessToken) || $accessToken === '') {
            return back()->with('error', 'Mercado Pago no está configurado todavía.');
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
                'notification_url' => url('/webhooks/mercadopago'),
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

        $accessToken = config('services.mercadopago.access_token');

        if (! is_string($accessToken) || $accessToken === '') {
            Log::warning('Webhook de Mercado Pago recibido sin access token configurado.');

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

            $status = $payment->status ?? 'unknown';
            $datos = [
                'mercadopago_payment_id' => (string) $payment->id,
                'mercadopago_status' => $status,
            ];

            if ($status === 'approved' && (float) $payment->transaction_amount >= (float) $inscripcion->cuota_inscripcion) {
                $datos = [
                    ...$datos,
                    'cuota_pagada' => true,
                    'fecha_pago' => now(),
                    'metodo_pago' => 'mercadopago',
                    'estado_inscripcion' => 'pendiente',
                ];
            }

            $inscripcion->update($datos);
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

        if (! is_string($secret) || $secret === '') {
            return true;
        }

        try {
            WebhookSignatureValidator::validate(
                $request->header('x-signature'),
                $request->header('x-request-id'),
                (string) $request->input('data.id', $request->query('data.id')),
                $secret,
                300
            );

            return true;
        } catch (\Throwable $exception) {
            Log::warning('Firma inválida en webhook de Mercado Pago.', [
                'message' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    private function obtenerPaymentId(Request $request): ?int
    {
        $paymentId = $request->input('data.id')
            ?? $request->query('data.id')
            ?? $request->input('id')
            ?? $request->query('id');

        if (! $paymentId && is_string($request->input('resource'))) {
            $path = parse_url($request->input('resource'), PHP_URL_PATH);
            $paymentId = $path ? basename($path) : null;
        }

        return is_numeric($paymentId) ? (int) $paymentId : null;
    }
}
