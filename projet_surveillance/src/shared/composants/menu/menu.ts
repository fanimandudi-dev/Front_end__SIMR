import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

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

  constructor(private router: Router) { }

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || 'INCONNU';

    let rawName = localStorage.getItem('user_name') || 'Utilisateur';
    this.userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    this.userInitials = this.userName.charAt(0).toUpperCase();

    this.userZone = localStorage.getItem('user_zone') || 'Zone non configurée';
    this.userCentre = localStorage.getItem('user_centre_nom') || 'Aucun centre';
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  deconnexion() {
    localStorage.clear();
    this.router.navigate(['/Connexion']);
  }
}