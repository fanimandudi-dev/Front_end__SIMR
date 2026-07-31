import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';



@Component({
  selector: 'app-zonz-sante',
  imports: [FormsModule,DecimalPipe],
  templateUrl: './zonz-sante.html',
  styleUrl: './zonz-sante.css',
})
export class ZonzSante { // S'il y a déjà une zone, on la stocke ici

  // Utilisation des Signals pour une réactivité instantanée
  zoneActuelle = signal<any>(null);
  isSubmitting = signal<boolean>(false);
  showModal = signal<boolean>(false);

  // Signal pour la notification
  notification = signal({ show: false, type: 'success', message: '' });

  // L'objet formulaire classique
  zoneData = {
    nom: '',
    code: '',
    province: 'Kinshasa',
    population: null as number | null
  };

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.chargerZone();
  }

  // --- NOTIFICATIONS ---
  showNotification(type: 'success' | 'error', message: string) {
    this.notification.set({ show: true, type, message });
    if (type === 'success') {
      setTimeout(() => this.notification.update(n => ({ ...n, show: false })), 5000);
    }
  }

  // --- CHARGEMENT ---
  chargerZone() {
    this.apiService.getZonesSante().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.zoneActuelle.set(data[0]);

          // Pré-remplissage du formulaire
          this.zoneData = {
            nom: data[0].nom,
            code: data[0].code,
            province: data[0].province,
            population: data[0].population
          };
        }
      },
      error: (err) => console.error("Erreur chargement zone :", err)
    });
  }

  // --- VALIDATION (MODALE) ---
  preparerSauvegarde() {
    if (!this.zoneData.nom || !this.zoneData.code) {
      this.showNotification('error', "Le nom et le code de la zone sont obligatoires.");
      return;
    }

    // Si c'est une création (pas de zone), on sauve direct
    if (!this.zoneActuelle()) {
      this.executerSauvegarde();
    } else {
      // Si c'est une modification, on ouvre le popup de confirmation
      this.showModal.set(true);
    }
  }

  annulerSauvegarde() {
    this.showModal.set(false);

    // Remettre le formulaire dans son état initial (Annuler la saisie en cours)
    const actuelle = this.zoneActuelle();
    if (actuelle) {
      this.zoneData = {
        nom: actuelle.nom,
        code: actuelle.code,
        province: actuelle.province,
        population: actuelle.population
      };
    }
  }

  // --- ENREGISTREMENT DB ---
  executerSauvegarde() {
    this.showModal.set(false);
    this.isSubmitting.set(true);
    this.notification.update(n => ({ ...n, show: false })); // Cacher les anciennes notifs

    const actuelle = this.zoneActuelle();

    if (actuelle) {
      // 🔄 MODIFICATION (PUT)
      this.apiService.modifierZoneSante(actuelle.id, this.zoneData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showNotification('success', 'La Zone de Santé a été mise à jour avec succès !');

          // Mise à jour instantanée du Signal (Le panneau de droite va changer tout de suite)
          this.zoneActuelle.update(zone => ({ ...zone, ...this.zoneData }));
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showNotification('error', "Échec de la modification. Vérifiez que l'API Python tourne.");
          console.error(err);
        }
      });
    } else {
      // 🚀 CRÉATION (POST)
      this.apiService.creerZoneSante(this.zoneData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showNotification('success', 'Zone de Santé créée avec succès !');
          this.chargerZone(); // On va relire l'ID depuis la base de données
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.showNotification('error', "Échec de la création. Le code existe peut-être déjà.");
          console.error(err);
        }
      });
    }
  }
}
