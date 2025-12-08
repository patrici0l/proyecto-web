import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService, UsuarioApp } from '../../services/auth';
import { take } from 'rxjs/operators';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, ThemeToggleComponent]
})
export class LoginComponent {

  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async loginGoogle() {
    try {
      this.cargando = true;
      await this.authService.loginConGoogle();

      // Tomamos el usuario con su rol UNA sola vez
      this.authService.usuario$.pipe(take(1)).subscribe((usuario: UsuarioApp | null) => {
        if (!usuario) {
          this.cargando = false;
          return;
        }

        switch (usuario.rol) {
          case 'admin':
            this.router.navigate(['/admin']);
            break;

          case 'programador':
            this.router.navigate(['/programador']);
            break;

          default: // 'usuario'
            this.router.navigate(['/inicio']);
            break;
        }

        this.cargando = false;
      });

    } catch (err) {
      console.error(err);
      alert('Error al iniciar sesión con Google');
      this.cargando = false;
    }
  }
  toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}
}
