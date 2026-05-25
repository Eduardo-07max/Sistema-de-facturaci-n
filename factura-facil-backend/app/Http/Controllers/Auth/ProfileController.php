<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class ProfileController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $user = $request->user(); // Obtenemos el usuario autenticado por el token

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // Validamos que el email sea único, excepto para el usuario actual
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return response()->json([
            'message' => 'Perfil actualizado con éxito',
            'user' => $user
        ], 200);
    }

    /**
     * Cambiar la contraseña del usuario
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'], // Valida que la contraseña actual sea correcta
            'password' => ['required', 'confirmed', Rules\Password::defaults()], // Nueva contraseña
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($request->string('password')),
        ]);

        return response()->json([
            'message' => 'Contraseña actualizada con éxito'
        ], 200);
    }
}
