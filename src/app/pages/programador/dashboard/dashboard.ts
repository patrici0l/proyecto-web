import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PythonStatusService, PythonHealth, SchedulerStatus } from '../../../services/python-status.service';
import { NotificacionesService } from '../../../services/notificaciones';

import Chart from 'chart.js/auto';

import {
  DashboardProgramadorService,
  ResumenDashboard,
  PuntoSerie
} from '../../../services/dashboard-programador';
import { ReportesProgramadorService } from '../../../services/reportes-programador';

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
  cargandoNotifs = false;

  // NUEVAS PROPIEDADES (PYTHON Y NOTIFICACIONES)
  pythonHealth: PythonHealth | null = null;
  pythonStatus: SchedulerStatus | null = null;
  notifs: any[] = [];

  // CHARTS
  private chartLine: Chart | null = null;
  private chartPie: Chart | null = null;
  private chartBar: Chart | null = null;

  constructor(
    private dashboardService: DashboardProgramadorService,
    private reportesService: ReportesProgramadorService,
    private notificaciones: NotificacionesService, // Usado para alertas UI
    private py: PythonStatusService,               // Servicio Python
    private notiService: NotificacionesService     // Usado para listar
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarPython();
    this.cargarNotificacionesRecientes();
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
        setTimeout(() => {
          this.crearGraficoPastel();
          this.crearGraficoBarras();
        }, 50);
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);
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
      error: (err) => {
        console.error('Error gráfico evolución:', err);
        this.notificaciones.error('Error gráfico evolución');
        this.cargandoGrafico = false;
      }
    });
  }

  // --- GRÁFICOS ---
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
            'rgba(245, 158, 11, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(239, 68, 68, 0.7)'
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

  // --- DESCARGAS ---
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

  // --- MÉTODOS PYTHON ---

  private cargarPython(): void {
    this.py.health().subscribe({
      next: (h) => (this.pythonHealth = h),
      error: () => (this.pythonHealth = null)
    });

    this.py.schedulerStatus().subscribe({
      next: (s) => (this.pythonStatus = s),
      error: () => (this.pythonStatus = null)
    });
  }

  // --- NOTIFICACIONES CON DEBUG ---

  private cargarNotificacionesRecientes(): void {
    this.cargandoNotifs = true;

    this.notiService.listarNotificaciones().subscribe({
      next: (lista: any[]) => {
        console.log('NOTIFS raw:', lista);

        this.notifs = (lista || [])
          .slice()
          .sort((a, b) => {
            const da = new Date(b.enviadoEn || b.programadaPara || b.fecha || b.createdAt || 0).getTime();
            const db = new Date(a.enviadoEn || a.programadaPara || a.fecha || a.createdAt || 0).getTime();
            return da - db;
          })
          .slice(0, 20);

        console.log('NOTIFS mapped & sorted:', this.notifs);
        this.cargandoNotifs = false;
      },
      error: (err: any) => {
        console.error('NOTIFS error:', err);
        this.notifs = [];
        this.cargandoNotifs = false;
        this.notificaciones.error('Error al conectar con el servicio de notificaciones');
      }
    });
  }
}