import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Asegúrate de que la ruta de importación sea correcta según tu estructura
import { ProyectosService, Proyecto, TipoProyecto, TipoParticipacion } from '../../../services/proyectos';
import { NotificacionesService } from '../../../services/notificaciones';

@Component({
  selector: 'app-editar-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './editar-proyecto.html',
  styleUrls: ['./editar-proyecto.scss']
})
export class EditarProyectoComponent implements OnInit {

  form!: FormGroup;
  cargando = true;
  idProyecto: string | null = null; // ✅ Ahora es string para coincidir con tu servicio

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
    private route: ActivatedRoute,
    private router: Router,
    private proyectosService: ProyectosService,
    private noti: NotificacionesService
  ) {}

  ngOnInit(): void {
    // 1. Inicializar formulario
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipoProyecto: ['academico', Validators.required],
      tipoParticipacion: ['frontend', Validators.required],
      tecnologias: ['', Validators.required],
      urlRepo: [''],
      urlDemo: ['']
    });

    // 2. Obtener ID de la URL (Como string)
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.idProyecto = idParam; // ✅ Sin el "+" porque tu ID es string
      this.cargarDatos(this.idProyecto);
    } else {
      this.noti.error('ID de proyecto no válido');
      this.router.navigate(['/programador']);
    }
  }

  cargarDatos(id: string) {
    this.cargando = true;
    // ✅ Llamamos a getProyecto (según tu servicio)
    this.proyectosService.getProyecto(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          titulo: data.titulo,
          descripcion: data.descripcion,
          tipoProyecto: data.tipoProyecto,
          tipoParticipacion: data.tipoParticipacion,
          tecnologias: data.tecnologias,
          urlRepo: data.urlRepo,
          urlDemo: data.urlDemo
        });
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.noti.error('No se pudo cargar el proyecto');
        this.router.navigate(['/programador']);
      }
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.confirmar('Por favor revisa los campos requeridos.');
      return;
    }

    if (!this.idProyecto) return;

    this.cargando = true;
    // Usamos Partial<Proyecto> si quieres, o el objeto completo, tu servicio acepta Partial en update
    const proyectoActualizado = this.form.value;

    this.proyectosService.actualizarProyecto(this.idProyecto, proyectoActualizado).subscribe({
      next: () => {
        this.noti.exito('Proyecto editado correctamente');
        this.router.navigate(['/programador']);
      },
      error: (err) => {
        console.error(err);
        this.noti.error('Error al guardar cambios');
        this.cargando = false;
      }
    });
  }
}