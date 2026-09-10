import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { AlertasService } from '../services/alertas.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private alertaService: AlertasService
  ) {
    this.loginForm = this.fb.group({
      correo: ['demo@gmail.com', [Validators.required, Validators.email]],
      password: ['demo123', [Validators.required, Validators.minLength(6)]]
    });
  }

  iniciarSesion() {
    if (this.loginForm.invalid) {
      alert('Por favor, llena los campos correctamente');
      return;
    }
    this.loginService.iniciarSesion(this.loginForm.value).subscribe({
      next: (respuesta) => {
        console.log('¡Respuesta del backend exitosa', respuesta);
        const nombreUsuario = respuesta.usuario.nombre || 'Usuario';
        this.alertaService.mostrarExito(`Bienvenido: ${nombreUsuario}`);
        //Guardamos el token
        localStorage.setItem('token', respuesta.token);
        //Redirigimos a inventario
        this.router.navigate(['/inventario']);
      },
      error: (error) => {
        console.error('El backend rechazó el acceso:', error);
        this.alertaService.mostrarError('Credenciales incorrectas')

      }

    })

  }

}
