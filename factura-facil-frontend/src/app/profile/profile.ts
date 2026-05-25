import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../services/profile.service';

interface UserData {
  name: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  // Formulario Reactivo
  profileForm!: FormGroup;

  // Estados de carga y feedback
  loadingProfile = false;
  profileMessage: { text: string; type: 'success' | 'error' } | null = null;

  // Propiedad persistente para los datos reales del usuario
  currentUser: UserData = { name: '', email: '' };

  get avatarInitials(): string {
    const name = this.currentUser.name || this.profileForm?.get('name')?.value;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return 'US';
    }
    const cleanName = name.trim();
    return cleanName.length >= 2 ? cleanName.substring(0, 2).toUpperCase() : cleanName.toUpperCase();
  }

  ngOnInit(): void {
    this.initFormularios();
    this.cargarDatosUsuario();
  }

  private initFormularios(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  private cargarDatosUsuario(): void {
    // 1. Cambiamos 'user' por 'user_data' para que coincida con tu AuthService actualizado
    const sessionStorageUser = localStorage.getItem('user_data'); 
    if (sessionStorageUser) {
      try {
        const user = JSON.parse(sessionStorageUser);
        
        // Guardamos la referencia de los datos reales del usuario
        this.currentUser = {
          name: user.name || '',
          email: user.email || ''
        };

        // Seteamos el formulario
        this.profileForm.patchValue(this.currentUser);
      } catch (error) {
        console.error("Error al parsear el user_data en perfil:", error);
      }
    }
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;

    this.loadingProfile = true;
    this.profileMessage = null;

    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.loadingProfile = false;
        this.profileMessage = { text: res.message || 'Perfil actualizado con éxito.', type: 'success' };
        
        if (res.user) {
          // 2. Aquí también mantenemos la consistencia usando 'user_data' tras la actualización
          localStorage.setItem('user_data', JSON.stringify(res.user));
          
          // Actualizamos la tarjeta de datos actuales de inmediato
          this.currentUser = {
            name: res.user.name,
            email: res.user.email
          };
        }
      },
      error: (err) => {
        this.loadingProfile = false;
        const errorMsg = err.error?.message || 'Error al actualizar el perfil.';
        this.profileMessage = { text: errorMsg, type: 'error' };
      }
    });
  }
}