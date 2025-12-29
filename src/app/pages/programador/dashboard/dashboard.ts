import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule]
})
export class ProgramadorDashboardComponent implements OnInit, AfterViewInit {

  // DATOS Y FILTROS
  resumen: ResumenDashboard | null = null;
  estado = '';
  desde = '';
  hasta = '';

  // ESTADO UI
  cargandoResumen = false;
  cargandoGrafico = false;
  descargando = false;

  // CHARTS
  private chartLine: Chart | null = null;
  private chartPie: Chart | null = null;
  private chartBar: Chart | null = null; // <--- NUEVO

  constructor(
    private dashboardService: DashboardProgramadorService,
    private reportesService: ReportesProgramadorService,
    private notificaciones: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void { }

  aplicarFiltros(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    const filtros = { estado: this.estado, desde: this.desde, hasta: this.hasta };
    this.cargarResumen(filtros);
    this.cargarSerie(filtros);
  }

  // CARGA DE RESUMEN (Alimenta Pastel y Barras)
  private cargarResumen(filtros: any): void {
    this.cargandoResumen = true;
    this.dashboardService.getResumen(filtros).subscribe({
      next: (res) => {
        this.resumen = res;
        this.cargandoResumen = false;
        // Creamos ambos gráficos
        setTimeout(() => {
          this.crearGraficoPastel();
          this.crearGraficoBarras(); // <--- LLAMADA NUEVA
        }, 50);
      },
      error: () => {
        this.notificaciones.error('Error al cargar resumen');
        this.cargandoResumen = false;
      }
    });
  }

  // CARGA DE SERIE (Alimenta Línea)
  private cargarSerie(filtros: any): void {
    this.cargandoGrafico = true;
    this.dashboardService.getSerie(filtros).subscribe({
      next: (serie) => {
        this.crearGraficoLinea(serie);
        this.cargandoGrafico = false;
      },
      error: () => {
        this.notificaciones.error('Error gráfico evolución');
        this.cargandoGrafico = false;
      }
    });
  }

  // --- GRÁFICO 1: LÍNEA ---
  private crearGraficoLinea(serie: PuntoSerie[]): void {
    const canvas = document.getElementById('graficoAsesorias') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.chartLine) this.chartLine.destroy();

    this.chartLine = new Chart(canvas, {
      type: 'line',
      data: {
        labels: serie.map(s => s.fecha),
        datasets: [{
          label: 'Asesorías',
          data: serie.map(s => s.total),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // --- GRÁFICO 2: PASTEL (Doughnut) ---
  private crearGraficoPastel(): void {
    if (!this.resumen) return;
    const canvas = document.getElementById('graficoPastel') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.chartPie) this.chartPie.destroy();

    this.chartPie = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Pendientes', 'Aprobadas', 'Rechazadas'],
        datasets: [{
          data: [this.resumen.pendientes, this.resumen.aprobadas, this.resumen.rechazadas],
          backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
        }
      }
    });
  }

  // --- GRÁFICO 3: BARRAS (NUEVO) ---
  private crearGraficoBarras(): void {
    if (!this.resumen) return;
    const canvas = document.getElementById('graficoBarras') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.chartBar) this.chartBar.destroy();

    this.chartBar = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Pendientes', 'Aprobadas', 'Rechazadas'],
        datasets: [{
          label: 'Cantidad',
          data: [this.resumen.pendientes, this.resumen.aprobadas, this.resumen.rechazadas],
          backgroundColor: [
            'rgba(245, 158, 11, 0.7)', // Naranja traslúcido
            'rgba(16, 185, 129, 0.7)', // Verde traslúcido
            'rgba(239, 68, 68, 0.7)'   // Rojo traslúcido
          ],
          borderColor: ['#f59e0b', '#10b981', '#ef4444'],
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // DESCARGAS
  descargarPdf(): void {
    this.descargando = true;
    this.reportesService.descargarPdf().subscribe({
      next: (blob) => {
        this.descargarArchivo(blob, 'reporte.pdf');
        this.descargando = false;
        this.notificaciones.success('PDF descargado');
      },
      error: () => { this.descargando = false; this.notificaciones.error('Error descarga PDF'); }
    });
  }

  descargarExcel(): void {
    this.descargando = true;
    this.reportesService.descargarExcel().subscribe({
      next: (blob) => {
        this.descargarArchivo(blob, 'reporte.xlsx');
        this.descargando = false;
        this.notificaciones.success('Excel descargado');
      },
      error: () => { this.descargando = false; this.notificaciones.error('Error descarga Excel'); }
    });
  }

  private descargarArchivo(blob: Blob, nombre: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}