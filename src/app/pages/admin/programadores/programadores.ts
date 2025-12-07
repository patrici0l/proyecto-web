import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgramadoresService, Programador } from '../../../services/programadores';
import { NotificacionesService } from '../../../services/notificaciones';

@Component({
  selector: 'app-programadores',
  standalone: true,
  templateUrl: './programadores.html',
  styleUrls: ['./programadores.scss'],
  imports: [CommonModule, RouterModule]
})
export class ProgramadoresComponent implements OnInit {

  lista: Programador[] = [];

  constructor(
    private programadoresService: ProgramadoresService,
    private ngZone: NgZone,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.cargarProgramadores();
  }

  cargarProgramadores() {
    this.programadoresService.getProgramadores()
      .subscribe({
        next: (programadores) => {
          this.ngZone.run(() => {
            this.lista = programadores;
          });
        },
        error: (err) => {
          console.error('Error Firestore:', err);
          this.noti.error('No se pudieron cargar los programadores');
        }
      });
  }

  async eliminar(id: string | undefined) {
    if (!id) return;

    const confirmado = await this.noti.confirmar(
      '¿Eliminar este programador?',
      'Se eliminará toda la información asociada a este programador.\nEsta acción no se puede deshacer.'
    );

    if (!confirmado) return;

    try {
      await this.programadoresService.deleteProgramador(id);

      this.noti.exito('Programador eliminado correctamente.');
      this.cargarProgramadores();

    } catch (e) {
      console.error(e);
      this.noti.error('No se pudo eliminar el programador. Intenta nuevamente.');
    }
  }
}