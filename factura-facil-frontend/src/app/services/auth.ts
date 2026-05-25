import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ponemos la URL base de tu servidor local de Laravel
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  // Método para iniciar sesión
  // Método para iniciar sesión
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
        if (response.user) {
          // 🔥 Guardamos los datos completos del usuario convirtiéndolos a Texto (JSON)
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
      })
    );
  }

  // Método para registrar un nuevo freelancer
  register(userData: { name: string; email: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
        if (response.user) {
          // 🔥 Hacemos lo mismo en el registro
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }
      })
    );
  }
  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('access_token');
  }

  // Método rápido para saber si el usuario tiene un token guardado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}