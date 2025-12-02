import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProgramadoresService } from '../../../services/programadores';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
    selector: 'app-programador-nuevo',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './programador-nuevo.html',
    styleUrls: ['./programador-nuevo.scss']
})
export class ProgramadorNuevoComponent {

    form: FormGroup;
    archivoFoto: File | null = null;
    previewUrl: string | null = null;
    cargando = false;
    mensaje = '';
    error = '';

    constructor(
        private fb: FormBuilder,
        private programadoresService: ProgramadoresService,
        private storage: Storage,
        private router: Router
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

        this.archivoFoto = input.files[0];

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

        let horasDisponibles: string[] = [];
        if (value.horasDisponiblesTexto) {
            horasDisponibles = value.horasDisponiblesTexto
                .split(',')
                .map((h: string) => h.trim())
                .filter((h: string) => h !== '');
        }

        try {
            const ruta = `programadores/${Date.now()}_${this.archivoFoto.name}`;
            const storageRef = ref(this.storage, ruta);
            await uploadBytes(storageRef, this.archivoFoto);
            const urlFotoFinal = await getDownloadURL(storageRef);

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
                horasDisponibles,
                foto: urlFotoFinal
            };

            await this.programadoresService.crearProgramador(data, null);

            this.mensaje = 'Programador agregado correctamente';
            this.router.navigate(['/admin/programadores']);

        } catch (e) {
            console.error(e);
            this.error = 'Ocurrió un error al guardar el programador';
        } finally {
            this.cargando = false;
        }
    }
}
