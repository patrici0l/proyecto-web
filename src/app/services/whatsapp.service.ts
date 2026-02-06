import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WhatsappLinkResponse {
  link: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  // URL temporal para desarrollo local
  private baseUrl = `${environment.apiJakartaWhatsApp}`.replace(/\/+$/, '');

  constructor(private http: HttpClient) {
    
  }

  generarLink(telefono: string, mensaje: string): Observable<{ link: string }> {
    const params = new HttpParams()
      .set('telefono', telefono)
      .set('mensaje', mensaje);

 return this.http.get<{ link: string }>(`${this.baseUrl}/link`, { params });

  }
}