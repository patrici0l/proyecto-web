import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ProyectosService, Proyecto, TipoProyecto, TipoParticipacion } from '../../../../../services/proyectos';

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

    const v = this.form.value;

    const data: Proyecto = {
      idProgramador: this.idProgramador,
      nombre: v.nombre,
      descripcion: v.descripcion,
      tipoProyecto: v.tipoProyecto,
      tipoParticipacion: v.tipoParticipacion,
      tecnologias: v.tecnologias,
      repoUrl: v.repoUrl || undefined,
      demoUrl: v.demoUrl || undefined,
      creadoEn: new Date().toISOString()
    };

    try {
      await this.proyectosService.crearProyecto(data);
      alert('Proyecto creado correctamente');
      this.router.navigate(['/admin/programadores', this.idProgramador, 'proyectos']);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al crear el proyecto');
    }
  }
}
