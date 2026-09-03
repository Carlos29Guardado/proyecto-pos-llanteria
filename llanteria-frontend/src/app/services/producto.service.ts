import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  
  private apiUrl = 'https://api-llanteria-pos.onrender.com/api/productos';

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


  eliminarProducto(id: String): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}