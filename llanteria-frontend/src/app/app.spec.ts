import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { AppComponent } from './app';

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(),
        { provide: SocialAuthService, useValue: { signOut: () => Promise.resolve() } },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('oculta el enlace de Usuarios a quien no es ADMIN', async () => {
    localStorage.setItem('rol', 'CAJERO');
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const enlaces = (fixture.nativeElement as HTMLElement).querySelectorAll('.menu-links a');
    expect(Array.from(enlaces).map(a => a.textContent?.trim())).not.toContain('Usuarios');
  });

  it('cerrarSesion borra el token', () => {
    localStorage.setItem('token', 'abc');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.cerrarSesion();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
