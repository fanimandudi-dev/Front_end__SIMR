import { Component, computed, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ApiService } from '../../../services/api-service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {

  isMobileMenuOpen = false;

  // Informations de l'utilisateur connecté
  userRole = '';
  userName = '';
  userZone = '';
  userCentre = '';
  userInitials = 'U';
  notifications = signal<any[]>([]);
  isNotifOpen = signal<boolean>(false);

  // Calcule automatiquement le nombre de notifs non lues (le point rouge !)
  unreadCount = computed(() => this.notifications().filter(n => !n.est_lue).length);

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || 'INCONNU';

    let rawName = localStorage.getItem('user_name') || 'Utilisateur';
    this.userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    this.userInitials = this.userName.charAt(0).toUpperCase();

    this.userZone = localStorage.getItem('user_zone') || 'Zone non configurée';
    this.userCentre = localStorage.getItem('user_centre_nom') || 'Aucun centre';
    this.userRole = localStorage.getItem('user_role') || 'INCONNU';
    // ... vos autres init ...

    this.chargerNotifications();
  }




  chargerNotifications() {
    this.apiService.getNotifications(this.userRole).subscribe({
      next: (data) => this.notifications.set(data),
      error: (err) => console.error("Erreur notifs:", err)
    });
  }

  toggleNotifications() {
    this.isNotifOpen.set(!this.isNotifOpen());
  }

  marquerLue(notif: any) {
    if (notif.est_lue) return; // Déjà lue

    this.apiService.marquerNotificationLue(notif.id).subscribe(() => {
      // On met à jour la liste localement pour faire disparaître le fond coloré
      const nouvellesNotifs = this.notifications().map(n =>
        n.id === notif.id ? { ...n, est_lue: true } : n
      );
      this.notifications.set(nouvellesNotifs);
    });
  }






  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  deconnexion() {
    localStorage.clear();
    this.router.navigate(['/Connexion']);
  }
}