import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Disponibilidad {
  id: string;
  diaSemana: number;      // 0=Domingo ... 6=Sábado
  horaInicio: string;     // "HH:mm:ss" o "HH:mm"
  horaFin: string;        // "HH:mm:ss" o "HH:mm"
  modalidad: 'virtual' | 'presencial';
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class DisponibilidadesService {

  private apiUrl = `${environment.apiUrl}/api/disponibilidades`;

  constructor(private http: HttpClient) {}

  getDeProgramador(idProgramador: string): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${this.apiUrl}/programador/${idProgramador}`);
  }
}
