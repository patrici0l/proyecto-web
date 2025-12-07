import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class rolGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(route: any) {
    const rolRequerido = route.data?.rol;

    return this.auth.usuario$.pipe(
      map(usuario => {

        // ❌ No hay usuario → debe iniciar sesión
        if (!usuario) {
          this.router.navigate(['/login']);
          return false;
        }

        // ✔ Usuario logueado sin rol requerido → permitido
        if (!rolRequerido) return true;

        // ❌ Tiene rol incorrecto
        if (usuario.rol !== rolRequerido) {
          this.router.navigate(['/inicio']);
          return false;
        }

        // ✔ Todo OK
        return true;
      })
    );
  }
}
