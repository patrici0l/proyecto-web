import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AsesoriasService, Asesoria } from '../../../../services/asesorias';
import { NotificacionesService } from '../../../../services/notificaciones';

@Component({
  selector: 'app-programador-asesorias',
  standalone: true,
  templateUrl: './asesorias.html',
  styleUrls: ['./asesorias.scss'],
  imports: [CommonModule]
})
export class ProgramadorAsesoriasComponent implements OnInit {

  asesorias: Asesoria[] = [];
  cargando = true;
  error: string | null = null;

  constructor(
    private asesoriasService: AsesoriasService,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.cargarAsesorias();
  }

  cargarAsesorias(): void {
    this.cargando = true;
    this.asesoriasService.getAsesoriasDelProgramador()
      .subscribe({
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

  cambiarEstado(asesoria: Asesoria, nuevoEstado: 'aprobada' | 'rechazada'): void {
    const nombre = asesoria.nombreSolicitante;
    // Texto simple para el correo
    const texto = nuevoEstado === 'aprobada'
      ? `Hola ${nombre}, tu solicitud ha sido APROBADA. Nos vemos en la fecha acordada.`
      : `Hola ${nombre}, lamentablemente tu solicitud ha sido RECHAZADA en esta ocasión.`;

    this.asesoriasService.updateAsesoria(asesoria.id!, {
      estado: nuevoEstado,
      respuestaProgramador: texto
    }).subscribe({
      next: () => {
        asesoria.estado = nuevoEstado;
        asesoria.respuestaProgramador = texto;

        // ✅ Notificación REAL al usuario del sistema (Tú)
        if (nuevoEstado === 'aprobada') {
          this.noti.exito('Solicitud Aprobada. Correo de confirmación enviado.');
        } else {
          this.noti.info('Solicitud Rechazada. El usuario ha sido notificado.');
        }
      },
      error: (err) => {
        console.error(err);
        this.noti.error('Error al procesar la solicitud.');
      }
    });
  }
}