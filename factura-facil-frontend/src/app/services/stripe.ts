import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  // 1. Obtener el estado actual de la suscripción del freelancer
  getSubscriptionStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/subscription/status`);
  }

  // 2. Crear una sesión de Stripe Checkout para el Plan Freelancer Mensual
  createCheckoutSession(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/stripe/checkout`, {});
  }

  // src/app/services/stripe.service.ts
getCustomerPortalUrl(): Observable<any> {
  // Cambiado de '/stripe/portal' a '/billing-portal' para coincidir con tu routes/api.php
  return this.http.post<any>(`${this.apiUrl}/billing-portal`, {});
}
}