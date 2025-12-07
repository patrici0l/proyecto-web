import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AsesoriasService, Asesoria } from '../../../../services/asesorias';
import { ProgramadoresService, Programador } from '../../../../services/programadores';
import { AuthService, UsuarioApp } from '../../../../services/auth';

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

  // Horas configuradas por el admin
  horasDisponibles: string[] = [];

  // Usuario logueado (si lo hay)
  usuarioActual: UsuarioApp | null = null;

  // Asesorías ya agendadas con este programador
  asesoriasProgramador: Asesoria[] = [];

  // Manejo de fechas para el mini-calendario
  hoy!: Date;
  hoyStr!: string;                  // 'YYYY-MM-DD'
  fechaSeleccionada!: Date;
  fechaSeleccionadaStr!: string;    // 'YYYY-MM-DD'

  // Horas de la fecha seleccionada con estado ocupado/libre
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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // id del programador desde la URL
    this.idProgramador = this.route.snapshot.paramMap.get('idProgramador')!;

    // Inicializar fechas
    this.hoy = this.normalizarFecha(new Date());
    this.fechaSeleccionada = new Date(this.hoy);
    this.hoyStr = this.formatearFecha(this.hoy);
    this.fechaSeleccionadaStr = this.hoyStr;

    // Formulario para solicitar la asesoría
    this.form = this.fb.group({
      nombreSolicitante: ['', Validators.required],
      emailSolicitante: ['', [Validators.required, Validators.email]],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      comentario: ['']
    });

    // Cargar datos del programador y sus horas disponibles
    this.programadoresService.getProgramador(this.idProgramador)
      .subscribe((p: Programador | undefined) => {
        this.programador = p || null;
        this.horasDisponibles = p?.horasDisponibles || [];

        // Recalcular disponibilidad para el día seleccionado
        this.actualizarDisponibilidadDiaSeleccionado();
      });

    // Cargar asesorías ya agendadas de este programador
    this.asesoriasService.getAsesoriasPorProgramador(this.idProgramador)
      .subscribe(lista => {
        this.asesoriasProgramador = lista;
        this.actualizarDisponibilidadDiaSeleccionado();
      });

    // Nos suscribimos una vez y guardamos el usuario
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

  // Normaliza la fecha (solo año/mes/día)
  private normalizarFecha(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  // 'YYYY-MM-DD'
  private formatearFecha(fecha: Date): string {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private actualizarDisponibilidadDiaSeleccionado() {
    // Si no hay horas definidas por el admin, no mostramos nada
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
        a.estado !== 'rechazada' // las rechazadas NO bloquean
      );

      return {
        hora: horaSlot,
        ocupado
      };
    });
  }

  diaSiguiente() {
    this.fechaSeleccionada = this.normalizarFecha(
      new Date(this.fechaSeleccionada.getTime() + 24 * 60 * 60 * 1000)
    );
    this.actualizarDisponibilidadDiaSeleccionado();
  }

  diaAnterior() {
    // No permitimos ir antes de hoy
    const fechaAnterior = this.normalizarFecha(
      new Date(this.fechaSeleccionada.getTime() - 24 * 60 * 60 * 1000)
    );
    const fechaAnteriorStr = this.formatearFecha(fechaAnterior);

    if (fechaAnteriorStr < this.hoyStr) {
      return;
    }

    this.fechaSeleccionada = fechaAnterior;
    this.actualizarDisponibilidadDiaSeleccionado();
  }

  // Cuando el usuario hace click en una hora disponible
  seleccionarHora(slot: { hora: string; ocupado: boolean }) {
    if (slot.ocupado) {
      return;
    }

    this.form.patchValue({
      fecha: this.fechaSeleccionadaStr,
      hora: slot.hora
    });
  }

  async enviarSolicitud() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
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

    // Si hay usuario logueado, guardamos su ID
    if (this.usuarioActual) {
      data.idSolicitante = this.usuarioActual.uid;
    }

    try {
      await this.asesoriasService.crearAsesoria(data);
      alert('Solicitud de asesoría enviada. El programador la revisará en su panel.');
      this.router.navigate(['/portafolio', this.idProgramador]);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al enviar la solicitud');
    } finally {
      this.cargando = false;
    }
  }
}
