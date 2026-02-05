import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface WhatsappLinkResponse {
  link: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  // Base: http://localhost:8080/whatsapp-api-1.0/api/whatsapp
  private baseUrl = `${environment.apiJakarta}/api/whatsapp`;

  constructor(private http: HttpClient) {}

  generarLink(telefono: string, mensaje: string): Observable<WhatsappLinkResponse> {
    const params = new HttpParams()
      .set('telefono', telefono)
      .set('mensaje', mensaje);

    return this.http.get<WhatsappLinkResponse>(
      `${this.baseUrl}/link`,
      { params }
    );
  }
}
