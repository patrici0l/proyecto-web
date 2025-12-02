import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';

import { ProgramadoresService, Programador } from '../../../../services/programadores';

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

  // Variables para manejo de foto (Mantenemos la lógica robusta del código 1)
  preview: string = '';
  archivoFotoNuevo: File | null = null; 

  cargando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private programadoresService: ProgramadoresService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;

    this.form = this.fb.group({
      // --- Campos Estándar ---
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      especialidad: ['', Validators.required],
      
      // --- Redes Sociales ---
      github: [''],
      linkedin: [''],
      portafolio: [''],
      
      // --- Campos de Contacto y Horas (Código 1) ---
      emailContacto: [''],
      whatsapp: [''],
      horasDisponiblesTexto: [''], // Auxiliar para convertir array <-> string

      // --- 🔹 NUEVO CAMPO (Del código 2) ---
      disponibilidad: [''] 
    });

    this.cargarDatos();
  }

  cargarDatos() {
    this.programadoresService.getProgramador(this.id)
      .subscribe((data: Programador | undefined) => {
        if (!data) return;

        // Rellenar formulario (Fusión de lógica)
        this.form.patchValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
          especialidad: data.especialidad,
          github: data.github || '',
          linkedin: data.linkedin || '',
          portafolio: data.portafolio || '',
          
          emailContacto: data.emailContacto || '',
          whatsapp: data.whatsapp || '',
          
          // Lógica de horas (array a string)
          horasDisponiblesTexto: data.horasDisponibles?.join(', ') || '',

          // --- 🔹 NUEVO: Parchear disponibilidad ---
          disponibilidad: data.disponibilidad || ''
        });

        // Mostrar foto actual (Lógica visual del código 1, más robusta que solo poner la URL en el form)
        // Nota: Asumimos que data.foto o data.fotoUrl traen la imagen
        if (data.foto) { 
          this.preview = data.foto;
        } else if (data['fotoUrl']) { // Por si en tu modelo se llama fotoUrl
           this.preview = data['fotoUrl'];
        }
      });
  }

  // Lógica de selección de archivo (Se mantiene intacta porque funciona bien)
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
      return;
    }

    this.cargando = true;

    // 1. Obtener valores del form
    const value = this.form.value;

    // 2. Lógica del código 1: Convertir texto a array de horas
    let horasDisponibles: string[] = [];
    if (value.horasDisponiblesTexto) {
      horasDisponibles = value.horasDisponiblesTexto
        .split(',')
        .map((h: string) => h.trim())
        .filter((h: string) => h !== '');
    }

    // 3. Preparar objeto de datos fusionado
    const datos: Partial<Programador> = {
      nombre: value.nombre,
      descripcion: value.descripcion,
      especialidad: value.especialidad,
      github: value.github,
      linkedin: value.linkedin,
      portafolio: value.portafolio,
      
      emailContacto: value.emailContacto,
      whatsapp: value.whatsapp,
      horasDisponibles: horasDisponibles, // Array procesado
      
      // --- 🔹 NUEVO: Guardar disponibilidad ---
      disponibilidad: value.disponibilidad
    };

    try {
      // 4. Llamar al servicio (Se mantiene la firma original que soporta Archivos)
      await this.programadoresService.updateProgramador(
        this.id,
        datos,
        this.archivoFotoNuevo // Se envía el archivo si el usuario seleccionó uno nuevo
      );

      alert('Programador actualizado correctamente');
      this.router.navigate(['/admin/programadores']);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al actualizar el programador');
    } finally {
      this.cargando = false;
    }
  }
}