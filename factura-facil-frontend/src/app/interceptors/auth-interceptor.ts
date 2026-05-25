import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Obtenemos el token guardado en el navegador
  const token = localStorage.getItem('access_token');

  // 2. Si el token existe, clonamos la petición y le agregamos el Header
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  // 3. Si no hay token, dejamos pasar la petición tal cual (como en el login/registro)
  return next(req);
};