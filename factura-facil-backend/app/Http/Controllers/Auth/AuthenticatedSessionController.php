<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
  public function store(LoginRequest $request): JsonResponse
{
    $request->authenticate();

    $user = $request->user();
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login exitoso',
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user, // 🔥 Agregamos el usuario aquí
    ]);
}

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): JsonResponse
    {
       // Verificamos si el usuario tiene un token activo y lo eliminamos
    if ($request->user()) {
        $request->user()->currentAccessToken()->delete();
    }

    return response()->json([
        'message' => 'Sesión cerrada exitosamente. El token ha sido revocado.'
    ], 200);
    }
}
