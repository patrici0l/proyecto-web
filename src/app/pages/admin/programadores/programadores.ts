import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgramadoresService, Programador } from '../../../services/programadores'; // Ajusta la ruta
import { NotificacionesService } from '../../../services/notificaciones'; // Ajusta la ruta

@Component({
  selector: 'app-programadores',
  standalone: true,
  templateUrl: './programadores.html',
  styleUrls: ['./programadores.scss'],
  imports: [CommonModule, RouterModule]
})
export class ProgramadoresComponent implements OnInit {

  lista: Programador[] = [];
  cargando = false;

  constructor(
    private programadoresService: ProgramadoresService,
    private noti: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.cargarProgramadores();
  }

  cargarProgramadores() {
    this.cargando = true;
    this.programadoresService.getProgramadores().subscribe({
      next: (data) => {
        this.lista = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  // ✅ AQUÍ ESTABA EL PROBLEMA
  // Usamos subscribe para forzar la ejecución
  async eliminar(p: Programador) {
    if (!p.id) return;

    const confirmado = await this.noti.confirmar(
      '¿Eliminar programador?',
      `Se borrará a ${p.nombre} y todos sus datos.`
    );

    if (!confirmado) return;

    // Llamada al servicio
    this.programadoresService.deleteProgramador(p.id).subscribe({
      next: () => {
        this.noti.exito('Eliminado correctamente');
        // Recargamos la lista para ver que desapareció
        this.cargarProgramadores();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.noti.error('No se pudo eliminar. Revisa si tiene proyectos activos.');
      }
    });
  }
}