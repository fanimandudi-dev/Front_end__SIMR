import { Routes } from '@angular/router';
import { Dashboard } from '../shared/composants/dashboard/dashboard';
import { Menu } from '../shared/composants/menu/menu';
import { Cartes } from '../composants/cartes/cartes';
import { SimrUpload } from '../shared/composants/simr-upload/simr-upload';
import { FormSimr } from '../composants/form-simr/form-simr';
import { Saisie } from '../composants/saisie/saisie';
import { ConfigZonz } from '../composants/config-zonz/config-zonz';
import { Login } from '../composants/login/login';
import { ZonzSante } from '../composants/zonz-sante/zonz-sante';
import { setupGuardGuard } from '../services/setup-guard-guard';
import { Onboard } from '../composants/onboard/onboard';
import { authGuard } from '../services/auth-guard';

export const routes: Routes = [

    { path: '', redirectTo: 'Connexion', pathMatch: 'full' },
    { path: 'Connexion', component: Login },
      { path: 'onboarding', component: Onboard},

    {
        // Le chemin vide redirige automatiquement vers le layout/dashboard
        path: 'Menu',
        component: Menu,canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard, canActivate: [setupGuardGuard] },
            { path: 'carte_surveillance', component: Cartes, canActivate: [setupGuardGuard] },
            { path: 'simr-upload', component: SimrUpload, canActivate: [setupGuardGuard] },
            { path: 'nouveau-cas', component: Saisie, canActivate: [setupGuardGuard] },
            { path: 'zone-sante', component: ZonzSante,canActivate: [setupGuardGuard] },


            // La page de choix
            { path: 'config-zone', component: ConfigZonz, canActivate: [setupGuardGuard] }, // zone de configuration de zone et aire de santé
            { path: 'form-simr', component: FormSimr, canActivate: [setupGuardGuard] },
            // La page Map que nous allons créer juste après
            // { path: 'map', component: MapComponent }

            // La page SIMR que nous créerons ensuite
            // { path: 'simr', component: SimrComponent }
        ]
    },
    {
        // Si l'utilisateur tape une URL qui n'existe pas, on le ramène à l'accueil
        path: '**',
        redirectTo: ''
    }
];
