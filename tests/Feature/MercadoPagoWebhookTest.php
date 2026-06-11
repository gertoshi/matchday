<?php

use Illuminate\Support\Facades\Log;

test('mercado pago webhook rejects invalid signature in production', function () {
    forceProductionEnvironment();
    config(['services.mercadopago.webhook_secret' => 'test-webhook-secret']);

    $this->postJson(route('webhooks.mercadopago', ['data.id' => '123456']), [
        'type' => 'payment',
    ], [
        'x-request-id' => 'request-123',
        'x-signature' => 'ts=1710000000000,v1=invalid-signature',
    ])->assertUnauthorized();
});

test('mercado pago webhook accepts official signature manifest', function () {
    forceProductionEnvironment();
    config(['services.mercadopago.webhook_secret' => 'test-webhook-secret']);

    $timestamp = '1710000000000';
    $signature = hash_hmac(
        'sha256',
        "id:123456;request-id:request-123;ts:{$timestamp};",
        'test-webhook-secret',
    );

    $this->postJson(route('webhooks.mercadopago', ['data.id' => '123456']), [
        'type' => 'payment',
    ], [
        'x-request-id' => 'request-123',
        'x-signature' => "ts={$timestamp},v1={$signature}",
    ])->assertOk();
});

test('mercado pago webhook is allowed without configured secret', function () {
    forceProductionEnvironment();
    config(['services.mercadopago.webhook_secret' => null]);
    Log::spy();

    $this->postJson(route('webhooks.mercadopago', ['data.id' => '123456']), [
        'type' => 'payment',
    ], [
        'x-request-id' => 'request-123',
        'x-signature' => 'ts=1710000000000,v1=invalid-signature',
    ])->assertOk();

    Log::shouldHaveReceived('warning')->with(
        'Webhook sin validación de firma porque no hay secret configurado.',
        Mockery::on(fn (array $context): bool => $context['x_request_id'] === 'request-123'
            && $context['payment_id'] === 123456),
    );
});

function forceProductionEnvironment(): void
{
    app()->detectEnvironment(fn (): string => 'production');
}
