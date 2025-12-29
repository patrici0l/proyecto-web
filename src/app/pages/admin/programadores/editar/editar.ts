import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProgramadoresService, Programador } from '../../../../services/programadores'; // Ajusta la ruta si es necesario
import { NotificacionesService } from '../../../../services/notificaciones'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-editar-programador',
  standalone: true,
  templateUrl: './editar.html',
  styleUrls: ['./editar.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  encapsulation: ViewEncapsulation.None // Permite que los estilos globales afecten a este componente
})
export class EditarComponent implements OnInit {

  form!: FormGroup;
  id!: string;
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
    // 1. Obtener ID de la URL
    this.id = this.route.snapshot.paramMap.get('id')!;

    // 2. Inicializar formulario
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

    // 3. Cargar datos del servidor
    this.cargarDatos();
  }

  cargarDatos() {
    this.programadoresService.getProgramador(this.id)
      .subscribe({
        next: (data: Programador | undefined) => {
          if (!data) {
            this.noti.error("No se encontró el programador");
            this.router.navigate(['/admin/programadores']);
            return;
          }

          // Rellenar formulario
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

          // Manejar la foto existente
          if (data.foto) {
            this.preview = data.foto;
          }
        },
        error: (err) => {
          console.error(err);
          this.noti.error("Error al cargar los datos");
        }
      });
  }

  onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;

    this.archivoFotoNuevo = file;

    // Generar vista previa local
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  guardarCambios() {
    // 1. Validaciones básicas
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.noti.info("Por favor completa todos los campos obligatorios.");
      return;
    }

    this.cargando = true;
    const value = this.form.value;

    // 2. Convertir texto de horas a Array
    let horasDisponibles: string[] = [];
    if (value.horasDisponiblesTexto) {
      horasDisponibles = value.horasDisponiblesTexto
        .split(',')
        .map((h: string) => h.trim())
        .filter((h: string) => h !== '');
    }

    // 3. Preparar objeto de datos
    // Nota: No incluimos la foto aquí, se pasa como argumento separado
    const datos = {
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

    // 4. Llamar al servicio usando SUBSCRIBE (Correcto para Observables)
    this.programadoresService.updateProgramador(this.id, datos, this.archivoFotoNuevo)
      .subscribe({
        next: () => {
          this.noti.exito("Programador actualizado correctamente.");

          // Esperar un poco para que el usuario vea el mensaje y redirigir
          setTimeout(() => {
            this.router.navigate(['/admin/programadores']);
          }, 800);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.noti.error('Ocurrió un error al actualizar. ' + (err.error?.message || ''));
          this.cargando = false;
        }
      });
  }
}