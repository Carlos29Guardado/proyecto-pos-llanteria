import { Routes } from '@angular/router';
import { InventarioComponent } from './inventario/inventario.component';
import { Usuarios } from './usuarios/usuario.component';
import { VentasComponent } from './ventas/ventas.component';
import { ClienteComponent} from './clientes/clientes.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  { path: 'inventario', component: InventarioComponent, canActivate: [authGuard] },
  { path: 'usuarios', component: Usuarios,canActivate: [authGuard] },
  { path: 'clientes', component: ClienteComponent, canActivate: [authGuard]},
  {path: 'ventas', component: VentasComponent, canActivate: [authGuard]},
  {path: 'login', component: LoginComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' } // Ruta por defecto
];
