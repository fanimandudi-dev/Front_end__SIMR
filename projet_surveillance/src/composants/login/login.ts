import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  credentials = { login: '', mdp: '' };

  // Remplacement par des Signals Angular
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private apiService: ApiService, private router: Router) { }

    seConnecter() {
    if (!this.credentials.login || !this.credentials.mdp) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.apiService.login(this.credentials).subscribe({
      next: (response) => {
        localStorage.setItem('user_token', response.token);
        localStorage.setItem('user_id', response.utilisateur.id.toString());
        localStorage.setItem('user_role', response.utilisateur.role);
        localStorage.setItem('user_name', response.utilisateur.login);
        localStorage.setItem('user_zone_id', response.utilisateur.id_zone.toString());
        localStorage.setItem('user_zone', response.utilisateur.zone);
        localStorage.setItem('user_centre_nom', response.utilisateur.nom_centre);
        
        if (response.utilisateur.id_centre_sante) {
          localStorage.setItem('user_centre_id', response.utilisateur.id_centre_sante.toString());
        } else {
          localStorage.removeItem('user_centre_id');
        }

        this.verifierConfiguration();
      },
      error: (err) => {
        this.isLoading.set(false);

        if (err && err.error && err.error.detail) {
          this.errorMessage.set(err.error.detail);
        } else {
          this.errorMessage.set("Identifiants incorrects ou serveur indisponible.");
        }
      }
    });
  }


  
  verifierConfiguration() {
    this.apiService.checkSystemStatus().subscribe({
      next: (status) => {
        this.isLoading.set(false);
        if (!status.isConfigured && localStorage.getItem('user_role') === 'MCZ') {
          this.router.navigate(['/onboarding']);
        } else {
          this.router.navigate(['/Menu/dashboard']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/Menu/dashboard']);
      }
    });
  }
}