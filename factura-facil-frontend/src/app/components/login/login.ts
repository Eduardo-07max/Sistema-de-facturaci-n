import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    email: '',
    password: ''
  };

  errorMessage: string = '';

  onLogin(): void {
    this.errorMessage = '';
    
    this.authService.login(this.credentials).subscribe({
      next: (response: any) => {
        // 🔥 GUARDAMOS EL TOKEN: El guard lo necesita para dejarte pasar
        // Si tu API de Laravel devuelve el token con otro nombre (ej. response.access_token), cámbialo aquí abajo:
        const token = response.token || response.access_token;
        
        if (token) {
          localStorage.setItem('token', token);
          // Si tu API también devuelve datos del usuario, puedes guardarlos si quieres:
          // localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Ahora sí, el Guard verá el token y nos dejará pasar al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Credenciales incorrectas. Por favor, intenta de nuevo.';
        console.error(err);
      }
    });
  }
}