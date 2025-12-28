import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AsesoriasProgramadorService, AsesoriaRecibida } from '../../../../services/asesorias-programador';
import { NotificacionesService } from '../../../../services/notificaciones';

@Component({
  selector: 'app-programador-asesorias',
  standalone: true,
  templateUrl: './asesorias.html',
  styleUrls: ['./asesorias.scss'],
  imports: [CommonModule]
})
export class ProgramadorAsesoriasComponent implements OnInit {

  asesorias: AsesoriaRecibida[] = [];
  cargando = true;
  error: string | null = null;

  // notificación simulada (correo / WhatsApp)
  mensajeSimulado: string | null = null;

  constructor(
    private asesoriasService: AsesoriasProgramadorService,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.cargarAsesorias();
  }

  cargarAsesorias() {
    this.cargando = true;

    this.asesoriasService.listarMias().subscribe({
      next: (lista) => {
        this.asesorias = lista;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.noti.error('No se pudieron cargar las asesorías');
        this.cargando = false;
      }
    });
  }

  cambiarEstado(
    asesoria: AsesoriaRecibida,
    nuevoEstado: 'aprobada' | 'rechazada'
  ) {
    const nombre = asesoria.nombreSolicitante;
    const fechaHora = `${asesoria.fecha} ${asesoria.hora}`;

    const texto =
      nuevoEstado === 'aprobada'
        ? `Hola ${nombre}, tu solicitud de asesoría para el ${fechaHora} ha sido APROBADA.`
        : `Hola ${nombre}, tu solicitud de asesoría para el ${fechaHora} ha sido RECHAZADA.`;

    this.asesoriasService.actualizar(asesoria.id, {
      estado: nuevoEstado,
      respuestaProgramador: texto
    }).subscribe({
      next: () => {
        asesoria.estado = nuevoEstado;
        asesoria.respuestaProgramador = texto;

        this.noti.exito(
          nuevoEstado === 'aprobada'
            ? 'Asesoría aprobada'
            : 'Asesoría rechazada'
        );

        // simulación de notificación
        this.mensajeSimulado =
          `Simulación de notificación

Para: ${asesoria.emailSolicitante}

Mensaje:
${texto}`;
      },
      error: (err) => {
        console.error(err);
        this.noti.error('Error al actualizar la asesoría');
      }
    });
  }

  cerrarMensajeSimulado() {
    this.mensajeSimulado = null;
  }
}
