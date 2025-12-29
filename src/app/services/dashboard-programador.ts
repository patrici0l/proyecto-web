import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

    getResumen(): Observable<ResumenDashboard> {
        return this.http.get<ResumenDashboard>(`${this.api}/resumen`);
    }

    getSerie(): Observable<PuntoSerie[]> {
        return this.http.get<PuntoSerie[]>(`${this.api}/serie`);
    }
}
