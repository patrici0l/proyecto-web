import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  deleteDoc,
  doc
} from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';

// 👇 interface que pedía tu componente Programadores
export interface Programador {
  id?: string;
  nombre: string;
  descripcion: string;
  especialidad: string;
  github?: string;
  linkedin?: string;
  portafolio?: string;
  foto?: string;
  rol?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramadoresService {

  private programadoresRef;

  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) {
    this.programadoresRef = collection(this.firestore, 'programadores');
  }

  // 👇 para la lista de programadores
  getProgramadores(): Observable<Programador[]> {
    return collectionData(this.programadoresRef, { idField: 'id' }) as Observable<Programador[]>;
  }

  // 👇 para crear programador (con foto)
  async crearProgramador(data: Programador, archivoFoto: File | null) {
    let urlFoto = '';

    if (archivoFoto) {
      const nombreArchivo = `${Date.now()}_${archivoFoto.name}`;
      const ruta = `programadores/${nombreArchivo}`;

      const storageRef = ref(this.storage, ruta);
      await uploadBytes(storageRef, archivoFoto);
      urlFoto = await getDownloadURL(storageRef);
    }

    return addDoc(this.programadoresRef, {
      ...data,
      foto: urlFoto,
      rol: 'programador',
    });
  }

  // 👇 para borrar desde la tabla
  async deleteProgramador(id: string) {
    const refDoc = doc(this.firestore, `programadores/${id}`);
    await deleteDoc(refDoc);
  }
}
