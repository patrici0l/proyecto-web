import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { routes } from './app.routes';
import { authInterceptor } from './interceptores/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    // ✅ Rutas REALES (aquí estaba el error)
    provideRouter(routes),

    // ✅ HTTP con Interceptor JWT
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // ✅ Firebase (lo dejas como está)
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
};
