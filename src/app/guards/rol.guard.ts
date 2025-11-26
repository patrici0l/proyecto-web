import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { map } from 'rxjs';

export const rolGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolEsperado = route.data['rol'] as string;

  return authService.userWithRole$.pipe(
    map((user) => {
      // Si no hay usuario → login
      if (!user) {
        return router.parseUrl('/login');
      }

      // Si el rol coincide → permitir
      if (user.rol === rolEsperado) {
        return true;
      }

      // Si no coincide, redirigir según su rol real
      if (user.rol === 'admin') {
        return router.parseUrl('/admin');
      }

      if (user.rol === 'programador') {
        return router.parseUrl('/programador');
      }

      // Usuario normal
      return router.parseUrl('/inicio');
    })
  );
};
