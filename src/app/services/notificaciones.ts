import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Definición de tipos para mayor seguridad de tipado */
export type NotificacionTipo = 'exito' | 'error' | 'info';

export interface NotificacionConfig {
  mensaje: string;
  tipo: NotificacionTipo;
  duracion: number; // en milisegundos
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  // Estado privado de la notificación actual
  private readonly _notificacion = new BehaviorSubject<NotificacionConfig | null>(null);

  /** * Observable que el NotificacionComponent debe consumir con el pipe | async 
   */
  readonly notificacion$: Observable<NotificacionConfig | null> = this._notificacion.asObservable();

  constructor(private http: HttpClient) {}

  // -------------------------------------------------------------------------
  // MÉTODOS DE UI (Toasts / Alertas)
  // -------------------------------------------------------------------------

  exito(mensaje: string, duracion: number = 3500): void {
    this.mostrar({ mensaje, tipo: 'exito', duracion });
  }

  success(mensaje: string, duracion: number = 3500): void {
    this.exito(mensaje, duracion);
  }

  error(mensaje: string, duracion: number = 3500): void {
    this.mostrar({ mensaje, tipo: 'error', duracion });
  }

  info(mensaje: string, duracion: number = 3500): void {
    this.mostrar({ mensaje, tipo: 'info', duracion });
  }

  mostrar(cfg: NotificacionConfig): void {
    this._notificacion.next(cfg);
  }

  limpiar(): void {
    this._notificacion.next(null);
  }

  listarNotificaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/notificaciones`);
  }

  // -------------------------------------------------------------------------
  // CONFIRMACIÓN (Modal dinámico por DOM)
  // -------------------------------------------------------------------------

  confirmar(titulo: string, mensaje: string = ''): Promise<boolean> {
    return new Promise((resolve) => {
      // Crear elementos
      const overlay = document.createElement('div');
      overlay.classList.add('confirm-overlay');

      const modal = document.createElement('div');
      modal.classList.add('confirm-modal');

      const h3 = document.createElement('h3');
      h3.innerText = titulo;

      const p = document.createElement('p');
      p.innerText = mensaje;

      const botones = document.createElement('div');
      botones.classList.add('botones');

      const btnOk = document.createElement('button');
      btnOk.innerText = 'Aceptar';
      btnOk.classList.add('btn-ok');

      const btnCancel = document.createElement('button');
      btnCancel.innerText = 'Cancelar';
      btnCancel.classList.add('btn-cancelar');

      // Ensamblar
      botones.appendChild(btnOk);
      botones.appendChild(btnCancel);
      modal.appendChild(h3);
      modal.appendChild(p);
      modal.appendChild(botones);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // Pequeño delay para disparar la animación CSS
      setTimeout(() => overlay.classList.add('visible'), 10);

      const cerrar = (valor: boolean) => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 200);
        resolve(valor);
      };

      // Eventos
      btnOk.onclick = () => cerrar(true);
      btnCancel.onclick = () => cerrar(false);
      overlay.onclick = (e) => {
        if (e.target === overlay) cerrar(false);
      };
    });
  }
}