import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // 🔥 Importamos withInterceptors
import { authInterceptor } from './interceptors/auth-interceptor'; // 🔥 Importamos tu interceptor
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // 🔥 Registramos el httpClient configurado con nuestro interceptor funcional
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};