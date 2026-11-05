import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoogleSigninButtonModule, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { filter, switchMap } from 'rxjs';
import { LoginService } from '../services/login.service';
import { AlertasService } from '../services/alertas.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GoogleSigninButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  verPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private alertaService: AlertasService,
    private authService: SocialAuthService
  ) {
    // Credenciales de la cuenta demo precargadas para quien visite el portafolio
    this.loginForm = this.fb.group({
      correo: ['demo@gmail.com', [Validators.required, Validators.email]],
      password: ['demo123', [Validators.required, Validators.minLength(6)]]
    });

    // Google nos entrega su idToken y el backend lo verifica para emitir nuestro JWT
    this.authService.authState.pipe(
      filter((usuarioGoogle: SocialUser | null): usuarioGoogle is SocialUser => !!usuarioGoogle?.idToken),
      switchMap(usuarioGoogle => this.loginService.loginGoogle(usuarioGoogle.idToken)),
      takeUntilDestroyed()
    ).subscribe({
      next: (respuesta) => this.entrar(respuesta),
      error: (error) => {
        console.error('El backend rechazó el login con Google:', error);
        this.alertaService.mostrarError('No se pudo iniciar sesión con Google');
      }
    });
  }

  iniciarSesion() {
    if (this.loginForm.invalid) {
      this.alertaService.mostrarError('Por favor, llena los campos correctamente');
      return;
    }
    this.loginService.iniciarSesion(this.loginForm.value).subscribe({
      next: (respuesta) => this.entrar(respuesta),
      error: (error) => {
        console.error('El backend rechazó el acceso:', error);
        this.alertaService.mostrarError('Credenciales incorrectas');
      }
    });
  }

  private entrar(respuesta: any) {
    const nombreUsuario = respuesta.usuario?.nombre || 'Usuario';
    this.alertaService.mostrarExito(`Bienvenido: ${nombreUsuario}`);
    this.loginService.guardarSesion(respuesta);
    this.router.navigate(['/inventario']);
  }
}
