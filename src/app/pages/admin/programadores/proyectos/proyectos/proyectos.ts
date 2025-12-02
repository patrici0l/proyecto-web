import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { ProyectosService, Proyecto } from '../../../../../services/proyectos';

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
    private proyectosService: ProyectosService
  ) { }

  ngOnInit(): void {
    // /admin/programadores/:id/proyectos
    this.idProgramador = this.route.snapshot.paramMap.get('id')!;
    this.cargarProyectos();
  }

  cargarProyectos() {
    this.cargando = true;
    this.proyectosService.getProyectos(this.idProgramador)
      .subscribe((proys: Proyecto[]) => {
        this.proyectos = proys;
        this.cargando = false;
      });
  }

  eliminar(idProyecto?: string) {
    if (!idProyecto) { return; }
    if (!confirm('¿Seguro que deseas eliminar este proyecto?')) { return; }

    this.proyectosService.deleteProyecto(this.idProgramador, idProyecto)
      .then(() => this.cargarProyectos())
      .catch(err => {
        console.error(err);
        alert('Error al eliminar el proyecto');
      });
  }
}
