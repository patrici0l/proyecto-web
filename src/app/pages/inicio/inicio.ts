import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UsuarioApp } from '../../services/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss'],
  imports: [CommonModule, RouterModule]
})
export class InicioComponent {


  usuario$: Observable<UsuarioApp | null>;

  constructor(
    private auth: AuthService,
    private router: Router
  ) { 
    // 3. Asignamos el valor DENTRO del constructor

    this.usuario$ = this.auth.usuario$;
  }

  irAPanel(usuario: UsuarioApp | null) {
    if (!usuario) {
      // visitante: lo mandamos a explorar programadores
      this.router.navigate(['/usuarios']);
      return;
    }

    switch (usuario.rol) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'programador':
        this.router.navigate(['/programador']);
        break;
      default:
        // usuario normal
        this.router.navigate(['/usuarios']);
        break;
    }
  }
}