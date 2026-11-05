import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from './services/login.service';

export const authGuard: CanActivateFn = () => {
  // En el servidor no existe localStorage, la validación se hace en el navegador
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const loginService = inject(LoginService);
  if (loginService.sesionActiva()) return true;

  // Token inexistente o expirado: limpiamos y vamos al login
  loginService.cerrarSesion();
  return inject(Router).createUrlTree(['/login']);
};

// Solo los administradores pueden entrar (usar junto con authGuard)
export const adminGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  return inject(LoginService).esAdmin() ? true : inject(Router).createUrlTree(['/inventario']);
};
