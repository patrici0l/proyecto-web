import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportesProgramadorService {

    private api = `${environment.apiUrl}/api/programador/reportes`;

    constructor(private http: HttpClient) { }

    descargarPdf() {
        return this.http.get(`${this.api}/pdf`, {
            responseType: 'blob'
        });
    }

    descargarExcel() {
        return this.http.get(`${this.api}/excel`, {
            responseType: 'blob'
        });
    }
}
