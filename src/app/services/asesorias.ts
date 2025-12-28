import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where
} from '@angular/fire/firestore';
import { Observable, from, map, of } from 'rxjs';

export interface Asesoria {
  id?: string;
  idProgramador: string;         // id del documento del programador
  idSolicitante?: string;        // uid del usuario
  nombreSolicitante: string;
  emailSolicitante: string;
  fecha: string;                 // 'YYYY-MM-DD'
  hora: string;                  // 'HH:mm'
  comentario?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  respuestaProgramador?: string;
  creadoEn: string;              // ISO string
}

@Injectable({
  providedIn: 'root'
})
export class AsesoriasService {

  // Únicamente inyectamos Firestore
  constructor(private firestore: Firestore) { }

  /** Obtiene asesorías solicitadas por un usuario */
  getAsesoriasPorSolicitante(idSolicitante: string): Observable<Asesoria[]> {
    const ref = collection(this.firestore, 'asesorias');
    const q = query(ref, where('idSolicitante', '==', idSolicitante));

    return from(getDocs(q)).pipe(
      map(snap =>
        snap.docs.map(d => ({ id: d.id, ...d.data() } as Asesoria))
      )
    );
  }

  /** Crea una nueva asesoría limpiando valores undefined */
  crearAsesoria(data: Asesoria) {
    const ref = collection(this.firestore, 'asesorias');

    // Limpieza de campos undefined para evitar errores en Firestore
    const limpio = JSON.parse(JSON.stringify(data));

    return addDoc(ref, limpio);
  }

  /** Obtiene las asesorías vinculadas a un programador */
  getAsesoriasPorProgramador(idProgramador?: string): Observable<Asesoria[]> {
    if (!idProgramador) return of([]);

    const ref = collection(this.firestore, 'asesorias');
    const q = query(ref, where('idProgramador', '==', idProgramador));

    return from(getDocs(q)).pipe(
      map(snap =>
        snap.docs.map(d => ({ id: d.id, ...d.data() } as Asesoria))
      )
    );
  }

  /** Obtiene el detalle de una asesoría específica */
  getAsesoria(id: string): Observable<Asesoria> {
    const refDoc = doc(this.firestore, 'asesorias', id);

    return from(getDoc(refDoc)).pipe(
      map(snap => ({ id: snap.id, ...snap.data() } as Asesoria))
    );
  }

  /** Actualiza el estado o respuesta de una asesoría */
  updateAsesoria(id: string, cambios: Partial<Asesoria>) {
    const refDoc = doc(this.firestore, 'asesorias', id);
    return updateDoc(refDoc, cambios);
  } 
}