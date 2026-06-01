// src/app/services/invoice.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../Models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = 'https://sistema-de-facturaci-n-production.up.railway.app/api/invoices'; // Ajusta tu puerto de Laravel

  // Obtener todas las facturas del freelancer logueado
  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  // Obtener una sola factura
  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  // Generar una nueva factura para un cliente
  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  // Cambiar estado o actualizar factura
  updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  // Cancelar/Eliminar una factura
  deleteInvoice(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Descargar el PDF de la factura (Retorna un Blob binario para el navegador)
  downloadInvoicePDF(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  // Ruta pública: Generar el link de Stripe Checkout para el cliente final
  // Nota: Apunta a la ruta pública fuera de la protección de login
  createClientPaymentSession(id: number): Observable<{ checkout_url: string }> {
    return this.http.post<{ checkout_url: string }>(`https://sistema-de-facturaci-n-production.up.railway.app/api/invoices/${id}/pay`, {});
  }
}