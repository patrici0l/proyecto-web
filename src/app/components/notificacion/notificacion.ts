import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';

import { NotificacionesService, NotificacionConfig } from '../../services/notificaciones';

type TipoNoti = 'exito' | 'error' | 'info';

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
    tipo: TipoNoti = 'info';

    private sub?: Subscription;
    private autoHideSub?: Subscription;

    constructor(private notiService: NotificacionesService) { }

    ngOnInit(): void {
        this.sub = this.notiService.notificacion$
            .subscribe((cfg: NotificacionConfig | null) => {

                // cerrar si viene null
                if (!cfg) {
                    this.hide();
                    return;
                }

                this.mensaje = cfg.mensaje;
                this.tipo = cfg.tipo as TipoNoti;
                this.visible = true;

                // autocierre
                this.autoHideSub?.unsubscribe();

                const duracion = typeof cfg.duracion === 'number' ? cfg.duracion : 3000;
                if (duracion > 0) {
                    this.autoHideSub = timer(duracion).subscribe(() => this.hide());
                }
            });
    }

    cerrar(): void {
        this.hide();
    }

    private hide(): void {
        this.visible = false;
    }

    // Cerrar con ESC (opcional, recomendado)
    @HostListener('document:keydown.escape')
    onEsc(): void {
        if (this.visible) this.hide();
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
        this.autoHideSub?.unsubscribe();
    }
}
