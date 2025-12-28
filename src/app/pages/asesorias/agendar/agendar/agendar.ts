import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AsesoriasService, Asesoria } from '../../../../services/asesorias';
import { ProgramadoresService, Programador } from '../../../../services/programadores';
import { DisponibilidadesService, Disponibilidad } from '../../../../services/disponibilidades';
import { AuthService, UsuarioApp } from '../../../../services/auth';
import { NotificacionesService } from '../../../../services/notificaciones';

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
  usuarioActual: UsuarioApp | null = null;

  disponibilidades: Disponibilidad[] = [];

  // ✅ 1️⃣ Variable corregida
  disponibilidadDiaSeleccionado: {
    hora: string;
    ocupado: boolean;
  }[] = [];

  fechaSeleccionada!: Date;
  fechaSeleccionadaStr!: string;
  hoyStr!: string;

  cargando = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private asesoriasService: AsesoriasService,
    private programadoresService: ProgramadoresService,
    private disponibilidadesService: DisponibilidadesService,
    private authService: AuthService,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.idProgramador = this.route.snapshot.paramMap.get('idProgramador')!;

    const hoy = this.normalizarFecha(new Date());
    this.fechaSeleccionada = hoy;
    this.fechaSeleccionadaStr = this.formatearFecha(hoy);
    this.hoyStr = this.fechaSeleccionadaStr;

    this.form = this.fb.group({
      nombreSolicitante: ['', Validators.required],
      emailSolicitante: ['', [Validators.required, Validators.email]],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      comentario: ['']
    });

    // Usuario actual
    this.authService.usuario$.subscribe(u => {
      this.usuarioActual = u;
      if (u) {
        this.form.patchValue({
          nombreSolicitante: u.nombre,
          emailSolicitante: u.email
        });
      }
    });

    // Programador
    this.programadoresService.getProgramador(this.idProgramador)
      .subscribe(p => this.programador = p);

    // Disponibilidades
    this.disponibilidadesService.getDeProgramador(this.idProgramador)
      .subscribe(d => {
        this.disponibilidades = d;
        this.cargarHorasDia();
      });
  }

  // ============================
  // LÓGICA DE FECHAS Y HORAS
  // ============================

  private normalizarFecha(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  diaSiguiente() {
    this.fechaSeleccionada = this.normalizarFecha(
      new Date(this.fechaSeleccionada.getTime() + 86400000)
    );
    this.cargarHorasDia();
  }

  diaAnterior() {
    const nueva = this.normalizarFecha(
      new Date(this.fechaSeleccionada.getTime() - 86400000)
    );

    if (this.formatearFecha(nueva) < this.hoyStr) return;

    this.fechaSeleccionada = nueva;
    this.cargarHorasDia();
  }

  // ✅ 2️⃣ Método cargarHorasDia corregido
  private cargarHorasDia() {
    const diaSemana = this.fechaSeleccionada.getDay();
    const fechaStr = this.formatearFecha(this.fechaSeleccionada);
    this.fechaSeleccionadaStr = fechaStr;

    const dispoDia = this.disponibilidades.filter(
      d => d.diaSemana === diaSemana && d.activo
    );

    let horas: string[] = [];

    dispoDia.forEach(d => {
      horas.push(...this.generarHoras(d.horaInicio, d.horaFin));
    });

    this.asesoriasService
      .getOcupadas(this.idProgramador, fechaStr)
      .subscribe((ocupadas: Asesoria[]) => {
        this.disponibilidadDiaSeleccionado = horas.map(h => ({
          hora: h,
          ocupado: ocupadas.some(o => o.hora === h)
        }));
      });
  }

  private generarHoras(inicio: string, fin: string): string[] {
    const res: string[] = [];
    let actual = new Date(`1970-01-01T${inicio}`);
    const limite = new Date(`1970-01-01T${fin}`);

    while (actual < limite) {
      res.push(actual.toTimeString().substring(0, 5));
      actual.setMinutes(actual.getMinutes() + 30);
    }
    return res;
  }

  seleccionarHora(slot: { hora: string; ocupado: boolean }) {
    if (slot.ocupado) return;

    this.form.patchValue({
      fecha: this.fechaSeleccionadaStr,
      hora: slot.hora
    });
  }

  // ============================
  // ENVÍO DE ASESORÍA
  // ============================

  // ✅ 3️⃣ Método enviarSolicitud corregido
  async enviarSolicitud() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.error('Debes completar todos los campos obligatorios');
      return;
    }

    this.cargando = true;
    const v = this.form.value;

    const data: Partial<Asesoria> = {
      idProgramador: this.idProgramador,
      nombreSolicitante: v.nombreSolicitante,
      emailSolicitante: v.emailSolicitante,
      fecha: v.fecha,
      hora: v.hora,
      comentario: v.comentario
    };

    try {
      await this.asesoriasService.crearPublica(data).toPromise();
      this.noti.exito('Tu solicitud fue enviada correctamente');
      this.router.navigate(['/portafolio', this.idProgramador]);
    } catch (e) {
      console.error(e);
      this.noti.error('La hora seleccionada ya fue reservada');
    } finally {
      this.cargando = false;
    }
  }
}