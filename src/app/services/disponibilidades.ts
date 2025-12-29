import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface Disponibilidad {
  id: string;
  diaSemana: number;      // 0-6
  horaInicio: string;     // HH:mm
  horaFin: string;
  modalidad: string;      // 'virtual' | 'presencial'
  activo: boolean;        // 🔴 ESTO FALTABA

}

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadesService {

  // Usamos la misma base que definimos en el Controller de Java
  private apiUrl = `${environment.apiUrl}/api/disponibilidades`;

  constructor(private http: HttpClient) { }

  /**
   * ==========================================
   * MÉTODOS PÚBLICOS (Para Clientes)
   * ==========================================
   */

  // Obtiene las disponibilidades activas de un programador específico
  getPorProgramador(idProgramador: string): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${this.apiUrl}/programador/${idProgramador}`);
  }

  /**
   * ==========================================
   * MÉTODOS PRIVADOS (Para el Programador logueado)
   * ==========================================
   */

  // Lista todas las disponibilidades del perfil logueado (activas e inactivas)
  listarMias(): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${this.apiUrl}/mis-disponibilidades`);
  }

  // Crea una nueva franja horaria
  crear(data: Omit<Disponibilidad, 'id'>): Observable<Disponibilidad> {
    return this.http.post<Disponibilidad>(this.apiUrl, data);
  }

  // Actualiza una disponibilidad existente
  actualizar(id: string, data: Partial<Disponibilidad>): Observable<Disponibilidad> {
    return this.http.put<Disponibilidad>(`${this.apiUrl}/${id}`, data);
  }

  // Elimina una disponibilidad
  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}