import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';

import { ProgramadoresService, Programador } from '../../../../services/programadores';
import { NotificacionesService } from '../../../../services/notificaciones';

@Component({
  selector: 'app-editar-programador',
  standalone: true,
  templateUrl: './editar.html',
  styleUrls: ['./editar.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class EditarComponent implements OnInit {

  form!: FormGroup;
  id!: string;

  // Variables para manejo de foto
  preview: string = '';
  archivoFotoNuevo: File | null = null;

  cargando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private programadoresService: ProgramadoresService,
    private router: Router,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      especialidad: ['', Validators.required],
      github: [''],
      linkedin: [''],
      portafolio: [''],
      emailContacto: [''],
      whatsapp: [''],
      disponibilidad: [''],
      horasDisponiblesTexto: ['']
    });

    this.cargarDatos();
  }

  cargarDatos() {
    this.programadoresService.getProgramador(this.id)
      .subscribe((data: Programador | undefined) => {
        if (!data) return;

        this.form.patchValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
          especialidad: data.especialidad,
          github: data.github || '',
          linkedin: data.linkedin || '',
          portafolio: data.portafolio || '',
          emailContacto: data.emailContacto || '',
          whatsapp: data.whatsapp || '',
          disponibilidad: data.disponibilidad || '',
          horasDisponiblesTexto: data.horasDisponibles?.join(', ') || ''
        });

        // Foto actual
        if (data.foto) {
          this.preview = data.foto;
        } else if ((data as any)['fotoUrl']) {
          this.preview = (data as any)['fotoUrl'];
        }
      });
  }

  onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;

    this.archivoFotoNuevo = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async guardarCambios() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.info("Por favor completa todos los campos obligatorios.");
      return;
    }

    this.cargando = true;

    const value = this.form.value;

    let horasDisponibles: string[] = [];
    if (value.horasDisponiblesTexto) {
      horasDisponibles = value.horasDisponiblesTexto
        .split(',')
        .map((h: string) => h.trim())
        .filter((h: string) => h !== '');
    }

    const datos: Partial<Programador> = {
      nombre: value.nombre,
      descripcion: value.descripcion,
      especialidad: value.especialidad,
      github: value.github,
      linkedin: value.linkedin,
      portafolio: value.portafolio,
      emailContacto: value.emailContacto,
      whatsapp: value.whatsapp,
      disponibilidad: value.disponibilidad || '',
      horasDisponibles: horasDisponibles
    };

    try {
      // Enviar cambios + foto opcional
      await this.programadoresService.updateProgramador(
        this.id,
        datos,
        this.archivoFotoNuevo
      );

      this.noti.exito("Programador actualizado correctamente.");

      // Redirigir después de 1 segundo para UX suave
      setTimeout(() => {
        this.router.navigate(['/admin/programadores']);
      }, 800);

    } catch (err) {
      console.error(err);
      this.noti.error('Ocurrió un error al actualizar el programador.');
    } finally {
      this.cargando = false;
    }
  }
}
