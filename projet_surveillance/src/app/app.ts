import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menu } from '../shared/composants/menu/menu';
import { SimrUpload } from "../shared/composants/simr-upload/simr-upload";
import { Dashboard } from "../shared/composants/dashboard/dashboard";
import { Cartes } from '../composants/cartes/cartes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('projet_surveillance');
}
