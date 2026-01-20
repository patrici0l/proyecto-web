import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth';

export const rolGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolRequerido: string | undefined = route.data?.['rol'];

  return authService.usuario$.pipe(
    take(1),
    map(usuario => {
      // 1) Si no hay usuario logueado -> login
      if (!usuario) {
        router.navigate(['/login']);
        return false;
      }

  
      if (!rolRequerido) {
        return true;
      }

      // 3) Si se pide rol -> validar
      if (usuario.rol !== rolRequerido) {
        router.navigate(['/inicio']);
        return false;
      }

      return true;
    })
  );
};
