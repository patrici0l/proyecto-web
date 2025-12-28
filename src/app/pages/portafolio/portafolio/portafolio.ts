import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { ProgramadoresService, Programador } from '../../../services/programadores';
import { ProyectosService, Proyecto } from '../../../services/proyectos';

@Component({
  selector: 'app-portafolio',
  standalone: true,
  templateUrl: './portafolio.html',
  styleUrls: ['./portafolio.scss'],
  imports: [CommonModule, RouterModule]
})
export class PortafolioComponent implements OnInit {

  programador: Programador | null = null;
  proyectos: Proyecto[] = [];

  cargando = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private programadoresService: ProgramadoresService,
    private proyectosService: ProyectosService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de programador inválido.';
      this.cargando = false;
      return;
    }

    // 1) Cargar programador
    this.programadoresService.getProgramador(id).subscribe({
      next: (p) => {
        this.programador = p;

        // 2) Cargar proyectos del programador
        this.proyectosService.getProyectosDeProgramador(id).subscribe({
          next: (lista) => {
            this.proyectos = lista;
            this.cargando = false;
          },
          error: (err) => {
            console.error(err);
            this.error = 'No se pudieron cargar los proyectos.';
            this.cargando = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar el programador.';
        this.cargando = false;
      }
    });
  }
}
