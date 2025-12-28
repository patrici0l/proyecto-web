import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de tener esto o usa la URL directa

// 1. MANTENEMOS TU INTERFAZ EXACTA
export interface UsuarioApp {
  uid: string;
  nombre: string;
  email: string;
  foto?: string;
  rol: 'admin' | 'programador' | 'usuario';
  idProgramador?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:9090/api/auth'; // Tu backend Java

  // 2. SIMULAMOS EL AUTHSTATE DE FIREBASE
  // BehaviorSubject es una variable que siempre recuerda el último valor
  private usuarioSubject = new BehaviorSubject<UsuarioApp | null>(null);

  // Esta variable pública es la que escuchan tus Guards y Menús
  public usuario$: Observable<UsuarioApp | null> = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    // Al iniciar la app, verificamos si hay token guardado
    this.validarTokenAlInicio();
  }

  // --- LOGIN (Conecta con Spring Boot) ---
  login(credenciales: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(respuesta => {
        if (respuesta.token) {
          this.guardarSesion(respuesta.token);
        }
      })
    );
  }

  // --- REGISTRO (Conecta con Spring Boot) ---
  registrar(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, usuario).pipe(
      tap(respuesta => {
        if (respuesta.token) {
          this.guardarSesion(respuesta.token);
        }
      })
    );
  }

  // --- LOGOUT ---
  logout(): Promise<void> {
    localStorage.removeItem('token');
    this.usuarioSubject.next(null); // Avisamos a la app que se cerró sesión
    return Promise.resolve();
  }

  // --- MANTENER COMPATIBILIDAD CON CÓDIGO VIEJO ---
  // Como tu login.ts viejo llama a loginConGoogle, lo dejamos aquí pero lanzamos error
  // o lo redirigimos al login normal.
  async loginConGoogle(): Promise<void> {
    console.warn('El login con Google requiere configuración extra en Backend.');
    alert('Por favor usa Email y Contraseña por ahora.');
    return Promise.resolve();
  }

  // ==========================================
  // LÓGICA PRIVADA PARA MANEJAR EL TOKEN
  // ==========================================

  private guardarSesion(token: string) {
    localStorage.setItem('token', token);
    this.decodificarToken(token);
  }

  private validarTokenAlInicio() {
    const token = localStorage.getItem('token');
    if (token) {
      this.decodificarToken(token);
    } else {
      this.usuarioSubject.next(null);
    }
  }

  // Extraemos los datos del JWT
  private decodificarToken(token: string) {
    try {
      // 1. Decodificar payload del JWT (Parte 2 del token)
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      // 2. Construir el objeto UsuarioApp
      // NOTA: Java debe enviar estos datos en el token.
      // Si Java no envía 'rol', ponemos 'usuario' por defecto para que no falle.
      const usuario: UsuarioApp = {
        uid: payload.sub || 'uid-java', // El email suele ser el subject
        email: payload.sub || '',
        nombre: payload.nombre || 'Usuario', // Java debe incluir esto en claims
        rol: payload.rol || 'usuario',       // Java debe incluir esto en claims
        foto: '',
        // idProgramador: payload.idProgramador // Si Java lo envía, lo mapeas aquí
      };

      // 3. Emitir el valor para que 'usuario$' se actualice en toda la app
      this.usuarioSubject.next(usuario);

    } catch (error) {
      console.error('Token inválido', error);
      this.logout();
    }
  }

  // Método auxiliar para obtener el token en crudo (usado por el Interceptor)
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}