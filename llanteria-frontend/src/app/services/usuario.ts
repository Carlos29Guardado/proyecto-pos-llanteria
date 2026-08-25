import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private url = 'https://api-llanteria-pos.onrender.com/api/usuarios';

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<any> {
    return this.http.get(this.url);
  }

  crearUsuario(usuario: any): Observable<any> {
    return this.http.post(this.url, usuario);
  }

  actualizarUsuario(id: string, usuario: any): Observable<any> {
    return this.http.put(this.url + id, usuario);
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(this.url + id);
  }
}