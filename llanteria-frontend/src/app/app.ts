import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router'
import { InventarioComponent } from './inventario/inventario.component'; 

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

  title = 'llanteria-pos';

  alternarMenu(){
    this.menuAbierto = !this.menuAbierto;
  }
}