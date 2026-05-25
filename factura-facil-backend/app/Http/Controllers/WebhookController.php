<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use App\Models\User;
use App\Models\Invoice; 

class WebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');
        
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $event = null;

        try {
            $event = Webhook::constructEvent(
                $payload, $sig_header, $endpoint_secret
            );
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Payload inválido'], 400);
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Firma inválida'], 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object; 
                
                // 1. CASO: ES UNA SUSCRIPCIÓN (Trae user_id)
                $userId = $session->metadata->user_id ?? null;
                if ($userId) {
                    $user = User::find($userId);
                    if ($user) {
                        $user->update([
                            'subscription_status' => 'active',
                            'stripe_customer_id' => $session->customer ?? null
                        ]);
                        Log::info("¡Suscripción ACTIVADA con éxito en BD para el usuario: {$user->email}!");
                    } else {
                        Log::error("Se recibió el pago para el user_id {$userId} pero el usuario no existe en la BD.");
                    }
                }

                // 2. CASO: ES EL PAGO DE UNA FACTURA INDIVIDUAL (Trae invoice_id)
                $invoiceId = $session->metadata->invoice_id ?? null;
                if ($invoiceId) {
                    $invoice = Invoice::find($invoiceId);
                    if ($invoice) {
                        $invoice->update([
                            'status' => 'paid' 
                        ]);
                        Log::info("¡Factura ID: {$invoiceId} ({$invoice->number}) marcada como PAGADA con éxito!");
                    } else {
                        Log::error("Se pagó la factura ID {$invoiceId} pero no existe en la BD.");
                    }
                }
                break;

            // 🔥 NUEVO CASO: EL USUARIO PROGRAMÓ SU CANCELACIÓN (Le dio al botón en el portal)
            case 'customer.subscription.updated':
                $subscription = $event->data->object;
                
                // Verificamos si la suscripción se marcó para cancelarse al final del período contratado
                if ($subscription->cancel_at_period_end) {
                    $stripeCustomerId = $subscription->customer ?? null;
                    if ($stripeCustomerId) {
                        $user = User::where('stripe_customer_id', $stripeCustomerId)->first();
                        if ($user) {
                            // Actualizamos el estado para avisarle a Angular que ya canceló pero aún tiene acceso
                            $user->update([
                                'subscription_status' => 'pending_cancellation'
                            ]);
                            Log::info("El usuario {$user->email} solicitó la baja. Su suscripción finalizará al término del período.");
                        }
                    }
                }
                break;

            // CASO FINAL: LA SUSCRIPCIÓN EXPIRÓ POR COMPLETO (Fin de mes o falta de pago definitiva)
            case 'customer.subscription.deleted':
                $subscription = $event->data->object;
                $stripeCustomerId = $subscription->customer ?? null;

                if ($stripeCustomerId) {
                    $user = User::where('stripe_customer_id', $stripeCustomerId)->first();
                    if ($user) {
                        // Regresamos al usuario a 'inactive' y el middleware bloqueará el acceso inmediatamente
                        $user->update([
                            'subscription_status' => 'inactive'
                        ]);
                        Log::info("Suscripción finalizada en Stripe. Acceso revocado para: {$user->email}");
                    }
                }
                break;

            default:
                Log::info('Evento recibido y omitido: ' . $event->type);
        }

        return response()->json(['status' => 'success'], 200);
    }
}