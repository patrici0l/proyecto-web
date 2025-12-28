import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Asesoria {
  id?: string;
  idProgramador: string;
  idSolicitante?: string;
  nombreSolicitante: string;
  emailSolicitante: string;
  fecha: string;
  hora: string;
  comentario?: string;
  estado?: 'pendiente' | 'aprobada' | 'rechazada';
  creadoEn?: string;
  // ✅ NUEVO: Agregado para evitar el error en el HTML
  respuestaProgramador?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AsesoriasService {

  private apiUrl = `${environment.apiUrl}/api/asesorias`;

  constructor(private http: HttpClient) { }

  // 🔹 Horas ocupadas de un programador en una fecha
  getOcupadas(idProgramador: string, fecha: string): Observable<Asesoria[]> {
    return this.http.get<Asesoria[]>(
      `${this.apiUrl}/programador/${idProgramador}/ocupadas?fecha=${fecha}`
    );
  }

  // 🔹 Crear asesoría pública
  crearPublica(data: Partial<Asesoria>): Observable<any> {
    return this.http.post(`${this.apiUrl}/publica`, data);
  }

  // -----------------------------------------------------------------------
  // ✅ MÉTODOS AGREGADOS PARA CORREGIR LOS ERRORES DE TS
  // (Asegúrate de que tu Backend tenga estas rutas o adáptalas)
  // -----------------------------------------------------------------------

  // 1. Obtener asesorías por EMAIL del solicitante (Usuario normal)
  getAsesoriasPorSolicitante(email: string): Observable<Asesoria[]> {
    // Ejemplo: GET /api/asesorias/solicitante/juan@mail.com
    return this.http.get<Asesoria[]>(`${this.apiUrl}/solicitante/${email}`);
  }

  // 2. Obtener asesorías por ID del programador (Panel Programador)
  getAsesoriasPorProgramador(idProgramador: string): Observable<Asesoria[]> {
    // Ejemplo: GET /api/asesorias/programador/12345
    return this.http.get<Asesoria[]>(`${this.apiUrl}/programador/${idProgramador}`);
  }

  // 3. Actualizar asesoría (Para responder)
  updateAsesoria(id: string, data: Partial<Asesoria>): Observable<any> {
    // Ejemplo: PUT /api/asesorias/ID_ASESORIA
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}