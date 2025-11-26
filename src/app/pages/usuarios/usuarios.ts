import { Component } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosComponent {
  usuarios = [
    { id: 1, nombre: 'Juan Pérez', correo: 'juan@example.com' },
    { id: 2, nombre: 'María López', correo: 'maria@example.com' },
    { id: 3, nombre: 'Carlos Ruiz', correo: 'carlos@example.com' },
  ];
}
