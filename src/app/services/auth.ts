import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import {
  Observable,
  of,
  from,
  switchMap,
  map,
} from 'rxjs';

export interface UserWithRole {
  uid: string;
  nombre: string | null;
  email: string | null;
  foto: string | null;
  rol: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // usuario firebase
  user$ = user(this.auth);

  // usuario + rol desde firestore
  userWithRole$: Observable<UserWithRole | null> = this.user$.pipe(
    switchMap((u) => {
      if (!u) return of(null);

      const ref = doc(this.firestore, 'usuarios', u.uid);

      return from(getDoc(ref)).pipe(
        map((snapshot) => {
          const data = snapshot.data() || {};

          return {
            uid: u.uid,
            nombre: u.displayName,
            email: u.email,
            foto: u.photoURL,
            rol: (data['rol'] as string) ?? 'usuario',
          };
        })
      );
    })
  );

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);

    const u = result.user;
    const ref = doc(this.firestore, 'usuarios', u.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        nombre: u.displayName,
        email: u.email,
        foto: u.photoURL,
        rol: 'usuario',
      });
    }

    return result;
  }

  logout() {
    return signOut(this.auth);
  }
}
