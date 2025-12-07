import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MenuComponent } from '../../components/menu/menu';
import {
  ProyectosService,
  Proyecto,
  TipoProyecto,
  TipoParticipacion
} from '../../services/proyectos';
import { AuthService, UsuarioApp } from '../../services/auth';
import { NotificacionesService } from '../../services/notificaciones';

@Component({
  selector: 'app-programador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MenuComponent],
  templateUrl: './programador.html',
  styleUrls: ['./programador.scss'],
})
export class ProgramadorComponent implements OnInit {

  usuario: UsuarioApp | null = null;
  proyectos: Proyecto[] = [];

  cargando = true;
  modo: 'lista' | 'nuevo' | 'editar' = 'lista';
  proyectoEditando: Proyecto | null = null;

  form!: FormGroup;

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
    private auth: AuthService,
    private proyectosService: ProyectosService,
    private fb: FormBuilder,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tipoProyecto: ['academico', Validators.required],
      tipoParticipacion: ['frontend', Validators.required],
      tecnologias: ['', Validators.required],
      repoUrl: [''],
      demoUrl: ['']
    });

    this.auth.usuario$.subscribe(usuario => {
      this.usuario = usuario;

      if (usuario?.idProgramador) {
        this.cargarProyectos(usuario.idProgramador);
      } else {
        this.cargando = false;
      }
    });
  }

  private cargarProyectos(idProgramador: string) {
    this.cargando = true;
    this.proyectosService.getProyectosDeProgramador(idProgramador)
      .subscribe(lista => {
        this.proyectos = lista;
        this.cargando = false;
      });
  }

  nuevoProyecto() {
    this.modo = 'nuevo';
    this.proyectoEditando = null;
    this.form.reset({
      nombre: '',
      descripcion: '',
      tipoProyecto: 'academico',
      tipoParticipacion: 'frontend',
      tecnologias: '',
      repoUrl: '',
      demoUrl: ''
    });
  }

  editarProyecto(p: Proyecto) {
    this.modo = 'editar';
    this.proyectoEditando = p;

    this.form.patchValue({
      nombre: p.nombre,
      descripcion: p.descripcion,
      tipoProyecto: p.tipoProyecto,
      tipoParticipacion: p.tipoParticipacion,
      tecnologias: p.tecnologias,
      repoUrl: p.repoUrl || '',
      demoUrl: p.demoUrl || ''
    });
  }

  cancelarEdicion() {
    this.modo = 'lista';
    this.proyectoEditando = null;
    this.form.reset();
  }

  async guardarProyecto() {
    if (!this.usuario?.idProgramador) {
      this.noti.error('Error: No se encontró el ID del programador.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.confirmar('Complete todos los campos requeridos.');
      return;
    }

    const valores = this.form.value;
    this.cargando = true;

    try {
      if (this.modo === 'nuevo') {

        const proyecto: Proyecto = {
          idProgramador: this.usuario.idProgramador,
          nombre: valores.nombre,
          descripcion: valores.descripcion,
          tipoProyecto: valores.tipoProyecto,
          tipoParticipacion: valores.tipoParticipacion,
          tecnologias: valores.tecnologias,
          repoUrl: valores.repoUrl || '',
          demoUrl: valores.demoUrl || '',
          creadoEn: new Date().toISOString()
        };

        await this.proyectosService.crearProyecto(proyecto);
        this.noti.exito('Proyecto creado correctamente.');

      } else if (this.modo === 'editar' && this.proyectoEditando?.id) {

        const cambios: Partial<Proyecto> = {
          nombre: valores.nombre,
          descripcion: valores.descripcion,
          tipoProyecto: valores.tipoProyecto,
          tipoParticipacion: valores.tipoParticipacion,
          tecnologias: valores.tecnologias,
          repoUrl: valores.repoUrl || '',
          demoUrl: valores.demoUrl || ''
        };

        await this.proyectosService.actualizarProyecto(this.proyectoEditando.id, cambios);
        this.noti.exito('Proyecto actualizado correctamente.');
      }

      this.modo = 'lista';
      this.proyectoEditando = null;
      this.form.reset();

      this.cargarProyectos(this.usuario.idProgramador);

    } catch (err) {
      console.error(err);
      this.noti.error('Ocurrió un error al guardar el proyecto.');
    } finally {
      this.cargando = false;
    }
  }

  async eliminarProyecto(p: Proyecto) {
    if (!p.id) return;

    const confirmar = await this.noti.confirmar(
      '¿Eliminar este proyecto?',
      'Esta acción no se puede deshacer.'
    );

    if (!confirmar) return;
    if (!this.usuario?.idProgramador) return;

    this.cargando = true;

    try {
      await this.proyectosService.eliminarProyecto(p.id);
      this.noti.exito('Proyecto eliminado correctamente.');
      this.cargarProyectos(this.usuario.idProgramador);
    } catch (err) {
      console.error(err);
      this.noti.error('Ocurrió un error al eliminar el proyecto.');
      this.cargando = false;
    }
  }
}
