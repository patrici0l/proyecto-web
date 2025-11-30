import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgramadoresService, Programador } from '../../../services/programadores';

@Component({
  selector: 'app-programadores',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './programadores.html',
  styleUrls: ['./programadores.scss']
})
export class ProgramadoresComponent implements OnInit {

  programadores: Programador[] = [];

  constructor(private progService: ProgramadoresService) { }

  ngOnInit(): void {
    this.progService.getProgramadores().subscribe((data: Programador[]) => {
      this.programadores = data;
    });
  }

  borrar(id: string | undefined) {
    if (!id) { return; }
    this.progService.deleteProgramador(id);
  }
}
