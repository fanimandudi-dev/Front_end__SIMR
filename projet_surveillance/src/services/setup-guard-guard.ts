import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './api-service'; // Vérifie bien si c'est './api-service' ou './api.service'
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const setupGuardGuard: CanActivateFn = (route, state) => {
  // On récupère nos services directement grâce à inject()
  const apiService = inject(ApiService);
  const router = inject(Router);

  // 1. Éviter la boucle infinie : si l'utilisateur va déjà vers l'onboarding
  if (state.url === '/onboarding') {
    return of(true);
  }

  // 2. Vérification du rôle
  const role = localStorage.getItem('user_role');

  // Si l'utilisateur n'est pas le Médecin Chef de Zone (MCZ), on ne le bloque pas
  if (role !== 'MCZ') {
    return of(true);
  }

  // 3. Interrogation du backend pour l'état de configuration
  return apiService.checkSystemStatus().pipe(
    map(status => {
      if (status && status.isConfigured === false) {
        console.log("🛡️ SetupGuard : La base de données est vide ! Redirection vers l'Onboarding.");

        // Redirection vers l'onboarding si pas configuré
        return router.parseUrl('/onboarding');
      }

      return true; // Tout est configuré, accès autorisé
    }),
    catchError((error) => {
      console.error("Erreur serveur détectée par le Guard :", error);
      return of(true); // En cas d'erreur serveur, on laisse passer
    })
  );
};