<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Añadimos el estado de la suscripción (por defecto inactivo)
            $table->string('subscription_status')->default('inactive')->after('password');
            
            // Añadimos el ID de cliente de Stripe por si lo necesitas en el futuro
            $table->string('stripe_customer_id')->nullable()->after('subscription_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['subscription_status', 'stripe_customer_id']);
        });
    }
};