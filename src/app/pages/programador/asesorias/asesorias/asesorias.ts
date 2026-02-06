import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AsesoriasService, Asesoria } from '../../../../services/asesorias';
import { NotificacionesService } from '../../../../services/notificaciones';
import { WhatsappService, WhatsappLinkResponse } from '../../../../services/whatsapp.service';

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
    private noti: NotificacionesService,
    private whatsapp: WhatsappService
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
        error: (err: any) => {
          console.error('Error cargando asesorías:', err);
          this.noti.error(`No se pudieron cargar las asesorías: ${err?.status ?? ''} ${err?.url ?? ''}`);
          this.cargando = false;
        }
      });
  }

  cambiarEstado(asesoria: Asesoria, nuevoEstado: 'aprobada' | 'rechazada'): void {
    const nombre = asesoria.nombreSolicitante;
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

        if (nuevoEstado === 'aprobada') {
          this.noti.exito('Solicitud Aprobada. Correo de confirmación enviado.');
        } else {
          this.noti.info('Solicitud Rechazada. El usuario ha sido notificado.');
        }
      },
      error: (err: any) => {
        console.error('Error al actualizar estado:', err);
        this.noti.error(`Error al procesar la solicitud: ${err?.status ?? ''} ${err?.statusText ?? ''}`);
      }
    });
  }

  /**
   * Genera y abre un link de WhatsApp utilizando el teléfono registrado.
   * Maneja el bloqueo de popups abriendo la pestaña ANTES de la llamada asíncrona.
   */
  enviarWhatsapp(asesoria: Asesoria) {
    const telefono = ((asesoria as any).telefonoSolicitante || '').trim();

    if (!telefono) {
      this.noti.error('Esta asesoría no tiene teléfono de WhatsApp registrado.');
      return;
    }

    const mensaje = asesoria.respuestaProgramador
      ? asesoria.respuestaProgramador
      : `Hola ${asesoria.nombreSolicitante}, tu asesoría está en estado: ${asesoria.estado}. Fecha: ${asesoria.fecha} Hora: ${asesoria.hora}`;

    // 1. Abrimos la ventana inmediatamente para que el navegador no la bloquee
    const nuevaVentana = window.open('', '_blank');

    this.whatsapp.generarLink(telefono, mensaje).subscribe({
      next: (res: WhatsappLinkResponse) => {
        if (nuevaVentana) {
          // 2. Si la ventana se abrió con éxito, redirigimos a la URL del API
          nuevaVentana.location.href = res.link;
          this.noti.exito('Abriendo WhatsApp...');
        } else {
          // Fallback en caso de que window.open haya devuelto null
          window.location.href = res.link;
        }
      },
      error: (err: any) => {
        // 3. Si el API falla, cerramos la pestaña en blanco para no ensuciar el navegador
        if (nuevaVentana) nuevaVentana.close();
        
        console.error('WhatsApp error:', err);
        this.noti.error(`WhatsApp falló: ${err?.status} - ${err?.message}`);
      }
    });
  }
}