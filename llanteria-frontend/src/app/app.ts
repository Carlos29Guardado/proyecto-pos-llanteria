import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router'


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  //Variable bandera para coontrolar el menú
  menuAbierto: boolean = false;

  constructor(public router: Router){}

  title = 'llanteria-pos';

  alternarMenu(){
    this.menuAbierto = !this.menuAbierto;
  }
}