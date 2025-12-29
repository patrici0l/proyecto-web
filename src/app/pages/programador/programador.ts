import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // IMPORTANTE
import { MenuComponent } from '../../components/menu/menu';
import { ProyectosService, Proyecto } from '../../services/proyectos';
import { AuthService, UsuarioApp } from '../../services/auth';
import { NotificacionesService } from '../../services/notificaciones';

@Component({
  selector: 'app-programador',
  standalone: true,
  imports: [CommonModule, MenuComponent, RouterLink], // Agregamos RouterLink
  templateUrl: './programador.html',
  styleUrls: ['./programador.scss'],
})
export class ProgramadorComponent implements OnInit {

  usuario: UsuarioApp | null = null;
  proyectos: Proyecto[] = [];
  cargando = true;

  constructor(
    private auth: AuthService,
    private proyectosService: ProyectosService,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.auth.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        this.cargarProyectos();
      } else {
        this.cargando = false;
      }
    });
  }

  private cargarProyectos() {
    this.cargando = true;
    this.proyectosService.getProyectos().subscribe({
        next: (lista) => {
          this.proyectos = lista;
          this.cargando = false;
        },
        error: (err) => {
          console.error(err);
          this.cargando = false;
        }
      });
  }

  // Nota: Si quieres crear nuevo en otra pagina, también deberías hacer un routerLink
  nuevoProyecto() {
     this.noti.confirmar("Funcionalidad en construcción (o redirigir a /nuevo)");
  }

  async eliminarProyecto(p: Proyecto) {
    if (!p.id) return;
    const confirmar = await this.noti.confirmar(
      '¿Eliminar proyecto?', 
      'No se puede deshacer.'
    );
    if (!confirmar) return;

    this.proyectosService.eliminarProyecto(p.id).subscribe({
      next: () => {
        this.noti.exito('Eliminado.');
        this.cargarProyectos();
      },
      error: () => this.noti.error('Error al eliminar.')
    });
  }
}