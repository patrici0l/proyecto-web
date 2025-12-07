import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService, UsuarioApp } from '../../../services/auth';                 // ✅
import { NotificacionComponent } from '../../../components/notificacion/notificacion'; // ✅
import { Observable } from 'rxjs';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  templateUrl: './public-layout.html',
  styleUrls: ['./public-layout.scss'],
  imports: [CommonModule, RouterModule, NotificacionComponent]
})
export class PublicLayoutComponent {

  usuario$: Observable<UsuarioApp | null>;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.usuario$ = this.auth.usuario$;
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
