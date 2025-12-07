import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Se agregan TipoProyecto y TipoParticipacion a los imports
import { ProyectosService, Proyecto, TipoProyecto, TipoParticipacion } from '../../../../../services/proyectos';
import { NotificacionesService } from '../../../../../services/notificaciones'; // ✅ 4 niveles hacia arriba

@Component({
  selector: 'app-proyecto-nuevo',
  standalone: true,
  templateUrl: './proyecto-nuevo.html',
  styleUrls: ['./proyecto-nuevo.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class ProyectoNuevoComponent implements OnInit {

  form!: FormGroup;
  idProgramador!: string;
  cargando = false;

  // --- SE AGREGARON ESTOS ARRAYS DEL PRIMER CÓDIGO ---
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
  // ---------------------------------------------------

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private proyectosService: ProyectosService,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    // /admin/programadores/:id/proyectos/nuevo
    this.idProgramador = this.route.snapshot.paramMap.get('id')!;

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipoProyecto: ['academico', Validators.required],
      tipoParticipacion: ['frontend', Validators.required],
      tecnologias: ['', Validators.required],
      repoUrl: [''],
      demoUrl: ['']
    });
  }

  async guardar() {
    if (this.form.invalid) return;

    this.cargando = true;

    const valores = this.form.value;

    const proyecto: Proyecto = {
      idProgramador: this.idProgramador,
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      tipoProyecto: valores.tipoProyecto,
      tipoParticipacion: valores.tipoParticipacion,
      tecnologias: valores.tecnologias,
      repoUrl: valores.repoUrl || '',
      demoUrl: valores.demoUrl || '',
      // Se agrega la fecha de creación que estaba en el primer código
      creadoEn: new Date().toISOString()
    };

    try {
      await this.proyectosService.crearProyecto(proyecto);
    this.noti.exito('Proyecto creado correctamente.');
      this.router.navigate(['/admin/programadores', this.idProgramador, 'proyectos']);
    } catch (err) {
      console.error(err);
      this.noti.error('Error al crear el proyecto');
    } finally {
      // El bloque finally asegura que el spinner se apague pase lo que pase
      this.cargando = false;
    }
  }

  cancelar() {
    this.router.navigate(['/admin/programadores', this.idProgramador, 'proyectos']);
  }
}