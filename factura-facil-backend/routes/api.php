<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\InvoicePaymentController;

// --------------------------------------------------------------------------
// RUTAS PÚBLICAS
// --------------------------------------------------------------------------
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/webhook/stripe', [WebhookController::class, 'handleWebhook']);
Route::post('/invoices/{id}/pay', [InvoicePaymentController::class, 'createPaymentSession']);

// --------------------------------------------------------------------------
// RUTAS PROTEGIDAS (Requieren inicio de sesión vía Sanctum)
// --------------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    
    // 🔥 Rutas de Suscripción que Angular está buscando
    Route::post('/stripe/checkout', [SubscriptionController::class, 'createCheckoutSession']);
    Route::get('/subscription/status', [SubscriptionController::class, 'status']); // El endpoint que faltaba
    
    // Panel de control de Stripe para cancelar/actualizar tarjeta
    Route::post('/billing-portal', [SubscriptionController::class, 'createPortalSession']);

    // Perfil de usuario y Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    // ----------------------------------------------------------------------
    // RUTAS BLOQUEADAS POR SUSCRIPCIÓN ACTIVA
    // ----------------------------------------------------------------------
    Route::middleware(\App\Http\Middleware\CheckSubscription::class)->group(function () {
        Route::get('/invoices/{id}/download', [InvoiceController::class, 'downloadPDF']);
        Route::apiResource('clients', ClientController::class);
        Route::apiResource('invoices', InvoiceController::class);
    });
});