import { Component } from '@angular/core';
import { ProgramadoresService, Programador } from '../../../services/programadores';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-programadores',
  standalone: true,
  imports: [NgFor],
  templateUrl: './programadores.html',
  styleUrl: './programadores.scss',
})
export class ProgramadoresComponent {

  programadores: Programador[] = [];

  constructor(private progService: ProgramadoresService) {
    this.progService.getProgramadores().subscribe(data => {
      this.programadores = data;
    });
  }

  eliminar(id?: string) {
    if (!id) return;
    const seguro = confirm('¿Seguro que deseas eliminar este programador?');
    if (!seguro) return;
    this.progService.deleteProgramador(id);
  }
}
