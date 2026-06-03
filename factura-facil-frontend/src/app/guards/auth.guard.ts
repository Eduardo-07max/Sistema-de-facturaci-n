import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Verificamos si existe el token de sesión de Laravel en el almacenamiento local
  const token = localStorage.getItem('token'); 

  if (token) {
    return true; // Hay sesión activa, permitimos el paso libremente
  }

  // Si no hay token, lo redirigimos directo al login e interrumpimos la carga de la vista
  router.navigate(['/login']);
  return false;
};