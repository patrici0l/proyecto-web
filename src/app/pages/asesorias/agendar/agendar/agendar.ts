import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AsesoriasService, Asesoria } from '../../../../services/asesorias';
import { ProgramadoresService, Programador } from '../../../../services/programadores';
import { AuthService, UsuarioApp } from '../../../../services/auth';
import { NotificacionesService } from '../../../../services/notificaciones';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs);

@Component({
  selector: 'app-agendar-asesoria',
  standalone: true,
  templateUrl: './agendar.html',
  styleUrls: ['./agendar.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class AgendarAsesoriaComponent implements OnInit {

  form!: FormGroup;
  idProgramador!: string;
  programador: Programador | null = null;
  cargando = false;

  horasDisponibles: string[] = [];
  usuarioActual: UsuarioApp | null = null;
  asesoriasProgramador: Asesoria[] = [];

  hoy!: Date;
  hoyStr!: string;
  fechaSeleccionada!: Date;
  fechaSeleccionadaStr!: string;

  disponibilidadDiaSeleccionado: {
    hora: string;
    ocupado: boolean;
  }[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private asesoriasService: AsesoriasService,
    private programadoresService: ProgramadoresService,
    private authService: AuthService,
    private noti: NotificacionesService       // ✔ Notificaciones agregadas
  ) { }

  ngOnInit(): void {
    this.idProgramador = this.route.snapshot.paramMap.get('idProgramador')!;

    // Inicializar fechas
    this.hoy = this.normalizarFecha(new Date());
    this.fechaSeleccionada = new Date(this.hoy);
    this.hoyStr = this.formatearFecha(this.hoy);
    this.fechaSeleccionadaStr = this.hoyStr;

    this.form = this.fb.group({
      nombreSolicitante: ['', Validators.required],
      emailSolicitante: ['', [Validators.required, Validators.email]],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      comentario: ['']
    });

    // Traer datos del programador
    this.programadoresService.getProgramador(this.idProgramador)
      .subscribe((p) => {
        this.programador = p || null;
        this.horasDisponibles = p?.horasDisponibles || [];
        this.actualizarDisponibilidadDiaSeleccionado();
      });

    // Traer asesorías ya agendadas
    this.asesoriasService.getAsesoriasPorProgramador(this.idProgramador)
      .subscribe(lista => {
        this.asesoriasProgramador = lista;
        this.actualizarDisponibilidadDiaSeleccionado();
      });

    // Usuario actual
    this.authService.usuario$.subscribe(usuario => {
      this.usuarioActual = usuario;

      if (usuario) {
        this.form.patchValue({
          nombreSolicitante: usuario.nombre,
          emailSolicitante: usuario.email
        });
      }
    });
  }

  // Normaliza la fecha
  private normalizarFecha(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  private formatearFecha(fecha: Date): string {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private actualizarDisponibilidadDiaSeleccionado() {
    if (!this.horasDisponibles || this.horasDisponibles.length === 0) {
      this.disponibilidadDiaSeleccionado = [];
      return;
    }

    const fechaStr = this.formatearFecha(this.fechaSeleccionada);
    this.fechaSeleccionadaStr = fechaStr;

    this.disponibilidadDiaSeleccionado = this.horasDisponibles.map(horaSlot => {
      const ocupado = this.asesoriasProgramador.some(a =>
        a.fecha === fechaStr &&
        a.hora === horaSlot &&
        a.estado !== 'rechazada'
      );

      return { hora: horaSlot, ocupado };
    });
  }

  diaSiguiente() {
    this.fechaSeleccionada = this.normalizarFecha(
      new Date(this.fechaSeleccionada.getTime() + 86400000)
    );
    this.actualizarDisponibilidadDiaSeleccionado();
  }

  diaAnterior() {
    const fechaAnterior = this.normalizarFecha(
      new Date(this.fechaSeleccionada.getTime() - 86400000)
    );

    if (this.formatearFecha(fechaAnterior) < this.hoyStr) {
      return;
    }

    this.fechaSeleccionada = fechaAnterior;
    this.actualizarDisponibilidadDiaSeleccionado();
  }

  seleccionarHora(slot: { hora: string; ocupado: boolean }) {
    if (slot.ocupado) return;

    this.form.patchValue({
      fecha: this.fechaSeleccionadaStr,
      hora: slot.hora
    });
  }

  async enviarSolicitud() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.error("Debes completar todos los campos obligatorios");
      return;
    }

    this.cargando = true;
    const formValue = this.form.value;

    const data: Asesoria = {
      idProgramador: this.idProgramador,
      nombreSolicitante: formValue.nombreSolicitante,
      emailSolicitante: formValue.emailSolicitante,
      fecha: formValue.fecha,
      hora: formValue.hora,
      comentario: formValue.comentario,
      estado: 'pendiente',
      creadoEn: new Date().toISOString()
    };

    if (this.usuarioActual) {
      data.idSolicitante = this.usuarioActual.uid;
    }

    try {
      await this.asesoriasService.crearAsesoria(data);

      this.noti.exito("Tu solicitud fue enviada correctamente. El programador la revisará.");

      this.router.navigate(['/portafolio', this.idProgramador]);

    } catch (err) {
      console.error(err);
      this.noti.error("Ocurrió un error al enviar la solicitud");
    } finally {
      this.cargando = false;
    }
  }
}
