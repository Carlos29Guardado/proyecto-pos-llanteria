import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { adminGuard, authGuard } from './auth-guard';

// Crea un JWT de prueba (sin firma real) que expira en los segundos indicados
const crearToken = (segundos: number) =>
  `x.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + segundos }))}.x`;

describe('Guards de autenticación', () => {
  const ejecutar = (guard: CanActivateFn) =>
    TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

  const ruta = (resultado: unknown) => TestBed.inject(Router).serializeUrl(resultado as UrlTree);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient()],
    });
  });

  it('manda al login si no hay token', () => {
    expect(ruta(ejecutar(authGuard))).toBe('/login');
  });

  it('manda al login y limpia la sesión si el token expiró', () => {
    localStorage.setItem('token', crearToken(-60));
    expect(ruta(ejecutar(authGuard))).toBe('/login');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('deja pasar con un token vigente', () => {
    localStorage.setItem('token', crearToken(3600));
    expect(ejecutar(authGuard)).toBe(true);
  });

  it('solo deja entrar a usuarios ADMIN a las rutas de administración', () => {
    localStorage.setItem('rol', 'CAJERO');
    expect(ruta(ejecutar(adminGuard))).toBe('/inventario');

    localStorage.setItem('rol', 'ADMIN');
    expect(ejecutar(adminGuard)).toBe(true);
  });
});
