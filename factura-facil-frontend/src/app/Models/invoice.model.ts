// src/app/Models/invoice.model.ts
import { Client } from './client.model';

export interface Invoice {
  id?: number;
  client_id: number;       // ID del cliente relacionado
  number: string;          // Tu campo exacto (Ej: 'FAC-001')
  amount: number;          // Decimal mapeado a número
  status?: 'pending' | 'paid' | 'canceled'; // Default: 'pending'
  concept: string;         // Descripción corta o motivo del cobro (¡Nuevo!)
  due_date: string;        // Fecha límite de pago en formato 'YYYY-MM-DD' (¡Nuevo!)
  created_at?: string;
  updated_at?: string;
  client?: Client;          // Por si haces Eager Loading en Laravel: $invoice->load('client')
}