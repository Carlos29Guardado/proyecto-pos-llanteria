import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';
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
    this.loginForm = this.fb.group({
      correo: ['demo@gmail.com', [Validators.required, Validators.email]],
      password: ['demo123', [Validators.required, Validators.minLength(6)]]
    });

    // Escuchamos la respuesta de Google
    this.authService.authState.subscribe({
      next: (respuesta: any) => {
        console.log('Backend autenticó a Google con éxito', respuesta);
        const nombreUsuario = respuesta.usuario?.nombre || 'Usuario';
        this.alertaService.mostrarExito(`Bienvenido: ${nombreUsuario}`);
        localStorage.setItem('token', respuesta.token);
        this.router.navigate(['/inventario']);
      }
    })
  }
  iniciarSesion() {
    if (this.loginForm.invalid) {
      alert('Por favor, llena los campos correctamente');
      return;
    }
    this.loginService.iniciarSesion(this.loginForm.value).subscribe({
      next: (respuesta) => {
        console.log('¡Respuesta del backend exitosa', respuesta);
        const nombreUsuario = respuesta.usuario?.nombre || 'Usuario';
        this.alertaService.mostrarExito(`Bienvenido: ${nombreUsuario}`);
        localStorage.setItem('token', respuesta.token);
        this.router.navigate(['/inventario']);
      },
      error: (error) => {
        console.error('El backend rechazó el acceso:', error);
        this.alertaService.mostrarError('Credenciales incorrectas');
      }
    });
  }
}