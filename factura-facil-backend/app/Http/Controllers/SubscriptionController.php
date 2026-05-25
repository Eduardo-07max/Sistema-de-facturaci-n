<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\BillingPortal\Session as BillingPortalSession;

class SubscriptionController extends Controller
{
    public function createCheckoutSession(Request $request): JsonResponse
    {
        Stripe::setApiKey(config('services.stripe.secret') ?? env('STRIPE_SECRET'));

        try {
            $checkoutSession = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price' => 'price_1TXSlFKLftpk6R3zfwgA3Zdc', 
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => env('FRONTEND_URL', 'http://localhost:4200') . '/dashboard?subscription=success',
                'cancel_url' => env('FRONTEND_URL', 'http://localhost:4200') . '/billing?subscription=canceled',
                'customer_email' => $request->user()->email,
                
                // 🔥 ESTO ES LO NUEVO: Guardamos el ID del usuario en Stripe para recuperarlo en el Webhook
                'metadata' => [
                    'user_id' => $request->user()->id,
                ],
            ]);

            return response()->json([
                'checkout_url' => $checkoutSession->url
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'No se pudo crear la sesión de pago: ' . $e->getMessage()
            ], 500);
        }
    }


    // Agrega este método dentro de tu clase SubscriptionController
public function createPortalSession(Request $request): \Illuminate\Http\JsonResponse
{
    $user = $request->user();

    // Verificamos que el usuario tenga un ID de cliente de Stripe asignado
    if (!$user->stripe_customer_id) {
        return response()->json(['error' => 'No tienes ninguna suscripción activa.'], 400);
    }

    Stripe::setApiKey(config('services.stripe.secret') ?? env('STRIPE_SECRET'));

    try {
        // Generamos la sesión del portal de administración de Stripe
        $portalSession = BillingPortalSession::create([
            'customer' => $user->stripe_customer_id,
            'return_url' => env('FRONTEND_URL', 'http://localhost:4200') . '/dashboard', // A donde vuelve si le da "Atrás"
        ]);

        return response()->json([
            'portal_url' => $portalSession->url
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'error' => 'No se pudo abrir el portal de gestión: ' . $e->getMessage()
        ], 500);
    }
}

// 🔥 ESTE ES EL MÉTODO QUE LE FALTABA A TU ANGULAR
   public function status(Request $request): JsonResponse
{
    $user = $request->user();

    // Consideramos suscripción válida si es 'active' O si está 'pending_cancellation'
    $validStatuses = ['active', 'pending_cancellation'];
    
    $hasActiveSubscription = $user->stripe_customer_id && in_array($user->subscription_status, $validStatuses);

    return response()->json([
        'subscribed' => (bool) $hasActiveSubscription
    ], 200);
}
}