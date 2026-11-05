import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) { }


  crearProducto(producto: any): Observable<any> {
    return this.http.post(this.apiUrl, producto);
  }

  obtenerProducto(): Observable<any> {
    return this.http.get(this.apiUrl)

  }
  actualizarProducto(id: string, producto: any): Observable<any>{
    return this.http.put(`${this.apiUrl}/${id}`, producto)
  }


  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}