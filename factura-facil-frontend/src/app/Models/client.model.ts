export interface Client {
  id?: number;          // Opcional porque al crear uno nuevo aún no tiene ID
  name: string;
  email: string;
  phone?: string;       // Opcional
  tax_id?: string;      // RFC o identificación fiscal para las facturas (Opcional)
  created_at?: string;
}