// src/app/services/profile.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = 'https://sistema-de-facturaci-n-production.up.railway.app/api/profile'; // URL base para el perfil

  // 1. Actualizar Datos Básicos (Nombre y Correo)
  updateProfile(data: { name: string; email: string }): Observable<any> {
    return this.http.put<any>(this.apiUrl, data);
  }

  // 2. Cambiar la Contraseña
  changePassword(data: { current_password: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/password`, data);
  }
}