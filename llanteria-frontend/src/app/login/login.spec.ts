import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NEVER, of, Subject, throwError } from 'rxjs';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { AlertasService } from '../services/alertas.service';
import { LoginService } from '../services/login.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const authState = new Subject<SocialUser | null>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: SocialAuthService, useValue: { authState, initState: NEVER } }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('permite reintentar el login con Google después de un error', () => {
    const loginService = TestBed.inject(LoginService);
    const alertas = TestBed.inject(AlertasService);
    const mostrarError = vi.spyOn(alertas, 'mostrarError').mockImplementation(() => {});
    vi.spyOn(alertas, 'mostrarExito').mockImplementation(() => {});
    const guardarSesion = vi.spyOn(loginService, 'guardarSesion').mockImplementation(() => {});
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    vi.spyOn(loginService, 'loginGoogle')
      .mockReturnValueOnce(throwError(() => new Error('rechazado')))
      .mockReturnValueOnce(of({ token: 'abc', usuario: { nombre: 'Ana', rol: 'CAJERO' } }));

    const usuarioGoogle = { idToken: 'token-google' } as SocialUser;
    authState.next(usuarioGoogle);
    expect(mostrarError).toHaveBeenCalledWith('No se pudo iniciar sesión con Google');
    expect(guardarSesion).not.toHaveBeenCalled();

    authState.next(usuarioGoogle);
    expect(guardarSesion).toHaveBeenCalledTimes(1);
    expect(navegar).toHaveBeenCalledWith(['/inventario']);
  });
});
