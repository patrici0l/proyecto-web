import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

/* =========================
   MODELOS
   ========================= */

export interface Asesoria {
  id?: string;

  idProgramador: string;
  idSolicitante?: string;

  nombreSolicitante: string;
  emailSolicitante: string;
 telefonoSolicitante?: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:mm

  comentario?: string;

  estado: 'pendiente' | 'aprobada' | 'rechazada';
  respuestaProgramador?: string;

  creadoEn: string; // ISO
}

export interface AsesoriaPublica {
  idProgramador: string;
  nombreSolicitante: string;
  emailSolicitante: string;
  fecha: string;
  hora: string;
  comentario?: string;
  telefonoSolicitante?: string;

}

@Injectable({ providedIn: 'root' })
export class AsesoriasService {

  private api = `${environment.apiUrl}/api/asesorias`;

  constructor(private http: HttpClient) { }

  /* =========================
     PÚBLICO
     ========================= */

  // Crear asesoría pública
  crearPublica(data: AsesoriaPublica): Observable<any> {
    return this.http.post(`${this.api}/publica`, {
      idProgramador: data.idProgramador,
      nombreSolicitante: data.nombreSolicitante,
      emailSolicitante: data.emailSolicitante,
      telefonoSolicitante: data.telefonoSolicitante || '',
      fecha: data.fecha,
      hora: data.hora,
      comentario: data.comentario || ''
    });
  }

  // Horas ocupadas (agenda pública)
  getOcupadas(
    idProgramador: string,
    fecha: string
  ): Observable<{ hora: string }[]> {
    return this.http.get<{ hora: string }[]>(
      `${this.api}/ocupadas/${idProgramador}?fecha=${fecha}`
    );
  }

  /* =========================
     PROGRAMADOR (JWT)
     ========================= */


  getAsesoriasDelProgramador(): Observable<Asesoria[]> {
    return this.http.get<Asesoria[]>(`${this.api}/programador`);
  }

  /* =========================
     USUARIO LOGUEADO
     ========================= */

  // 🔐 Asesorías del solicitante autenticado
  getMisAsesorias(): Observable<Asesoria[]> {
    return this.http.get<Asesoria[]>(`${this.api}/mis`);
  }

  getFiltradasProgramador(filtros: {
    estado?: string;
    desde?: string;
    hasta?: string;
  }) {
    const params = new URLSearchParams();

    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);

    return this.http.get<Asesoria[]>(
      `${this.api}/programador/filtradas?${params.toString()}`
    );
  }


  /* =========================
     ACTUALIZAR ASESORÍA
     ========================= */

  updateAsesoria(
    id: string,
    cambios: Partial<Asesoria>
  ): Observable<any> {
    return this.http.put(`${this.api}/${id}`, {
      estado: cambios.estado,
      respuestaProgramador: cambios.respuestaProgramador || ''
    });
  }
}
