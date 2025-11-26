import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgramadoresService, Programador } from '../../../services/programadores';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-programador-nuevo',
    standalone: true,
    imports: [FormsModule, NgIf],
    templateUrl: './programador-nuevo.html',
    styleUrl: './programador-nuevo.scss',
})
export class ProgramadorNuevoComponent {
    cargando = false;
    error: string | null = null;
    vistaPreviaFoto: string | null = null;
    fotoFile: File | null = null;

    modelo: Omit<Programador, 'id' | 'foto'> = {
        nombre: '',
        especialidad: '',
        descripcion: '',
        github: '',
        linkedin: '',
        portafolio: '',
        rol: 'programador',
    };

    constructor(
        private progService: ProgramadoresService,
        private router: Router
    ) { }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        this.fotoFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.vistaPreviaFoto = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    async guardar() {
        if (!this.fotoFile) {
            this.error = 'Debes seleccionar una foto de perfil.';
            return;
        }

        this.cargando = true;
        this.error = null;

        try {
            // 1. Subir foto y obtener URL
            const urlFoto = await this.progService.uploadFotoProgramador(this.fotoFile);

            // 2. Armar objeto completo
            const nuevo: Programador = {
                ...this.modelo,
                foto: urlFoto,
            };

            // 3. Guardar en Firestore
            await this.progService.createProgramador(nuevo);

            // 4. Volver al listado
            this.router.navigate(['/admin/programadores']);
        } catch (err) {
            console.error(err);
            this.error = 'Ocurrió un error al guardar el programador.';
        } finally {
            this.cargando = false;
        }
    }
}
