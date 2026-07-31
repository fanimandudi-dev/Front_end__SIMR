import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('user_token');

  if (token) {
    // L'utilisateur est connecté, on le laisse passer
    return true;
  } else {
    // Pas de token -> On bloque et on redirige vers le Login
    console.warn("⛔ authGuard : Accès refusé. Redirection vers la page de connexion.");
    router.navigate(['/Connexion']);
    return false;
  }
};
