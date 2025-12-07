import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificacionTipo = 'exito' | 'error' | 'info';

export interface NotificacionConfig {
    mensaje: string;
    tipo: NotificacionTipo;
    duracion: number; // ms
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
    private readonly _notificacion = new BehaviorSubject<NotificacionConfig | null>(null);

    /** Observable que consume NotificacionComponent */
    readonly notificacion$: Observable<NotificacionConfig | null> = this._notificacion.asObservable();

    // -----------------------------
    //  NOTIFICACIONES (para el componente)
    // -----------------------------
    exito(mensaje: string, duracion: number = 3500): void {
        this.mostrar({ mensaje, tipo: 'exito', duracion });
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

    // -----------------------------
    //  CONFIRMACIÓN ELEGANTE (igual que la tuya)
    // -----------------------------
    confirmar(titulo: string, mensaje: string = ''): Promise<boolean> {
        return new Promise((resolve) => {
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

            botones.appendChild(btnOk);
            botones.appendChild(btnCancel);

            modal.appendChild(h3);
            modal.appendChild(p);
            modal.appendChild(botones);
            overlay.appendChild(modal);

            document.body.appendChild(overlay);

            setTimeout(() => overlay.classList.add('visible'), 10);

            const cerrar = (valor: boolean) => {
                overlay.classList.remove('visible');
                setTimeout(() => overlay.remove(), 200);
                resolve(valor);
            };

            btnOk.onclick = () => cerrar(true);
            btnCancel.onclick = () => cerrar(false);

            // opcional: cerrar al hacer click fuera
            overlay.onclick = (e) => {
                if (e.target === overlay) cerrar(false);
            };
        });
    }
}
