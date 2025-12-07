
import { ProyectosService, Proyecto } from '../../../../../services/proyectos';
// src/app/pages/admin/programadores/proyectos/proyectos/proyectos.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { NotificacionesService } from '../../../../../services/notificaciones'; // ✅ 4 niveles hacia arriba

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
    this.idProgramador = this.route.snapshot.paramMap.get('id')!;

    this.proyectosService
      .getProyectosDeProgramador(this.idProgramador)
      .subscribe(proys => {
        this.proyectos = proys;
        this.cargando = false;
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

  async eliminarProyecto(idProyecto: string) {
    const ok = confirm('¿Eliminar este proyecto?');
    if (!ok) return;

    await this.proyectosService.eliminarProyecto(idProyecto);
  }
}
