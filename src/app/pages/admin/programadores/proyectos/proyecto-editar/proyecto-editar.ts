import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Se importan los tipos necesarios para los arrays
import { ProyectosService, Proyecto, TipoProyecto, TipoParticipacion } from '../../../../../services/proyectos';
import { NotificacionesService } from '../../../../../services/notificaciones'; // ✅ 4 niveles hacia arriba

@Component({
  selector: 'app-proyecto-editar',
  standalone: true,
  templateUrl: './proyecto-editar.html',
  styleUrls: ['./proyecto-editar.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class ProyectoEditarComponent implements OnInit {

  form!: FormGroup;
  idProgramador!: string;
  idProyecto!: string;
  // Iniciamos cargando en true porque al entrar se hace una petición de datos
  cargando = true;

  // --- SE AGREGAN ESTOS ARRAYS PARA QUE FUNCIONEN LOS SELECTS EN EL HTML ---
  tiposProyecto: { valor: TipoProyecto; label: string }[] = [
    { valor: 'academico', label: 'Académico' },
    { valor: 'laboral', label: 'Laboral' }
  ];

  tiposParticipacion: { valor: TipoParticipacion; label: string }[] = [
    { valor: 'frontend', label: 'Frontend' },
    { valor: 'backend', label: 'Backend' },
    { valor: 'bd', label: 'Base de datos' },
    { valor: 'fullstack', label: 'Fullstack' }
  ];
  // ------------------------------------------------------------------------

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private proyectosService: ProyectosService,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    // URL: /admin/programadores/:id/proyectos/editar/:idProyecto
    this.idProgramador = this.route.snapshot.paramMap.get('id')!;
    this.idProyecto = this.route.snapshot.paramMap.get('idProyecto')!;

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipoProyecto: ['academico', Validators.required],
      tipoParticipacion: ['frontend', Validators.required],
      tecnologias: ['', Validators.required],
      repoUrl: [''],
      demoUrl: ['']
    });

    // Lógica optimizada del segundo código
    this.proyectosService.getProyecto(this.idProyecto)
      .subscribe((p: Proyecto | null) => {
        if (p) {
          // patchValue rellena el formulario automáticamente con los datos recibidos
          this.form.patchValue(p);
        }
        // Quitamos el spinner de carga una vez recibida la respuesta
        this.cargando = false;
      });
  }

  async guardar() {
    if (this.form.invalid) return;

    this.cargando = true;
    const valores = this.form.value;

    const cambios: Partial<Proyecto> = {
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      tipoProyecto: valores.tipoProyecto,
      tipoParticipacion: valores.tipoParticipacion,
      tecnologias: valores.tecnologias,
      repoUrl: valores.repoUrl || '',
      demoUrl: valores.demoUrl || ''
    };

    try {
      await this.proyectosService.actualizarProyecto(this.idProyecto, cambios);
      this.noti.exito('Proyecto actualizado correctamente.');
      this.router.navigate(['/admin/programadores', this.idProgramador, 'proyectos']);
    } catch (err) {
      console.error(err);
    this.noti.error('Error al actualizar el proyecto');
    } finally {
      // finally se ejecuta haya error o éxito
      this.cargando = false;
    }
  }

  cancelar() {
    this.router.navigate(['/admin/programadores', this.idProgramador, 'proyectos']);
  }
}