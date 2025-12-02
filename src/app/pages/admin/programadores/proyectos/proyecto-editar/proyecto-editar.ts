import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ProyectosService, Proyecto, TipoProyecto, TipoParticipacion } from '../../../../../services/proyectos';

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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private proyectosService: ProyectosService
  ) { }

  ngOnInit(): void {
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

    this.proyectosService.getProyecto(this.idProyecto)
      .subscribe(p => {
        if (!p) return;
        this.form.patchValue({
          nombre: p.nombre,
          descripcion: p.descripcion,
          tipoProyecto: p.tipoProyecto,
          tipoParticipacion: p.tipoParticipacion,
          tecnologias: p.tecnologias,
          repoUrl: p.repoUrl || '',
          demoUrl: p.demoUrl || ''
        });
      });
  }

  async guardar() {
    if (this.form.invalid) return;

    const v = this.form.value;

    const cambios: Partial<Proyecto> = {
      nombre: v.nombre,
      descripcion: v.descripcion,
      tipoProyecto: v.tipoProyecto,
      tipoParticipacion: v.tipoParticipacion,
      tecnologias: v.tecnologias,
      repoUrl: v.repoUrl || undefined,
      demoUrl: v.demoUrl || undefined
    };

    try {
      await this.proyectosService.actualizarProyecto(this.idProyecto, cambios);
      alert('Proyecto actualizado correctamente');
      this.router.navigate(['/admin/programadores', this.idProgramador, 'proyectos']);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al actualizar el proyecto');
    }
  }
}
