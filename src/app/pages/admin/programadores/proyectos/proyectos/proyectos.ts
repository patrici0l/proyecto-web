import { ProyectosService, Proyecto } from '../../../../../services/proyectos';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { NotificacionesService } from '../../../../../services/notificaciones';

@Component({
  selector: 'app-proyectos-admin',
  standalone: true,
  templateUrl: './proyectos.html',
  styleUrls: ['./proyectos.scss'],
  imports: [CommonModule, RouterModule]
})
export class ProyectosAdminComponent implements OnInit {

  idProgramador!: string;
  proyectos: Proyecto[] = [];
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proyectosService: ProyectosService,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    // Obtenemos el ID del programador de la URL
    this.idProgramador = this.route.snapshot.paramMap.get('id')!;

    // Usamos el método que filtra por programador (requiere el endpoint nuevo en Java)
    this.proyectosService
      .getProyectosDeProgramador(this.idProgramador)
      .subscribe({
        next: (proys) => {
          this.proyectos = proys;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
          // Si falla, probablemente es porque no has creado el endpoint /programador/{id} en Java
          // pero no romperá la app, solo mostrará error.
          this.noti.error('No se pudieron cargar los proyectos');
        }
      });
  }

  nuevoProyecto() {
    this.router.navigate([
      '/admin',
      'programadores',
      this.idProgramador,
      'proyectos',
      'nuevo'
    ]);
  }

  editarProyecto(idProyecto: string) {
    this.router.navigate([
      '/admin',
      'programadores',
      this.idProgramador,
      'proyectos',
      'editar',
      idProyecto
    ]);
  }

  // CORREGIDO: Eliminación compatible con HTTP (Observables)
  async eliminarProyecto(idProyecto: string) {

    // 1. La confirmación sigue siendo una Promesa (así es tu servicio de notificaciones),
    // así que el await aquí ESTÁ BIEN.
    const confirmado = await this.noti.confirmar(
      '¿Eliminar proyecto?',
      'Esta acción es permanente y no se puede deshacer.'
    );

    if (!confirmado) return;

    // 2. CAMBIO CLAVE: El servicio HTTP devuelve un Observable.
    // No usamos 'await', usamos '.subscribe()'
    this.proyectosService.eliminarProyecto(idProyecto).subscribe({
      next: () => {
        this.noti.exito('Proyecto eliminado correctamente');
        // Actualizamos la lista visualmente filtrando el que borramos
        this.proyectos = this.proyectos.filter(p => p.id !== idProyecto);
      },
      error: (err) => {
        console.error(err);
        this.noti.error('No se pudo eliminar el proyecto');
      }
    });
  }
}