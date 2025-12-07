import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService, UsuarioApp } from '../../../services/auth';                 // ✅
import { NotificacionComponent } from '../../../components/notificacion/notificacion'; // ✅
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss'],
  imports: [CommonModule, RouterModule, NotificacionComponent]
})
export class AdminLayoutComponent {

  usuario$: Observable<UsuarioApp | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.usuario$ = this.authService.usuario$;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
