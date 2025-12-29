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
  // Nuevos campos
  emailContacto?: string;
  whatsapp?: string;
  github?: string;
  linkedin?: string;
  portafolio?: string;
  disponibilidad?: string;      // Texto libre
  horasDisponibles?: string[];  // Array de horas
  usuarioId?: string;
  creadoEn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramadoresService {

  // Asegúrate de que environment.apiUrl apunte a tu backend (ej: http://localhost:9090)
  private apiUrl = `${environment.apiUrl}/api/programadores`;

  constructor(private http: HttpClient) { }

  // ===============================
  // 🟢 MÉTODOS PÚBLICOS (Lectura)
  // ===============================

  getProgramadores(): Observable<Programador[]> {
    return this.http.get<Programador[]>(this.apiUrl);
  }

  getProgramador(id: string): Observable<Programador> {
    return this.http.get<Programador>(`${this.apiUrl}/${id}`);
  }

  // Obtener horarios disponibles
  obtenerSlots(id: string, fecha: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${id}/slots?fecha=${fecha}`);
  }

  // ===============================
  // 🟠 MÉTODOS ADMIN (Escritura)
  // ===============================

  crearProgramador(data: any, archivo: File | null): Observable<any> {
    const formData = this.construirFormData(data, archivo);
    return this.http.post(this.apiUrl, formData);
  }

  updateProgramador(id: string, data: any, archivo: File | null): Observable<any> {
    const formData = this.construirFormData(data, archivo);
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  deleteProgramador(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ===============================
  // 🔧 UTILERÍA PRIVADA
  // ===============================

  /**
   * Construye el FormData asegurando que los nombres de los campos
   * coincidan EXACTAMENTE con los @RequestParam del Backend.
   */
  private construirFormData(data: any, archivo: File | null): FormData {
    const formData = new FormData();

    // 1. Adjuntar Archivo (si existe)
    if (archivo) {
      formData.append('file', archivo);
    }

    // 2. Definir los campos de texto permitidos (para evitar enviar basura)
    // Estos nombres deben ser IGUALES a los de tu Controller Java
    const camposTexto = [
      'nombre',
      'descripcion',
      'especialidad',
      'emailContacto',
      'whatsapp',
      'github',
      'linkedin',
      'portafolio',
      'disponibilidad' // disponibilidadTexto en backend, pero el @RequestParam lo llamamos 'disponibilidad'
    ];

    // 3. Recorrer y agregar campos de texto
    camposTexto.forEach(campo => {
      if (data[campo] !== null && data[campo] !== undefined) {
        formData.append(campo, data[campo].toString());
      }
    });

    // 4. Manejo especial para Arrays (Horas)
    if (data.horasDisponibles && Array.isArray(data.horasDisponibles)) {
      // Spring Boot espera un String JSON para convertirlo a List
      formData.append('horasDisponibles', JSON.stringify(data.horasDisponibles));
    }

    // DEBUG: Ver qué se está enviando (solo visible en consola del navegador)
    // formData.forEach((value, key) => {
    //    console.log(`FormData: ${key} = ${value}`);
    // });

    return formData;
  }
}