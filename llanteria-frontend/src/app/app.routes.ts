import { Routes } from '@angular/router';
import { Inventario } from './inventario/inventario';
import { Usuarios } from './usuarios/usuarios';

export const routes: Routes = [
    { path: 'inventario', component: Inventario },
  { path: 'usuarios', component: Usuarios },
  { path: '', redirectTo: '/inventario', pathMatch: 'full' } // Ruta por defecto
];
