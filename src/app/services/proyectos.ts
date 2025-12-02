import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

// Definición de tipos específicos
export type TipoProyecto = 'academico' | 'laboral';
export type TipoParticipacion = 'frontend' | 'backend' | 'bd' | 'fullstack';

export interface Proyecto {
  id?: string;
  idProgramador: string; // ID del dueño del proyecto

  nombre: string;
  descripcion: string;

  // 🔹 Campos actualizados:
  tipoProyecto: TipoProyecto;           // 'academico' | 'laboral'
  tipoParticipacion: TipoParticipacion; // 'frontend' | 'backend' | 'bd' | 'fullstack'
  tecnologias: string;                  // Ej: "Angular, Firebase, Node.js" (Ahora es string, no array)
  repoUrl?: string;                     // Enlace al repositorio
  demoUrl?: string;                     // Enlace al demo

  creadoEn: string;                     // Fecha en formato ISO
}

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {

  constructor(private firestore: Firestore) { }

  // LISTAR proyectos filtrando por ID del programador
  getProyectosDeProgramador(idProgramador: string): Observable<Proyecto[]> {
    const ref = collection(this.firestore, 'proyectos');
    // Consulta: Dame los documentos de la colección 'proyectos' donde 'idProgramador' sea igual al ID actual
    const q = query(ref, where('idProgramador', '==', idProgramador));

    return from(getDocs(q)).pipe(
      map(snap =>
        snap.docs.map(d => {
          const data = d.data() as Proyecto;
          return { id: d.id, ...data };
        })
      )
    );
  }

  // OBTENER 1 proyecto por su ID único (ya no requiere idProgramador en la ruta)
  getProyecto(id: string): Observable<Proyecto | null> {
    const refDoc = doc(this.firestore, 'proyectos', id);
    return from(getDoc(refDoc)).pipe(
      map(snap => {
        if (!snap.exists()) return null;
        const data = snap.data() as Proyecto;
        return { id: snap.id, ...data };
      })
    );
  }

  // CREAR proyecto
  crearProyecto(data: Proyecto) {
    const ref = collection(this.firestore, 'proyectos');

    // Limpieza de datos: elimina propiedades undefined para evitar errores en Firestore
    const limpio: any = { ...data };
    Object.keys(limpio).forEach(key => {
      if (limpio[key] === undefined) {
        delete limpio[key];
      }
    });

    return addDoc(ref, limpio);
  }

  // ACTUALIZAR proyecto
  actualizarProyecto(id: string, cambios: Partial<Proyecto>) {
    const refDoc = doc(this.firestore, 'proyectos', id);

    const limpio: any = { ...cambios };
    Object.keys(limpio).forEach(key => {
      if (limpio[key] === undefined) {
        delete limpio[key];
      }
    });

    return updateDoc(refDoc, limpio);
  }

  // ELIMINAR proyecto
  eliminarProyecto(id: string) {
    const refDoc = doc(this.firestore, 'proyectos', id);
    return deleteDoc(refDoc);
  }


  getProyectos(idProgramador: string): Observable<Proyecto[]> {
    return this.getProyectosDeProgramador(idProgramador);
  }

  // 🔹 Alias compatible con la firma antigua (idProgramador, idProyecto)
  deleteProyecto(idProgramador: string, idProyecto: string) {
    // idProgramador no lo necesitamos para borrar,
    // pero dejamos el parámetro para no tocar el componente
    return this.eliminarProyecto(idProyecto);
  }
}