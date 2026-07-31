import { Component, OnInit, signal, computed } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-config-zonz',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './config-zonz.html',
  styleUrl: './config-zonz.css',
})
export class ConfigZonz implements OnInit {
  activeTab = signal<'AIRES' | 'CENTRES' | 'UTILISATEURS'>('AIRES');

  // Données
  airesSante = signal<any[]>([]);
  centresSante = signal<any[]>([]);
  utilisateurs = signal<any[]>([]);

  // La limite globale fixée pour la Zone (récupérée de la base)
  populationZone = signal<number>(0);

  // --- FILTRES DE RECHERCHE ---
  searchAire = signal('');
  searchCentre = signal('');
  searchUser = signal('');

  // --- PAGINATION ---
  currentPageAire = signal(1);
  currentPageCentre = signal(1);
  currentPageUser = signal(1);
  itemsPerPage = 3;

  // --- LOGIQUE MÉTIER : POPULATION RESTANTE (Signal calculé) ---
  populationDistribuee = computed(() => {
    return this.airesSante().reduce((total, aire) => {
      const pop = parseInt(aire.population, 10);
      return total + (isNaN(pop) ? 0 : pop);
    }, 0);
  });

  populationRestante = computed(() => {
    const reste = this.populationZone() - this.populationDistribuee();
    return reste > 0 ? reste : 0;
  });


  // ==========================================
  // DONNÉES FILTRÉES ET PAGINÉES (Computed Signals)
  // ==========================================

  // 1. Aires
  airesFiltrees = computed(() => {
    const term = this.searchAire().toLowerCase();
    return this.airesSante().filter(a => a.nom.toLowerCase().includes(term));
  });
  airesPaginees = computed(() => {
    const start = (this.currentPageAire() - 1) * this.itemsPerPage;
    return this.airesFiltrees().slice(start, start + this.itemsPerPage);
  });
  totalPagesAire = computed(() => Math.ceil(this.airesFiltrees().length / this.itemsPerPage) || 1);

  // 2. Centres
  centresFiltres = computed(() => {
    const term = this.searchCentre().toLowerCase();
    return this.centresSante().filter(c =>
      c.nom.toLowerCase().includes(term) ||
      (c.aire_nom && c.aire_nom.toLowerCase().includes(term))
    );
  });
  centresPagines = computed(() => {
    const start = (this.currentPageCentre() - 1) * this.itemsPerPage;
    return this.centresFiltres().slice(start, start + this.itemsPerPage);
  });
  totalPagesCentre = computed(() => Math.ceil(this.centresFiltres().length / this.itemsPerPage) || 1);

  // 3. Utilisateurs
  usersFiltres = computed(() => {
    const term = this.searchUser().toLowerCase();

    // ✅ MODIFICATION : On filtre pour ne garder QUE les MEDECIN et INFIRMIER
    // On exclut les MCZ de la liste affichée
    return this.utilisateurs().filter(u => {
      const isNotMCZ = u.role !== 'MCZ';
      const matchesSearch = u.login.toLowerCase().includes(term) || (u.role && u.role.toLowerCase().includes(term));

      return isNotMCZ && matchesSearch;
    });
  });
  usersPagines = computed(() => {
    const start = (this.currentPageUser() - 1) * this.itemsPerPage;
    return this.usersFiltres().slice(start, start + this.itemsPerPage);
  });
  totalPagesUser = computed(() => Math.ceil(this.usersFiltres().length / this.itemsPerPage) || 1);


  // --- ETAT DE LA VUE ---
  notification = signal({ show: false, type: 'success', message: '' });

  newAire = { id: null as number | null, nom: '', population: null as number | null };
  newCentre = { id: null as number | null, nom: '', id_aire_sante: '', type_centre: 'Centre de Santé' };

  newUser = { id: null as number | null, login: '', mdp: '', id_centre: '', role: 'MEDECIN', sexe: 'M', telephone: '' };

  isEditingCentre = false;
  isEditingUser = false;
  isSubmitting = signal<boolean>(false);

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.chargerDonnees();
  }

  showNotification(type: 'success' | 'error', message: string) {
    this.notification.set({ show: true, type, message });
    if (type === 'success') {
      setTimeout(() => this.notification.update(n => ({ ...n, show: false })), 3000);
    }
  }

  chargerDonnees() {
    const userZoneId = localStorage.getItem('user_zone_id');

    this.apiService.getZonesSante().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.populationZone.set(parseInt(data[0].population, 10) || 0);
        }
      }
    });

    this.apiService.getAiresSante(userZoneId).subscribe(data => {
      this.airesSante.set(data);
      this.currentPageAire.set(1); // Reset page à 1
    });

    this.apiService.getCentresSante(userZoneId).subscribe(data => {
      this.centresSante.set(data);
      this.currentPageCentre.set(1);
    });

    this.apiService.getUtilisateurs().subscribe(data => {
      this.utilisateurs.set(data);
      this.currentPageUser.set(1);
    });
  }

  // --- ACTIONS AIRES ---
  ajouterAire() {
    if (!this.newAire.nom) return;
    const ajout = Number(this.newAire.population) || 0;
    if (ajout > this.populationRestante()) {
      this.showNotification('error', `Impossible : dépassement de la capacité de la zone.`);
      return;
    }

    this.isSubmitting.set(true);
    const idZoneCache = localStorage.getItem('user_zone_id') || '1';
    const payloadAire = { ...this.newAire, id_zone_sante: Number(idZoneCache) };

    this.apiService.creerAireSante(payloadAire).subscribe({
      next: (nouvelleAire) => {
        this.showNotification('success', "Aire de santé créée !");
        this.airesSante.update(aires => [...aires, nouvelleAire]);
        this.newAire = { id: null, nom: '', population: null };
        this.isSubmitting.set(false);
      },
      error: () => {
        this.showNotification('error', "Erreur de création de l'aire.");
        this.isSubmitting.set(false);
      }
    });
  }

  supprimerAire(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette aire ?")) {
      this.apiService.supprimerAireSante(id).subscribe({
        next: () => {
          this.airesSante.update(aires => aires.filter(a => a.id !== id));

          // Sécurité : Si on était sur la page 2 et qu'on supprime le dernier élément, revenir page 1
          if (this.currentPageAire() > this.totalPagesAire()) {
            this.currentPageAire.set(Math.max(1, this.totalPagesAire()));
          }

          this.showNotification('success', "Aire supprimée.");
        },
        error: () => this.showNotification('error', "Impossible : des centres y sont attachés.")
      });
    }
  }

  // --- ACTIONS CENTRES ---
  editerCentre(centre: any) {
    this.isEditingCentre = true;
    this.newCentre = {
      id: centre.id,
      nom: centre.nom,
      type_centre: centre.type_centre,
      id_aire_sante: centre.id_aire_sante
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  annulerEditionCentre() {
    this.isEditingCentre = false;
    this.newCentre = { id: null, nom: '', id_aire_sante: '', type_centre: 'Centre de Santé' };
  }

  ajouterCentre() {
    if (this.newCentre.nom && this.newCentre.id_aire_sante) {
      this.isSubmitting.set(true);

      const payload = {
        nom: this.newCentre.nom,
        type_centre: this.newCentre.type_centre,
        id_aire_sante: Number(this.newCentre.id_aire_sante)
      };

      if (this.isEditingCentre && this.newCentre.id) {
        // 🔄 MODIFICATION (Route PUT existante côté Python)
        this.apiService.modifierCentreSante(this.newCentre.id, payload).subscribe({
          next: (response) => {
            this.showNotification('success', response.message || "Centre de santé mis à jour !");
            this.chargerDonnees(); // On recharge pour rafraîchir le nom de l'aire au cas où on l'a changée
            this.annulerEditionCentre();
            this.isSubmitting.set(false);
          },
          error: (err) => {
            const errorMsg = err.message || "Erreur de mise à jour du centre.";
            this.showNotification('error', errorMsg);
            this.isSubmitting.set(false);
          }
        });
      } else {
        // 🚀 CRÉATION (Route POST)
        this.apiService.creerCentreSante(payload).subscribe({
          next: (nouveauCentre) => {
            this.showNotification('success', "Centre de santé créé !");
            this.centresSante.update(centres => [...centres, nouveauCentre]);
            this.annulerEditionCentre(); // Fonctionne aussi pour reset un form vierge
            this.isSubmitting.set(false);
          },
          error: (err) => {
            const errorMsg = err.message || "Erreur de création du centre.";
            this.showNotification('error', errorMsg);
            this.isSubmitting.set(false);
          }
        });
      }
    }
  }

  supprimerCentre(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce centre de santé ?")) {
      this.apiService.supprimerCentreSante(id).subscribe({
        next: (response) => {
          // L'API Python renvoie un "message" dans son dictionnaire JSON.
          // Ce message explique s'il a été supprimé ou juste désactivé (Soft-Delete)
          this.showNotification('success', response.message || "Centre supprimé avec succès.");

          // On retire visuellement le centre du tableau car il est désormais supprimé OU inactif
          this.centresSante.update(centres => centres.filter(c => c.id !== id));

          // Gestion de la pagination (si on supprime le dernier élément de la page)
          if (this.currentPageCentre() > this.totalPagesCentre()) {
            this.currentPageCentre.set(Math.max(1, this.totalPagesCentre()));
          }
        },
        error: (err) => {
          // On essaie de récupérer le message d'erreur précis renvoyé par HTTPException de Python
          // (ex: "Impossible de supprimer : Ce centre possède déjà des cas...")
          const errorMessage = "Impossible de supprimer ce centre de santé, Il contient de medecin ou de cas";
          this.showNotification('error', errorMessage);
        }
      });
    }
  }


  // --- ACTIONS UTILISATEURS ---
  ajouterUtilisateur() {
    const isMdpValide = this.isEditingUser ? true : !!this.newUser.mdp;

    if (this.newUser.login && isMdpValide) {
      this.isSubmitting.set(true);

      // 🟢 PREPARATION DU PAYLOAD CONFORME AUX ATTENTES DU BACKEND
      const payloadUser = {
        id: this.newUser.id,
        login: this.newUser.login,
        nom: this.newUser.login, // On duplique dans 'nom' car le modèle l'attendait
        mdp: this.newUser.mdp,
        role: this.newUser.role,
        sexe: this.newUser.sexe,
        telephone: this.newUser.telephone,
        // Si MCZ -> pas de centre (null), sinon on convertit explicitement en entier
        id_centre: this.newUser.role === 'MCZ' ? null : (this.newUser.id_centre ? Number(this.newUser.id_centre) : null)
      };

      // Sécurité Front : Un utilisateur autre que MCZ doit impérativement avoir sélectionné un centre
      if (this.newUser.role !== 'MCZ' && !payloadUser.id_centre) {
        this.showNotification('error', "Veuillez sélectionner un centre d'affectation.");
        this.isSubmitting.set(false);
        return;
      }

      if (this.isEditingUser && this.newUser.id) {
        // 🔄 MODIFICATION
        this.apiService.modifierUtilisateur(this.newUser.id, payloadUser).subscribe({
          next: () => {
            this.showNotification('success', "Compte mis à jour avec succès !");
            this.chargerDonnees();
            this.annulerEditionUtilisateur();
            this.isSubmitting.set(false);
          },
          error: () => {
            this.showNotification('error', "Erreur lors de la modification du compte.");
            this.isSubmitting.set(false);
          }
        });
      } else {
        // 🚀 CRÉATION
        this.apiService.creerUtilisateur(payloadUser).subscribe({
          next: () => {
            this.showNotification('success', "Compte médical créé en base de données !");
            this.chargerDonnees();
            this.annulerEditionUtilisateur();
            this.isSubmitting.set(false);
          },
          error: () => {
            this.showNotification('error', "Erreur lors de la création du compte.");
            this.isSubmitting.set(false);
          }
        });
      }
    } else {
      this.showNotification('error', "Veuillez remplir tous les champs obligatoires du compte.");
    }
  }

  editerUtilisateur(user: any) {
    this.isEditingUser = true;
    this.newUser = {
      id: user.id,
      login: user.login,
      mdp: '',
      id_centre: user.id_centre?.toString() || '', // On force la conversion en string pour le select
      role: user.role === 'MCZ' ? 'MCZ' : (user.role === 'MEDECIN' ? 'MEDECIN' : 'INFIRMIER'),
      sexe: user.sexe || 'M',
      telephone: user.telephone || ''
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  annulerEditionUtilisateur() {
    this.isEditingUser = false;
    this.newUser = { id: null, login: '', mdp: '', id_centre: '', role: 'MEDECIN', sexe: 'M', telephone: '' };
  }

  supprimerUtilisateur(id: number) {
    if (confirm("Êtes-vous sûr de vouloir désactiver ce compte médical ?")) {
      this.apiService.supprimerUtilisateur(id).subscribe({
        next: () => {
          // 1. On filtre la liste locale pour retirer l'utilisateur désactivé
          this.utilisateurs.update(users => users.filter(u => u.id !== id));

          // 2. Ajustement de la pagination si on supprime le dernier élément de la page actuelle
          // On attend un micro-task pour s'assurer que les computeds (comme totalPagesUser) se sont mis à jour
          setTimeout(() => {
            if (this.currentPageUser() > this.totalPagesUser()) {
              this.currentPageUser.set(Math.max(1, this.totalPagesUser()));
            }
          }, 0);

          this.showNotification('success', "Compte médical désactivé avec succès.");
        },
        error: (err) => {
          // 3. Gestion dynamique du message d'erreur selon la réponse du serveur
          if (err.status === 404) {
            this.showNotification('error', "Ce compte est introuvable ou a déjà été désactivé.");
          } else {
            this.showNotification('error', "Une erreur est survenue lors de la désactivation du compte.");
          }
        }
      });
    }
  }
}