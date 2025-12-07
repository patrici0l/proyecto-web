import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProgramadoresService } from '../../../services/programadores';
import { NotificacionesService } from '../../../services/notificaciones'; // ✅ 4 niveles hacia arriba

@Component({
    selector: 'app-programador-nuevo',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './programador-nuevo.html',
    styleUrls: ['./programador-nuevo.scss']
})
export class ProgramadorNuevoComponent {

    form: FormGroup;
    archivoFoto: File | null = null; // Aquí guardamos el archivo crudo
    previewUrl: string | null = null;
    cargando = false;
    mensaje = '';
    error = '';

    constructor(
        private fb: FormBuilder,
        private programadoresService: ProgramadoresService, // Servicio inyectado
        private router: Router,
        private noti: NotificacionesService
    ) {
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
    }

    onFotoSeleccionada(event: Event) {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            this.archivoFoto = null;
            this.previewUrl = null;
            return;
        }

        // 1. Guardamos el archivo para enviarlo al servicio después
        this.archivoFoto = input.files[0];

        // 2. Generamos la vista previa localmente
        const reader = new FileReader();
        reader.onload = () => {
            this.previewUrl = reader.result as string;
        };
        reader.readAsDataURL(this.archivoFoto);
    }

    async guardar() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        if (!this.archivoFoto) {
            this.error = 'Debes seleccionar una imagen';
            return;
        }

        this.cargando = true;
        this.mensaje = '';
        this.error = '';

        const value = this.form.value;

        // Procesar las horas (string -> array)
        let horasDisponibles: string[] = [];
        if (value.horasDisponiblesTexto) {
            horasDisponibles = value.horasDisponiblesTexto
                .split(',')
                .map((h: string) => h.trim())
                .filter((h: string) => h !== '');
        }

        // Preparar el objeto de datos (SIN la URL de la foto todavía)
        const data = {
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
            // La propiedad 'foto' NO se manda aquí, el servicio la crea al subir el archivo
        };

        try {
            await this.programadoresService.crearProgramador(data, this.archivoFoto);

            // Notificación bonita ✅
            this.noti.exito('Programador agregado correctamente');

            // Redirigir al listado
            this.router.navigate(['/admin/programadores']);

        } catch (e) {
            console.error(e);

            // Notificación de error ✅
            this.noti.error('Ocurrió un error al guardar el programador');

        } finally {
            this.cargando = false;
        }
    }
}