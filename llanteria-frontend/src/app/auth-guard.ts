import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const platformId = inject(PLATFORM_ID);

  // Verificamos si estamos en el navegador
  if (isPlatformBrowser(platformId)) {
    
    // Si estamos en el navegador (Brave, Chrome), es seguro usar localStorage
    const token = localStorage.getItem('token');

    if (token) {
      return true; // Pásale, tienes token
    } else {
      router.navigate(['/login']);
      return false; // No tienes token, vas pal login
    }
  }
  return true;
};