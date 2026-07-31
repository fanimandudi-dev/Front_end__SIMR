import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api-service';

@Component({
  selector: 'app-onboard',
  standalone: true,
  imports: [FormsModule], // Si tu utilises *ngIf dans ton HTML, ajoute CommonModule ici
  templateUrl: './onboard.html',
  styleUrl: './onboard.css',
})
export class Onboard implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Signaux réactifs pour piloter l'interface en temps réel
  step = signal<number>(1);
  isSubmitting = signal<boolean>(false);

  // Objet de données classique pour ton formulaire
  zoneData = {
    nom: '',
    code: '',
    province: 'Kinshasa',
    population: null as number | null
  };

  ngOnInit() { }

  // Générateur automatique de Code
  genererCode() {
    if (this.zoneData.nom) {
      const prefix = this.zoneData.nom.substring(0, 3).toUpperCase();
      const randomNum = Math.floor(100 + Math.random() * 900);
      this.zoneData.code = `ZS-${prefix}-${randomNum}`;
    }
  }

  passerEtape2() {
    this.step.set(2); // Met à jour l'étape à 2
  }

  creerZone() {
    if (!this.zoneData.nom || !this.zoneData.code) {
      alert("Le nom et le code de la zone sont obligatoires.");
      return;
    }

    this.isSubmitting.set(true);

    this.apiService.creerZoneSante(this.zoneData).subscribe({
      next: (response) => {
        console.log("Zone créée avec succès !", response);
        this.isSubmitting.set(false);
        this.step.set(3); // Passage instantané à l'étape 3 !
      },
      error: (err) => {
        console.error("Détails de l'erreur :", err);
        alert("Erreur lors de la création de la zone.");
        this.isSubmitting.set(false);
      }
    });
  }

  terminerOnboarding() {
    this.router.navigate(['/Menu/dashboard']);
  }
}