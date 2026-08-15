import { Routes } from '@angular/router';
import { setupGuardGuard } from '../services/setup-guard-guard';
import { authGuard } from '../services/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'Connexion', pathMatch: 'full' },
  { 
    path: 'Connexion', 
    loadComponent: () => import('../composants/login/login').then(m => m.Login) 
  },
  { 
    path: 'onboarding', 
    loadComponent: () => import('../composants/onboard/onboard').then(m => m.Onboard) 
  },

  {
    path: 'Menu',
    loadComponent: () => import('../shared/composants/menu/menu').then(m => m.Menu),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('../shared/composants/dashboard/dashboard').then(m => m.Dashboard), 
        canActivate: [setupGuardGuard] 
      },
      { 
        path: 'carte_surveillance', 
        loadComponent: () => import('../composants/cartes/cartes').then(m => m.Cartes), 
        canActivate: [setupGuardGuard] 
      },
      { 
        path: 'simr-upload', 
        loadComponent: () => import('../shared/composants/simr-upload/simr-upload').then(m => m.SimrUpload), 
        canActivate: [setupGuardGuard] 
      },
      { 
        path: 'nouveau-cas', 
        loadComponent: () => import('../composants/saisie/saisie').then(m => m.Saisie), 
        canActivate: [setupGuardGuard] 
      },
      { 
        path: 'zone-sante', 
        loadComponent: () => import('../composants/zonz-sante/zonz-sante').then(m => m.ZonzSante), 
        canActivate: [setupGuardGuard] 
      },
      { 
        path: 'config-zone', 
        loadComponent: () => import('../composants/config-zonz/config-zonz').then(m => m.ConfigZonz), 
        canActivate: [setupGuardGuard] 
      },
      { 
        path: 'form-simr', 
        loadComponent: () => import('../composants/form-simr/form-simr').then(m => m.FormSimr), 
        canActivate: [setupGuardGuard] 
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];