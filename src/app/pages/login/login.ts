import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { NgIf } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  cargando = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async loginConGoogle() {
    this.cargando = true;
    this.error = null;

    try {
      // 1. Login con Google
      await this.authService.loginWithGoogle();

      // 2. Obtener el usuario con rol
      const user: any = await firstValueFrom(this.authService.userWithRole$);

      if (!user) {
        this.error = 'No se pudo obtener información del usuario.';
        return;
      }

      // 3. Redirección según rol
      if (user.rol === 'admin') {
        this.router.navigate(['/admin']);
      } else if (user.rol === 'programador') {
        this.router.navigate(['/programador']);
      } else {
        this.router.navigate(['/inicio']); // usuario normal
      }
    } catch (err) {
      console.error(err);
      this.error = 'Error al iniciar sesión con Google.';
    } finally {
      this.cargando = false;
    }
  }
}
