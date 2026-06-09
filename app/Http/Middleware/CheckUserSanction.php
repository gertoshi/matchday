<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserSanction
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if ($user->isBanned()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('login')
                ->withErrors(['email' => $this->bannedMessage($user)])
                ->with('error', $this->bannedMessage($user));
        }

        if ($user->isSuspended() && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return back()->with('error', 'Tu cuenta está suspendida y no podés realizar esta acción.');
        }

        return $next($request);
    }

    private function bannedMessage($user): string
    {
        $motivo = $user->sancionActiva()?->motivo;

        if ($motivo) {
            return "Tu cuenta fue baneada. Motivo: {$motivo}. Contactá con un administrador si creés que esto es un error.";
        }

        return 'Tu cuenta fue baneada. No podés acceder al sistema. Contactá con un administrador si creés que esto es un error.';
    }
}
