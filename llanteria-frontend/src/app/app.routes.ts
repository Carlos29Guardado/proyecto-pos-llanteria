import { Routes } from '@angular/router';
import { InventarioComponent } from './inventario/inventario.component';
import { Usuarios } from './usuarios/usuario.component';
import { VentasComponent } from './ventas/ventas.component';
import { ClienteComponent} from './clientes/clientes.component';

export const routes: Routes = [
  { path: 'inventario', component: InventarioComponent },
  { path: 'usuarios', component: Usuarios },
  { path: 'clientes', component: ClienteComponent},
  {path: 'ventas', component: VentasComponent},
  { path: '', redirectTo: '/inventario', pathMatch: 'full' } // Ruta por defecto
];
