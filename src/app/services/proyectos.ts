import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Asegúrate de que la ruta a environment sea correcta según tu estructura de carpetas
import { environment } from '../../environments/environment';

// --- 1. TIPOS Y ENUMS (Conservados del Snippet 1) ---
export type TipoProyecto = 'academico' | 'laboral';
export type TipoParticipacion = 'frontend' | 'backend' | 'bd' | 'fullstack';

// --- 2. INTERFAZ PROYECTO (Fusionada) ---
export interface Proyecto {
  id?: string;           // Opcional al crear, obligatorio al leer
  titulo: string;
  descripcion: string;
  tecnologias: string;
  urlRepo?: string;
  urlDemo?: string;
  estado?: 'activo' | 'inactivo' | string; // Flexible para ambos códigos

  // Campos opcionales de metadatos
  tipoProyecto?: TipoProyecto;
  tipoParticipacion?: TipoParticipacion;
  creadoEn?: string;

  // Campo de compatibilidad (Java lo saca del token, pero lo dejamos por si acaso)
  idProgramador?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {

  // ✅ Usamos environment para que funcione en desarrollo y producción
  private apiUrl = `${environment.apiUrl}/api/proyectos`;

  constructor(private http: HttpClient) { }

  // --- MÉTODOS CRUD GENERALES ---

  getProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.apiUrl);
  }

  getProyecto(id: string): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.apiUrl}/${id}`);
  }

  crearProyecto(data: Proyecto): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.apiUrl, data);
  }

  actualizarProyecto(id: string, cambios: Partial<Proyecto>): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, cambios);
  }

  eliminarProyecto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- MÉTODOS ESPECÍFICOS Y COMPATIBILIDAD ---

  // ✅ Método solicitado: Obtener proyectos filtrados por ID de programador
  getProyectosDeProgramador(idProgramador: string): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.apiUrl}/programador/${idProgramador}`);
  }

  // Alias para mantener compatibilidad si tu código antiguo llama a 'deleteProyecto'
  deleteProyecto(idProgramador: string, idProyecto: string) {
    return this.eliminarProyecto(idProyecto);
  }
}