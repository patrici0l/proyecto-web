import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsesoriasService, Asesoria } from '../../../../services/asesorias';
import { AuthService, UsuarioApp } from '../../../../services/auth';

 
import { RouterModule } from '@angular/router';

 
import { ProgramadoresService, Programador } from '../../../../services/programadores';

import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-programador-asesorias',
  standalone: true,
  templateUrl: './asesorias.html',
  styleUrls: ['./asesorias.scss'],
  imports: [CommonModule, RouterModule]
})
export class ProgramadorAsesoriasComponent implements OnInit {

  asesorias: Asesoria[] = [];
  cargando = true;
  programadorActual: Programador | null = null;

  constructor(
    private authService: AuthService,
    private asesoriasService: AsesoriasService,
    private programadoresService: ProgramadoresService
  ) {}

  ngOnInit(): void {
    this.authService.usuario$
      .pipe(
        switchMap((usuario: UsuarioApp | null) => {
          if (!usuario || !usuario.idProgramador) {
            this.cargando = false;
            return of([]);
          }

          // Cargar datos del programador (opcional)
          this.programadoresService.getProgramador(usuario.idProgramador)
            .subscribe(p => this.programadorActual = p || null);

          // Cargar asesorías del programador
          return this.asesoriasService.getAsesoriasPorProgramador(usuario.idProgramador);
        })
      )
      .subscribe(lista => {
        this.asesorias = lista;
        this.cargando = false;
      });
  }

  async cambiarEstado(asesoria: Asesoria, nuevoEstado: 'aprobada' | 'rechazada') {
    if (!asesoria.id) return;

    let mensaje = '';

    if (nuevoEstado === 'aprobada') {
      mensaje = prompt(
        'Mensaje de confirmación para el estudiante:',
        'Tu asesoría ha sido aprobada 👍'
      ) || '';
    } else {
      mensaje = prompt(
        'Explica por qué rechazas la asesoría:',
        'Lo siento, no podré atender esta asesoría.'
      ) || '';
    }

    try {
      await this.asesoriasService.updateAsesoria(asesoria.id, {
        estado: nuevoEstado,
        respuestaProgramador: mensaje
      });

      // ✅ Actualizar en memoria para reflejar el cambio sin recargar
      asesoria.estado = nuevoEstado;
      asesoria.respuestaProgramador = mensaje;

      alert(`Asesoría ${nuevoEstado === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente.`);
    } catch (err) {
      console.error(err);
      alert('Error al actualizar la asesoría.');
    }
  }
}
