import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-saisie',
  imports: [],
  templateUrl: './saisie.html',
  styleUrl: './saisie.css',
})
export class Saisie {

  constructor(private router: Router) { }

  allerVersOCR() {
    this.router.navigate(['/Menu/simr-upload']);
  }

  allerVersManuel() {
    this.router.navigate(['/Menu/form-simr']);
  }

}
