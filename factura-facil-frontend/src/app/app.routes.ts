import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { Clients } from './clients/clients';
import { Invoices } from './invoices/invoices';
import { PasswordChange } from './password-change/password-change';
import { Profile } from './profile/profile';
import { authGuard } from './guards/auth.guard'; // 🔒 Importamos el guard funcional

export const routes: Routes = [
  // Si entran a la raíz de la app, los redirigimos automáticamente al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Pantallas públicas
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  
  // 🔒 Pantallas privadas protegidas por el AuthGuard
  { 
    path: 'dashboard', 
    component: Dashboard, 
    canActivate: [authGuard] 
  },
  { 
    path: 'clients', 
    component: Clients, 
    canActivate: [authGuard] 
  },
  {
    path: 'invoices',
    component: Invoices,
    canActivate: [authGuard],
    title: 'SaaS - Gestión de Facturas'
  },
  { 
    path: 'password', 
    component: PasswordChange, 
    canActivate: [authGuard] 
  },
  { 
    path: 'edit-profile', 
    component: Profile, 
    canActivate: [authGuard] 
  },
  
  // Si escriben cualquier otra ruta que no existe, los mandamos al login
  { path: '**', redirectTo: 'login' }
];