 import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Servicios
import { AsesoriasService, Asesoria } from '../../../../services/asesorias';
import { ProgramadoresService, Programador } from '../../../../services/programadores';
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

  // Lista simplificada para la UI
  disponibilidadDiaSeleccionado: {
    hora: string;
    ocupado: boolean;
  }[] = [];

  fechaSeleccionada!: Date;
  fechaSeleccionadaStr!: string;
  hoyStr!: string;

  cargando = false;
  cargandoHoras = false; // Flag para feedback visual al cambiar fecha

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private asesoriasService: AsesoriasService,
    private programadoresService: ProgramadoresService,
    private authService: AuthService,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.idProgramador = this.route.snapshot.paramMap.get('idProgramador')!;

    const hoy = this.normalizarFecha(new Date());
    this.fechaSeleccionada = hoy;
    this.fechaSeleccionadaStr = this.formatearFecha(hoy);
    this.hoyStr = this.fechaSeleccionadaStr;

    this.initForm();

    // 1. Cargar Usuario (Autorelleno del formulario)
    this.authService.usuario$.subscribe(u => {
      this.usuarioActual = u;
      if (u) {
        this.form.patchValue({
          nombreSolicitante: u.nombre,
          emailSolicitante: u.email
        });
      }
    });

    // 2. Cargar Info del Programador
    this.programadoresService.getProgramador(this.idProgramador)
      .subscribe(p => this.programador = p);

    // 3. Cargar Horas Iniciales
    this.cargarHorasDia();
  }

  private initForm() {
    this.form = this.fb.group({
      nombreSolicitante: ['', Validators.required],
      emailSolicitante: ['', [Validators.required, Validators.email]],
      telefonoSolicitante: [''], // ✅ Agregado: Campo opcional de teléfono
      fecha: [this.fechaSeleccionadaStr, Validators.required],
      hora: ['', Validators.required],
      comentario: ['']
    });
  }

  // ============================
  // LÓGICA DE FECHAS
  // ============================

  private normalizarFecha(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  diaSiguiente() {
    this.fechaSeleccionada = new Date(this.fechaSeleccionada.getTime() + 86400000);
    this.cargarHorasDia();
  }

  diaAnterior() {
    const nueva = new Date(this.fechaSeleccionada.getTime() - 86400000);
    if (this.formatearFecha(nueva) < this.hoyStr) return;
    this.fechaSeleccionada = nueva;
    this.cargarHorasDia();
  }

  /**
   * Obtiene los slots de tiempo disponibles para la fecha seleccionada
   */
  cargarHorasDia() {
    this.cargandoHoras = true;
    const fechaStr = this.formatearFecha(this.fechaSeleccionada);
    this.fechaSeleccionadaStr = fechaStr;

    // Resetear selección de hora y lista previa
    this.form.patchValue({ fecha: fechaStr, hora: '' });
    this.disponibilidadDiaSeleccionado = [];

    this.programadoresService.obtenerSlots(this.idProgramador, fechaStr)
      .subscribe({
        next: (slots: string[]) => {
          // El backend devuelve solo las horas libres
          this.disponibilidadDiaSeleccionado = slots.map(hora => ({
            hora: hora,
            ocupado: false
          }));
          this.cargandoHoras = false;
        },
        error: (err) => {
          console.error('Error cargando slots', err);
          this.disponibilidadDiaSeleccionado = [];
          this.cargandoHoras = false;
        }
      });
  }

  seleccionarHora(slot: { hora: string; ocupado: boolean }) {
    if (slot.ocupado) return;
    this.form.patchValue({ hora: slot.hora });
  }

  // ============================
  // ENVÍO DE ASESORÍA
  // ============================
  
  async enviarSolicitud() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.error('Debes completar todos los campos obligatorios');
      return;
    }

    this.cargando = true;
    const v = this.form.value;

    // Se usa Partial<Asesoria> o 'any' para manejar campos automáticos del Backend
    const data: any = {
      idProgramador: this.idProgramador,
      nombreSolicitante: v.nombreSolicitante,
      emailSolicitante: v.emailSolicitante,
      telefonoSolicitante: v.telefonoSolicitante, // ✅ Agregado al payload
      fecha: v.fecha,
      hora: v.hora,
      comentario: v.comentario,
      estado: 'pendiente'
    };

    try {
      // Envío al servicio
      await this.asesoriasService.crearPublica(data).toPromise();

      this.noti.exito('Tu solicitud fue enviada correctamente');
      this.router.navigate(['/']);
    } catch (e) {
      console.error(e);
      this.noti.error('Error al agendar. Verifica si la hora sigue disponible.');
      // Recargamos horas por si el error fue por un slot tomado recientemente
      this.cargarHorasDia();
    } finally {
      this.cargando = false;
    }
  }
}