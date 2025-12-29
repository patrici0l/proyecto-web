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
  cargandoHoras = false; // Nuevo flag para feedback visual al cambiar fecha

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private asesoriasService: AsesoriasService,
    private programadoresService: ProgramadoresService,
    // private disponibilidadesService: DisponibilidadesService, // ❌ YA NO SE NECESITA
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

    // 1. Cargar Usuario (Autrelleno del formulario)
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

    // 3. Cargar Horas Iniciales (Directamente)
    this.cargarHorasDia();
  }

  private initForm() {
    this.form = this.fb.group({
      nombreSolicitante: ['', Validators.required],
      emailSolicitante: ['', [Validators.required, Validators.email]],
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
   * ✅ NUEVA LÓGICA: Pide los slots ya calculados al Backend
   */
  cargarHorasDia() {
    this.cargandoHoras = true;
    const fechaStr = this.formatearFecha(this.fechaSeleccionada);
    this.fechaSeleccionadaStr = fechaStr;

    // Resetear formulario y lista
    this.form.patchValue({ fecha: fechaStr, hora: '' });
    this.disponibilidadDiaSeleccionado = [];

    // Llamada al nuevo endpoint
    this.programadoresService.obtenerSlots(this.idProgramador, fechaStr)
      .subscribe({
        next: (slots: string[]) => {
          // El backend devuelve solo las horas libres (ej: ["18:00", "19:00"])
          // Las mapeamos para que tu HTML no se rompa
          this.disponibilidadDiaSeleccionado = slots.map(hora => ({
            hora: hora,
            ocupado: false // Si el backend la manda, es porque está libre
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
  // === 
  async enviarSolicitud() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.error('Debes completar todos los campos obligatorios');
      return;
    }

    this.cargando = true;
    const v = this.form.value;

    // ✅ CORRECCIÓN: Usamos 'any' para que TypeScript no exija 'creadoEn' ni 'estado'
    // ya que esos campos los pone el Backend automáticamente.
    const data: any = {
      idProgramador: this.idProgramador,
      nombreSolicitante: v.nombreSolicitante,
      emailSolicitante: v.emailSolicitante,
      fecha: v.fecha,
      hora: v.hora,
      comentario: v.comentario,
      estado: 'pendiente' // Opcional: lo mandamos explícito para que no se queje
    };

    try {
      // Casteamos a Asesoria solo en la llamada para engañar al servicio si es estricto
      await this.asesoriasService.crearPublica(data).toPromise();

      this.noti.exito('Tu solicitud fue enviada correctamente');
      this.router.navigate(['/']);
    } catch (e) {
      console.error(e);
      this.noti.error('Error al agendar. Verifica si la hora sigue disponible.');
      this.cargarHorasDia();
    } finally {
      this.cargando = false;
    }
  }
}