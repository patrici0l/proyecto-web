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

  constructor(
    private route: ActivatedRoute,
    private programadoresService: ProgramadoresService,
    private proyectosService: ProyectosService
  ) { }

  ngOnInit(): void {
    const idProgramador = this.route.snapshot.paramMap.get('id')!;

    this.programadoresService.getProgramador(idProgramador)
      .subscribe(p => this.programador = p);

    this.proyectosService.getProyectosDeProgramador(idProgramador)
      .subscribe(lista => {
        this.proyectosAcademicos = lista.filter(p => p.tipoProyecto === 'academico');
        this.proyectosLaborales = lista.filter(p => p.tipoProyecto === 'laboral');
      });
  }
}
