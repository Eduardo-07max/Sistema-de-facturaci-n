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

  // Objeto con los campos idénticos a los que espera Laravel para el registro
  userData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  };

  errorMessage: string = '';

  onRegister(): void {
    this.errorMessage = '';

    // Validación básica antes de enviar los datos
    if (this.userData.password !== this.userData.password_confirmation) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        // Registro exitoso, redirigimos al Dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Manejo de errores por si el correo ya está registrado u otra validación de Laravel falla
        this.errorMessage = err.error?.message || 'Hubo un error al registrar la cuenta. Intenta de nuevo.';
        console.error(err);
      }
    });
  }
}
