import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router'
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  //Variable bandera para controlar el menú
  menuAbierto: boolean = false;

  constructor(
    public router: Router,
    private loginService: LoginService,
    private socialAuthService: SocialAuthService
  ){}

  title = 'llanteria-pos';

  get esAdmin(): boolean {
    return this.loginService.esAdmin();
  }

  alternarMenu(){
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion(){
    this.loginService.cerrarSesion();
    // Si entró con Google también cerramos esa sesión (falla si no la había, por eso se ignora)
    this.socialAuthService.signOut().catch(() => {});

    this.router.navigate(['/login']);
  }

}
