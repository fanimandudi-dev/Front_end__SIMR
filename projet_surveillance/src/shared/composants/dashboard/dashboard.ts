import { Component, signal } from '@angular/core';
import { ApiService } from '../../../services/api-service';


export interface DashboardStats {
  nouveauxCas?: number;
  clustersActifs?: number;
  fichesAttente?: number;
  casSoumisAujourdhui?: number;
  casSoumisSemaine?: number;
  tauxSaisieReussie?: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  userRole = '';
  userName = '';
  userCentre = '';
  idCentre = 0;
  // 🌟 NOUVEAU : Signal pour stocker les vraies notifications
  notifications = signal<any[]>([]);

  stats = signal<DashboardStats | null>(null);

  // 🌟 NOUVEAU : Variable pour gérer le bouton de chargement
  isAnalyzing = signal<boolean>(false);



  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.userRole = localStorage.getItem('user_role') || 'INCONNU';
    let rawName = localStorage.getItem('user_name') || 'Utilisateur';
    this.userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    this.userCentre = localStorage.getItem('user_centre_nom') || 'Aucun centre';
    const centreIdStr = localStorage.getItem('user_centre_id');
    this.idCentre = centreIdStr ? parseInt(centreIdStr, 10) : 0;

    this.chargerStats();
    this.chargerNotifications(); // 🌟 Appel initial
  }

  // 🌟 NOUVEAU : On isole le chargement pour pouvoir le rappeler
  chargerStats() {
    this.apiService.getDashboardStats(this.userRole, this.idCentre).subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error("Erreur chargement stats:", err)
    });
  }

  // 🌟 NOUVEAU : La fonction qui déclenche l'IA
  lancerIA() {
    this.isAnalyzing.set(true);
    this.apiService.lancerAnalyseDBSCAN().subscribe({
      next: (response) => {
        alert("✅ " + response.message); // Ou un joli Toast
        this.isAnalyzing.set(false);
        // On recharge les stats pour voir le nombre de clusters augmenter !
        this.chargerStats();
      },
      error: (err) => {
        alert("❌ Erreur lors de l'exécution de l'algorithme.");
        console.error(err);
        this.isAnalyzing.set(false);
      }
    });
  }



  // 🌟 NOUVEAU : Fonction pour charger les notifs
  chargerNotifications() {
    this.apiService.getNotifications(this.userRole).subscribe({
      next: (data) => this.notifications.set(data),
      error: (err) => console.error("Erreur chargement notifs:", err)
    });
  }




  marquerNotifLue(notif: any) {
    if (notif.est_lue) return; // Si déjà lue, on ne fait rien

    this.apiService.marquerNotificationLue(notif.id).subscribe({
      next: () => {
        // Mise à jour visuelle immédiate
        const misesAJour = this.notifications().map(n =>
          n.id === notif.id ? { ...n, est_lue: true } : n
        );
        this.notifications.set(misesAJour);
      }
    });
  }



}