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
  // Estos campos son opcionales, pero útiles si el backend los manda
  disponibilidad?: string;
  horasDisponibles?: string[];
  creadoEn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramadoresService {

  private apiUrl = `${environment.apiUrl}/api/programadores`;

  constructor(private http: HttpClient) { }

  // ===============================
  // PÚBLICO
  // ===============================
  getProgramadores(): Observable<Programador[]> {
    return this.http.get<Programador[]>(this.apiUrl);
  }

  getProgramador(id: string): Observable<Programador> {
    return this.http.get<Programador>(`${this.apiUrl}/${id}`);
  }

  // ✅✅✅ NUEVO MÉTODO IMPORTANTE ✅✅✅
  // Llama al backend: /api/programadores/{id}/slots?fecha=2025-12-29
  obtenerSlots(id: string, fecha: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${id}/slots?fecha=${fecha}`);
  }

  // ===============================
  // ADMIN (Stubs)
  // ===============================
  crearProgramador(data: Partial<Programador>, archivoFoto?: File): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateProgramador(id: string, data: Partial<Programador>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteProgramador(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}