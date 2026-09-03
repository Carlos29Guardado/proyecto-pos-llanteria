import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  
  private apiUrl = 'https://api-llanteria-pos.onrender.com/api/ventas';

  constructor(private http: HttpClient) { }


  crearVenta(venta: any): Observable<any> {
    return this.http.post(this.apiUrl, venta);
  }

  obtenerVenta(): Observable<any> {
    return this.http.get(this.apiUrl)
  }

  anularVenta(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
 
}