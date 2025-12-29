import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AsesoriasService, Asesoria } from '../../../../services/asesorias';
import { ProgramadoresService, Programador } from '../../../../services/programadores';

@Component({
  selector: 'app-mis-asesorias',
  standalone: true,
  templateUrl: './mis-asesorias.html',
  styleUrls: ['./mis-asesorias.scss'],
  imports: [CommonModule, RouterModule]
})
export class MisAsesoriasComponent implements OnInit {

  asesorias: Asesoria[] = [];
  cargando = true;

  // cache para nombres de programadores
  mapProgramadores = new Map<string, Programador>();

  constructor(
    private asesoriasService: AsesoriasService,
    private programadoresService: ProgramadoresService
  ) {}

  ngOnInit(): void {
    this.cargarMisAsesorias();
  }

  /* =========================
     CARGA PRINCIPAL
     ========================= */

  private cargarMisAsesorias(): void {
    this.asesoriasService.getMisAsesorias()
      .subscribe({
        next: (lista) => {
          this.asesorias = lista;
          this.cargarProgramadores(lista);
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        }
      });
  }

  /* =========================
     PROGRAMADORES
     ========================= */

  private cargarProgramadores(lista: Asesoria[]): void {
    const ids = Array.from(
      new Set(lista.map(a => a.idProgramador))
    );

    ids.forEach(id => {
      if (this.mapProgramadores.has(id)) return;

      this.programadoresService.getProgramador(id)
        .subscribe(p => {
          if (p) this.mapProgramadores.set(id, p);
        });
    });
  }

  nombreProgramador(idProgramador: string): string {
    return this.mapProgramadores.get(idProgramador)?.nombre ?? 'Programador';
  }
}
