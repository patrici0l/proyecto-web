import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ProyectosService, TipoProyecto, TipoParticipacion } from '../../../services/proyectos';
import { NotificacionesService } from '../../../services/notificaciones';

@Component({
  selector: 'app-nuevo-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './nuevo-proyecto.html',
  styleUrls: ['./nuevo-proyecto.scss']
})
export class NuevoProyectoComponent implements OnInit {

  form!: FormGroup;
  cargando = false;

  // Listas para los selects
  tiposProyecto = [
    { valor: 'academico' as TipoProyecto, label: 'Académico' },
    { valor: 'laboral' as TipoProyecto, label: 'Laboral' }
  ];

  tiposParticipacion = [
    { valor: 'frontend' as TipoParticipacion, label: 'Frontend' },
    { valor: 'backend' as TipoParticipacion, label: 'Backend' },
    { valor: 'bd' as TipoParticipacion, label: 'Base de datos' },
    { valor: 'fullstack' as TipoParticipacion, label: 'Fullstack' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private proyectosService: ProyectosService,
    private noti: NotificacionesService
  ) {}

  ngOnInit(): void {
    // Formulario inicial vacío
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipoProyecto: ['academico', Validators.required],
      tipoParticipacion: ['frontend', Validators.required],
      tecnologias: ['', Validators.required],
      urlRepo: [''],
      urlDemo: ['']
    });
  }

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.confirmar('Por favor completa los campos requeridos.');
      return;
    }

    this.cargando = true;
    const nuevoProyecto = this.form.value;

    this.proyectosService.crearProyecto(nuevoProyecto).subscribe({
      next: () => {
        this.noti.exito('Proyecto creado exitosamente.');
        this.router.navigate(['/programador']); // Volver a la lista
      },
      error: (err) => {
        console.error(err);
        this.noti.error('Error al crear el proyecto.');
        this.cargando = false;
      }
    });
  }
}