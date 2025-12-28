import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms'; // ✅ Agregado FormGroup

import { DisponibilidadesService, Disponibilidad } from '../../../services/disponibilidades';
import { NotificacionesService } from '../../../services/notificaciones';

@Component({
  selector: 'app-programador-disponibilidad',
  standalone: true,
  templateUrl: './disponibilidad.html',
  styleUrls: ['./disponibilidad.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProgramadorDisponibilidadComponent implements OnInit {

  lista: Disponibilidad[] = [];
  cargando = true;

  // ✅ 1. Declaramos la variable, pero no la inicializamos aquí
  form: FormGroup;

  editandoId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dispoService: DisponibilidadesService,
    private noti: NotificacionesService
  ) {
    // ✅ 2. Inicializamos el form dentro del constructor (donde 'fb' ya existe)
    this.form = this.fb.group({
      diaSemana: [1, [Validators.required]],
      horaInicio: ['09:00', [Validators.required]],
      horaFin: ['12:00', [Validators.required]],
      modalidad: ['virtual', [Validators.required]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.dispoService.listarMias().subscribe({
      next: (res) => {
        this.lista = (res || []).sort((a, b) => (a.diaSemana ?? 0) - (b.diaSemana ?? 0));
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.noti.error('No se pudo cargar tu disponibilidad');
        this.cargando = false;
      }
    });
  }

  nombreDia(d: number): string {
    return ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d] || `Día ${d}`;
  }

  private normalizarHora(h: string): string {
    return (h || '').substring(0, 5);
  }

  editar(item: Disponibilidad) {
    if (!item.id) return;

    this.editandoId = item.id;
    this.form.patchValue({
      diaSemana: item.diaSemana,
      horaInicio: this.normalizarHora(item.horaInicio),
      horaFin: this.normalizarHora(item.horaFin),
      modalidad: item.modalidad,
      activo: item.activo
    });
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.form.reset({
      diaSemana: 1,
      horaInicio: '09:00',
      horaFin: '12:00',
      modalidad: 'virtual',
      activo: true
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.error('Completa todos los campos');
      return;
    }

    const v = this.form.value;

    if ((v.horaFin || '') <= (v.horaInicio || '')) {
      this.noti.error('La hora fin debe ser mayor que la hora inicio');
      return;
    }

    const payload = {
      diaSemana: Number(v.diaSemana),
      horaInicio: v.horaInicio!,
      horaFin: v.horaFin!,
      modalidad: v.modalidad as 'virtual' | 'presencial',
      activo: Boolean(v.activo)
    };

    if (this.editandoId) {
      this.dispoService.actualizar(this.editandoId, payload).subscribe({
        next: () => {
          this.noti.exito('Disponibilidad actualizada');
          this.cancelarEdicion();
          this.cargar();
        },
        error: (err) => {
          console.error(err);
          this.noti.error('No se pudo actualizar');
        }
      });
    } else {
      this.dispoService.crear(payload).subscribe({
        next: () => {
          this.noti.exito('Disponibilidad creada');
          this.cancelarEdicion();
          this.cargar();
        },
        error: (err) => {
          console.error(err);
          this.noti.error('No se pudo crear');
        }
      });
    }
  }

  eliminar(item: Disponibilidad) {
    if (!item.id) return;

    this.dispoService.eliminar(item.id).subscribe({
      next: () => {
        this.noti.exito('Disponibilidad eliminada');
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        this.noti.error('No se pudo eliminar');
      }
    });
  }
}