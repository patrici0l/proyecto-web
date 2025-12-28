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
  templateUrl: './programador.html', // Asegúrate de actualizar el HTML también
  styleUrls: ['./programador.scss'],
})
export class ProgramadorComponent implements OnInit {

  usuario: UsuarioApp | null = null;
  proyectos: Proyecto[] = [];

  cargando = true;
  modo: 'lista' | 'nuevo' | 'editar' = 'lista';
  proyectoEditando: Proyecto | null = null;

  form!: FormGroup;

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
    private auth: AuthService,
    private proyectosService: ProyectosService,
    private fb: FormBuilder,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    // 1. FORMULARIO ACTUALIZADO (Nombres de Java)
    this.form = this.fb.group({
      titulo: ['', Validators.required],       // Antes 'nombre'
      descripcion: ['', Validators.required],
      tipoProyecto: ['academico', Validators.required],
      tipoParticipacion: ['frontend', Validators.required],
      tecnologias: ['', Validators.required],
      urlRepo: [''],                           // Antes 'repoUrl'
      urlDemo: ['']                            // Antes 'demoUrl'
    });

    // 2. CARGAR USUARIO Y PROYECTOS
    this.auth.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      // Ya no dependemos estrictamente del idProgramador para listar, 
      // pero si el usuario existe, cargamos.
      if (usuario) {
        this.cargarProyectos();
      } else {
        this.cargando = false;
      }
    });
  }

  // Cargar proyectos desde Java
  private cargarProyectos() {
    this.cargando = true;
    this.proyectosService.getProyectos()
      .subscribe({
        next: (lista) => {
          this.proyectos = lista;
          this.cargando = false;
        },
        error: (err) => {
          console.error(err);
          this.cargando = false;
        }
      });
  }

  nuevoProyecto() {
    this.modo = 'nuevo';
    this.proyectoEditando = null;
    this.form.reset({
      titulo: '',
      descripcion: '',
      tipoProyecto: 'academico',
      tipoParticipacion: 'frontend',
      tecnologias: '',
      urlRepo: '',
      urlDemo: ''
    });
  }

  editarProyecto(p: Proyecto) {
    this.modo = 'editar';
    this.proyectoEditando = p;

    // 3. MAPEO PARA EDITAR (De objeto Java a Formulario Angular)
    this.form.patchValue({
      titulo: p.titulo,
      descripcion: p.descripcion,
      tipoProyecto: p.tipoProyecto,
      tipoParticipacion: p.tipoParticipacion,
      tecnologias: p.tecnologias,
      urlRepo: p.urlRepo || '',
      urlDemo: p.urlDemo || ''
    });
  }

  cancelarEdicion() {
    this.modo = 'lista';
    this.proyectoEditando = null;
    this.form.reset();
  }

  // 4. GUARDAR (Sin async/await, usando Subscribe)
  guardarProyecto() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.confirmar('Complete todos los campos requeridos.');
      return;
    }

    const valores = this.form.value;
    this.cargando = true;

    // Construimos el objeto con la estructura nueva
    const proyectoData: Proyecto = {
      titulo: valores.titulo,        // Mapeo correcto
      descripcion: valores.descripcion,
      tipoProyecto: valores.tipoProyecto,
      tipoParticipacion: valores.tipoParticipacion,
      tecnologias: valores.tecnologias,
      urlRepo: valores.urlRepo,
      urlDemo: valores.urlDemo,
      // estado: 'activo' (El backend lo pone por defecto)
    };

    if (this.modo === 'nuevo') {
      // --- CREAR ---
      this.proyectosService.crearProyecto(proyectoData).subscribe({
        next: () => {
          this.noti.exito('Proyecto creado correctamente.');
          this.finalizarGuardado();
        },
        error: (err) => {
          console.error(err);
          this.noti.error('Error al crear proyecto.');
          this.cargando = false;
        }
      });
    } else if (this.modo === 'editar' && this.proyectoEditando?.id) {
      // --- EDITAR ---
      this.proyectosService.actualizarProyecto(this.proyectoEditando.id, proyectoData).subscribe({
        next: () => {
          this.noti.exito('Proyecto actualizado correctamente.');
          this.finalizarGuardado();
        },
        error: (err) => {
          console.error(err);
          this.noti.error('Error al actualizar proyecto.');
          this.cargando = false;
        }
      });
    }
  }

  private finalizarGuardado() {
    this.modo = 'lista';
    this.proyectoEditando = null;
    this.form.reset();
    this.cargarProyectos(); // Recargar lista
  }

  // 5. ELIMINAR (Sin async/await)
  async eliminarProyecto(p: Proyecto) {
    if (!p.id) return;

    const confirmar = await this.noti.confirmar(
      '¿Eliminar este proyecto?',
      'Esta acción no se puede deshacer.'
    );

    if (!confirmar) return;

    this.cargando = true;

    this.proyectosService.eliminarProyecto(p.id).subscribe({
      next: () => {
        this.noti.exito('Proyecto eliminado.');
        this.cargarProyectos();
      },
      error: (err) => {
        console.error(err);
        this.noti.error('Error al eliminar.');
        this.cargando = false;
      }
    });
  }
}