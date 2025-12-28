import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Disponibilidad {
  id?: string;
  diaSemana: number;     // 0..6
  horaInicio: string;    // "09:00" o "09:00:00"
  horaFin: string;       // "12:00" o "12:00:00"
  modalidad: 'virtual' | 'presencial';
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class DisponibilidadesService {

  private apiPublica = `${environment.apiUrl}/api/disponibilidades`;
  private apiPrivada = `${environment.apiUrl}/api/programador/disponibilidades`;

  constructor(private http: HttpClient) { }

  // ======================
  // PÚBLICO (para agendar)
  // ======================
  getDeProgramador(idProgramador: string): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${this.apiPublica}/programador/${idProgramador}`);
  }

  // ======================
  // PRIVADO (programador)
  // ======================
  listarMias(): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(this.apiPrivada);
  }

  crear(data: Omit<Disponibilidad, 'id'>): Observable<any> {
    return this.http.post(this.apiPrivada, data);
  }

  actualizar(id: string, data: Partial<Disponibilidad>): Observable<any> {
    return this.http.put(`${this.apiPrivada}/${id}`, data);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiPrivada}/${id}`);
  }
}
