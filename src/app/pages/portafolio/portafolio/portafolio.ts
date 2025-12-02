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
  proyectosAcademicos: Proyecto[] = [];
  proyectosLaborales: Proyecto[] = [];

  // Agregamos la variable de estado
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private programadoresService: ProgramadoresService,
    private proyectosService: ProyectosService
  ) { }

  ngOnInit(): void {
    const idProgramador = this.route.snapshot.paramMap.get('id')!;

    this.programadoresService.getProgramador(idProgramador)
      .subscribe(p => this.programador = p);

    // Mantenemos tu método original 'getProyectosDeProgramador'
    // pero agregamos la lógica para apagar el 'cargando'
    this.proyectosService.getProyectosDeProgramador(idProgramador)
      .subscribe(lista => {
        this.proyectosAcademicos = lista.filter(p => p.tipoProyecto === 'academico');
        this.proyectosLaborales = lista.filter(p => p.tipoProyecto === 'laboral');

        // Aquí indicamos que ya terminó de cargar
        this.cargando = false;
      });
  }
}