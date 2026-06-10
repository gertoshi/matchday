<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Features;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    Notification::fake();

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '3704123456',
        'birth_date' => '2000-01-01',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('email', 'test@example.com')->firstOrFail();

    expect($user->email_verified_at)->toBeNull();
    Notification::assertSentTo($user, VerifyEmail::class);
});

test('registration validation messages are spanish', function () {
    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '123',
        'birth_date' => '',
        'password' => '',
        'password_confirmation' => '',
    ])->assertSessionHasErrors([
        'phone' => 'El campo teléfono debe tener 10 dígitos.',
        'birth_date' => 'El campo fecha de nacimiento es obligatorio.',
        'password' => 'El campo contraseña es obligatorio.',
    ]);
});

test('password minimum validation message is spanish', function () {
    $validator = Validator::make([
        'password' => 'short',
    ], [
        'password' => ['required', 'string', Password::min(12)],
    ]);

    expect($validator->errors()->first('password'))
        ->toBe('La contraseña debe tener al menos 12 caracteres.');
});

test('modern password validation messages are spanish', function () {
    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '3704123456',
        'birth_date' => '2000-01-01',
        'password' => 'weakpassword',
        'password_confirmation' => 'different-password',
    ])->assertSessionHasErrors([
        'password' => 'La contraseña debe contener al menos una letra mayúscula y una minúscula.',
    ]);
});
