import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface ResumenDashboard {
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
}

export interface PuntoSerie {
    fecha: string; // YYYY-MM-DD
    total: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardProgramadorService {

    private api = `${environment.apiUrl}/api/programador/dashboard`;

    constructor(private http: HttpClient) { }

    // Aceptamos filtros opcionales
    getResumen(filtros?: { estado?: string; desde?: string; hasta?: string }): Observable<ResumenDashboard> {
        let params = new HttpParams();
        if (filtros) {
            if (filtros.estado) params = params.set('estado', filtros.estado);
            if (filtros.desde) params = params.set('fechaDesde', filtros.desde);
            if (filtros.hasta) params = params.set('fechaHasta', filtros.hasta);
        }

        return this.http.get<ResumenDashboard>(`${this.api}/resumen`, { params });
    }

    getSerie(filtros?: { estado?: string; desde?: string; hasta?: string }): Observable<PuntoSerie[]> {
        let params = new HttpParams();
        if (filtros) {
            if (filtros.estado) params = params.set('estado', filtros.estado);
            if (filtros.desde) params = params.set('fechaDesde', filtros.desde);
            if (filtros.hasta) params = params.set('fechaHasta', filtros.hasta);
        }

        return this.http.get<PuntoSerie[]>(`${this.api}/serie`, { params });
    }
}