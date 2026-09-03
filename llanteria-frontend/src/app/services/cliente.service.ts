import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  
  private apiUrl = 'https://api-llanteria-pos.onrender.com/api/clientes';

  constructor(private http: HttpClient) { }


  crearCliente(cliente: any): Observable<any> {
    return this.http.post(this.apiUrl, cliente);
  }

  obtenerCliente(): Observable<any> {
    return this.http.get(this.apiUrl)
  }
  actualizarCliente(id: string, cliente: any): Observable<any>{
    return this.http.put(`${this.apiUrl}/${id}`, cliente)
  }

  eliminarCliente(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
 
}