import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('agrega el token en el header Authorization', () => {
    localStorage.setItem('token', 'abc123');
    http.get('/api/productos').subscribe();

    const req = httpMock.expectOne('/api/productos');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush({});
  });

  it('no agrega el header si no hay sesión', () => {
    http.get('/api/productos').subscribe();

    const req = httpMock.expectOne('/api/productos');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('cierra la sesión y redirige al login cuando el backend responde 401', () => {
    localStorage.setItem('token', 'expirado');
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('/api/productos').subscribe({ error: () => {} });
    httpMock.expectOne('/api/productos').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('token')).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/login']);
  });
});
