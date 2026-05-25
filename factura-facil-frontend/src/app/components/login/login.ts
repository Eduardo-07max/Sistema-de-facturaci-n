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
// 🔥 Inyectamos los servicios de forma moderna sin constructor
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
      next: (response) => {
        // Si todo sale bien, mandamos al freelancer al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Si las credenciales no coinciden o hay un error
        this.errorMessage = 'Credenciales incorrectas. Por favor, intenta de nuevo.';
        console.error(err);
      }
    });
  }
}
