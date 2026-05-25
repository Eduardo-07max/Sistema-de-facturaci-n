<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class InvoicePaymentController extends Controller
{
    public function createPaymentSession($id): JsonResponse
    {
        // 1. Buscamos la factura en la base de datos
        $invoice = Invoice::with('client')->findOrFail($id);

        // 2. Cargamos la clave secreta de Stripe
        Stripe::setApiKey(config('services.stripe.secret') ?? env('STRIPE_SECRET'));

        try {
            // 3. Creamos la sesión de Stripe para un PAGO ÚNICO (mode => payment)
            $checkoutSession = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'mxn', // O la moneda que manejes
                        'product_data' => [
                            'name' => "Pago de Factura: {$invoice->number}",
                            'description' => "Factura emitida para el cliente: {$invoice->client->name}",
                        ],
                        'unit_amount' => $invoice->amount * 100, // Stripe recibe los centavos (Ej: $100.00 se manda como 10000)
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment', // 🔥 Cambia a 'payment' porque es un pago único, no suscripción
                
                // Rutas de redirección para el cliente final
                'success_url' => env('FRONTEND_URL', 'http://localhost:4200') . "/invoices/pay/{$invoice->id}/success",
                'cancel_url' => env('FRONTEND_URL', 'http://localhost:4200') . "/invoices/pay/{$invoice->id}/canceled",
                
                // Pre-llenamos el correo del cliente que debe pagar
                'customer_email' => $invoice->client->email ?? null,
                
                // 🔥 GUARDAMOS EL ID DE LA FACTURA para que el Webhook sepa cuál actualizar
                'metadata' => [
                    'invoice_id' => $invoice->id,
                ],
            ]);

            return response()->json([
                'checkout_url' => $checkoutSession->url
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'No se pudo crear el enlace de pago: ' . $e->getMessage()
            ], 500);
        }
    }
}
