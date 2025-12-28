import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AsesoriaRecibida {
  id: string;
  nombreSolicitante: string;
  emailSolicitante: string;
  fecha: string;   // YYYY-MM-DD
  hora: string;    // HH:mm:ss o HH:mm
  comentario?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  respuestaProgramador?: string;
  creadoEn?: string;
}

@Injectable({ providedIn: 'root' })
export class AsesoriasProgramadorService {

  private apiUrl = `${environment.apiUrl}/api/programador/asesorias`;

  constructor(private http: HttpClient) { }

  listarMias(): Observable<AsesoriaRecibida[]> {
    return this.http.get<AsesoriaRecibida[]>(this.apiUrl);
  }

  actualizar(id: string, data: { estado: 'aprobada' | 'rechazada'; respuestaProgramador?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
