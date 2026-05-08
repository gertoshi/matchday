<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@matchday.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password'),
                'role' => 'administrador',
                'status' => 'activo',
                'phone' => null,
            ]
        );
    }
}