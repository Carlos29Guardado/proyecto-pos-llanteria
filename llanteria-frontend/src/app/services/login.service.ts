import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    private apiUrl = `${environment.apiUrl}/usuarios`;
    private esNavegador = isPlatformBrowser(inject(PLATFORM_ID));

    constructor(private http: HttpClient) { }


    iniciarSesion(login: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, login);
    }
    loginGoogle(idToken: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/google`, { token: idToken });
    }

    // MANEJO DE LA SESIÓN EN EL NAVEGADOR
    guardarSesion(respuesta: any) {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('rol', respuesta.usuario?.rol ?? '');
    }

    cerrarSesion() {
        if (!this.esNavegador) return;
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
    }

    obtenerToken(): string | null {
        return this.esNavegador ? localStorage.getItem('token') : null;
    }

    // Revisa que exista un token y que no haya expirado
    sesionActiva(): boolean {
        const token = this.obtenerToken();
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    esAdmin(): boolean {
        return this.esNavegador && localStorage.getItem('rol') === 'ADMIN';
    }
}
