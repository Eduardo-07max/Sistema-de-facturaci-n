<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Forzamos que las rutas de la API manejen estado si usas Sanctum con cookies
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Excepciones de CSRF usando rutas relativas limpias
        $middleware->validateCsrfTokens(except: [
            'login',
            'register',
            'logout',
            'api/webhook/stripe', // Tu webhook unificado de Stripe
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();