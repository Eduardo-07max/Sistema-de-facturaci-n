import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-password-change',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './password-change.html',
  styleUrl: './password-change.css',
})
export class PasswordChange implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  passwordForm!: FormGroup;
  loading = false;
  message: { text: string; type: 'success' | 'error' } | null = null;

  ngOnInit(): void {
    this.initFormulario();
  }

  private initFormulario(): void {
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, {
      validators: this.mustMatch('password', 'password_confirmation')
    });
  }

  // Validador personalizado para comprobar que las contraseñas coinciden
  private mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) return;

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    this.message = null;

    // Recuerda que en tu api.php la ruta es: Route::put('/profile/password', ...)
    this.profileService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = { text: res.message || 'Contraseña actualizada con éxito.', type: 'success' };
        this.passwordForm.reset();
      },
      error: (err) => {
        this.loading = false;
        const errorMsg = err.error?.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.';
        this.message = { text: errorMsg, type: 'error' };
      }
    });
  }
}