import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { Clients } from './clients/clients';
import { Invoices } from './invoices/invoices';
import { PasswordChange } from './password-change/password-change';
import { Profile } from './profile/profile';

export const routes: Routes = [
  // Si entran a la raíz de la app, los redirigimos automáticamente al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Definición de las pantallas individuales
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'clients', component: Clients },
  {
    path: 'invoices',
    component: Invoices,
    title: 'SaaS - Gestión de Facturas' // Opcional: Cambia el título de la pestaña del navegador
  },
  {path: 'password', component:PasswordChange},
  {path: 'edit-profile', component:Profile},
  
  // Si escriben cualquier otra ruta que no existe, los mandamos al login
  { path: '**', redirectTo: 'login' }
];
