import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  
  private apiUrl = 'https://api-llanteria-pos.onrender.com/api/productos';

  constructor(private http: HttpClient) { }


  guardarLlanta(producto: any): Observable<any> {
    return this.http.post(this.apiUrl, producto);
  }

  obtenerLlanta(): Observable<any> {
    return this.http.get(this.apiUrl)

  }
  actualizarLlanta(id: string, producto: any): Observable<any>{
    return this.http.put(`${this.apiUrl}/${id}`, producto)
  }


  eliminarLlanta(id: String): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}