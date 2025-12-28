import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Programador {
  id: string;
  nombre: string;
  foto?: string;
  especialidad?: string;
  descripcion?: string;
  telefono?: string;

  emailContacto?: string;
  whatsapp?: string;
  github?: string;
  linkedin?: string;
  portafolio?: string;

  disponibilidad?: string;
  horasDisponibles?: string[];
  creadoEn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramadoresService {

  private apiUrl = `${environment.apiUrl}/api/programadores`;

  constructor(private http: HttpClient) {}

  // ===============================
  // PÚBLICO
  // ===============================
  getProgramadores(): Observable<Programador[]> {
    return this.http.get<Programador[]>(this.apiUrl);
  }

  getProgramador(id: string): Observable<Programador> {
    return this.http.get<Programador>(`${this.apiUrl}/${id}`);
  }

  // ===============================
  // ADMIN (por ahora stubs funcionales)
  // ===============================
  crearProgramador(data: Partial<Programador>, archivoFoto?: File): Observable<any> {
    // más adelante conectamos con endpoint admin real
    return this.http.post(this.apiUrl, data);
  }

  updateProgramador(id: string, data: Partial<Programador>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteProgramador(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
