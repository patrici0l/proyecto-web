import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';

import {
    NotificacionesService,
    NotificacionConfig
} from '../../services/notificaciones';

@Component({
    selector: 'app-notificacion',
    standalone: true,
    templateUrl: './notificacion.html',
    styleUrls: ['./notificacion.scss'],
    imports: [CommonModule]
})
export class NotificacionComponent implements OnInit, OnDestroy {

    visible = false;
    mensaje = '';
    tipo: 'exito' | 'error' | 'info' = 'info';

    private sub?: Subscription;
    private autoHideSub?: Subscription;

    constructor(private notiService: NotificacionesService) { }

    ngOnInit(): void {
        this.sub = this.notiService.notificacion$
            .subscribe((cfg: NotificacionConfig | null) => {
                if (!cfg) {
                    this.visible = false;
                    return;
                }

                this.mensaje = cfg.mensaje;
                this.tipo = cfg.tipo;
                this.visible = true;

                this.autoHideSub?.unsubscribe();
                this.autoHideSub = timer(cfg.duracion).subscribe(() => {
                    this.visible = false;
                });
            });
    }

    cerrar() {
        this.visible = false;
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
        this.autoHideSub?.unsubscribe();
    }
}
