import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  userData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  };

  errorMessage: string = '';

  onRegister(): void {
    this.errorMessage = '';

    if (this.userData.password !== this.userData.password_confirmation) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.authService.register(this.userData).subscribe({
      next: (response: any) => {
        // 🔥 GUARDAMOS EL TOKEN TAMBIÉN AQUÍ SI LARAVEL LO INCLUYE AL REGISTRAR
        const token = response.token || response.access_token;
        if (token) {
          localStorage.setItem('token', token);
        }

        // Redirigimos al Dashboard con el token listo
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Hubo un error al registrar la cuenta. Intenta de nuevo.';
        console.error(err);
      }
    });
  }
}