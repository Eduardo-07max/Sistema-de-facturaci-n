<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificamos si el usuario logueado no tiene la suscripción activa
        if ($request->user() && $request->user()->subscription_status !== 'active') {
            return response()->json([
                'error' => 'Suscripción requerida',
                'message' => 'Debes contratar el plan Premium para utilizar esta función.'
            ], 403); // 403 Forbidden significa que el servidor entiende la petición pero se niega a autorizarla
        }

        return $next($request);
    }
}