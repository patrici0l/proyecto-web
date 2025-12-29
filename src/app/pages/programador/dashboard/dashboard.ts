import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import Chart from 'chart.js/auto';

import {
  DashboardProgramadorService,
  ResumenDashboard,
  PuntoSerie
} from '../../../services/dashboard-programador';

import { ReportesProgramadorService } from '../../../services/reportes-programador';
import { NotificacionesService } from '../../../services/notificaciones';

@Component({
  selector: 'app-programador-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [CommonModule]
})
export class ProgramadorDashboardComponent
  implements OnInit, AfterViewInit {

  // ========================
  // PROPIEDADES
  // ========================
  resumen: ResumenDashboard | null = null;
  cargando = true;

  private chart: Chart | null = null;

  // ========================
  // CONSTRUCTOR
  // ========================
  constructor(
    private dashboardService: DashboardProgramadorService,
    private reportesService: ReportesProgramadorService,
    private notificaciones: NotificacionesService
  ) { }

  // ========================
  // CICLO DE VIDA
  // ========================
  ngOnInit(): void {
    this.cargarResumen();
  }

  ngAfterViewInit(): void {
    this.cargarGrafico();
  }

  // ========================
  // MÉTODOS DE CARGA
  // ========================
  private cargarResumen(): void {
    this.dashboardService.getResumen().subscribe({
      next: (res) => (this.resumen = res),
      error: () =>
        this.notificaciones.error('No se pudo cargar el resumen')
    });
  }

  private cargarGrafico(): void {
    this.dashboardService.getSerie().subscribe({
      next: (serie) => {
        this.crearGrafico(serie);
        this.cargando = false;
      },
      error: () => {
        this.notificaciones.error('No se pudo cargar el gráfico');
        this.cargando = false;
      }
    });
  }

  // ========================
  // REPORTES
  // ========================
  descargarPdf(): void {
    this.reportesService.descargarPdf().subscribe((blob) => {
      this.descargarArchivo(blob, 'asesorias.pdf');
    });
  }

  descargarExcel(): void {
    this.reportesService.descargarExcel().subscribe((blob) => {
      this.descargarArchivo(blob, 'asesorias.xlsx');
    });
  }

  private descargarArchivo(blob: Blob, nombre: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = nombre;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  // ========================
  // GRÁFICO
  // ========================
  private crearGrafico(serie: PuntoSerie[]): void {
    const labels = serie.map((s) => s.fecha);
    const data = serie.map((s) => s.total);

    const canvas = document.getElementById(
      'graficoAsesorias'
    ) as HTMLCanvasElement;

    if (!canvas) return;

    this.chart?.destroy();

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Asesorías por día',
            data,
            tension: 0.3
          }
        ]
      }
    });
  }
}
