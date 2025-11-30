import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgramadoresService } from '../../../services/programadores';

@Component({
    selector: 'app-programador-nuevo',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './programador-nuevo.html',
    styleUrls: ['./programador-nuevo.scss']
})
export class ProgramadorNuevoComponent {

    form: FormGroup;
    archivoFoto: File | null = null;
    cargando = false;
    mensaje = '';
    error = '';

    constructor(
        private fb: FormBuilder,
        private programadoresService: ProgramadoresService
    ) {
        this.form = this.fb.group({
            nombre: ['', Validators.required],
            descripcion: [''],
            especialidad: ['', Validators.required],
            github: [''],
            linkedin: [''],
            portafolio: [''],
        });
    }

    onFotoSeleccionada(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files && input.files[0];
        this.archivoFoto = file ?? null;
    }

    async guardar() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.cargando = true;
        this.mensaje = '';
        this.error = '';

        try {
            await this.programadoresService.crearProgramador(
                this.form.value,
                this.archivoFoto
            );
            this.mensaje = 'Programador agregado correctamente';
            this.form.reset();
            this.archivoFoto = null;
        } catch (e) {
            console.error(e);
            this.error = 'Ocurrió un error al guardar el programador';
        } finally {
            this.cargando = false;
        }
    }
}
