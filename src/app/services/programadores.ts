import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

export interface Programador {
  id?: string;
  nombre: string;
  especialidad: string;
  descripcion: string;
  foto: string;
  github: string;
  linkedin: string;
  portafolio: string;
  rol: string; // siempre programador
}

@Injectable({
  providedIn: 'root'
})
export class ProgramadoresService {

  private firestore = inject(Firestore);
  private colRef = collection(this.firestore, 'programadores');
  private storage = inject(Storage);

  getProgramadores(): Observable<Programador[]> {
    return collectionData(this.colRef, { idField: 'id' }) as Observable<Programador[]>;
  }

  createProgramador(prog: Programador) {
    return addDoc(this.colRef, prog);
  }

  updateProgramador(id: string, prog: Partial<Programador>) {
    const ref = doc(this.firestore, 'programadores', id);
    return updateDoc(ref, prog);
  }

  deleteProgramador(id: string) {
    const ref = doc(this.firestore, 'programadores', id);
    return deleteDoc(ref);
  }
  async uploadFotoProgramador(file: File): Promise<string> {
    const filePath = `programadores/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url; // URL pública de la imagen
  }

}
