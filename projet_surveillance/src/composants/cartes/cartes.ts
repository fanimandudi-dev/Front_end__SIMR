import { AfterViewInit, Component, OnInit, signal } from '@angular/core';
import * as L from 'leaflet';


// Fix pour les icônes Leaflet sous Angular/Webpack/Esbuild
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;
import { ApiService } from '../../services/api-service';

@Component({
  selector: 'app-cartes',
  imports: [],
  templateUrl: './cartes.html',
  styleUrl: './cartes.css',
})
export class Cartes implements OnInit, AfterViewInit {

  private map!: L.Map;

  // Utilisation des Signals Angular 17+
  isLoading = signal<boolean>(true);
  isAnalyzing = signal<boolean>(false);
  nbClusters = signal<number>(0);
  nbCasIsoles = signal<number>(0);

  // Tableaux de données
  clustersReels: any[] = [];
  bruitReel: any[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    // 1. Initialiser la carte vide
    this.initMap();

    // 2. Charger les vraies données depuis Python
    this.chargerDonneesCartographiques();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-4.3224, 15.3070],
      zoom: 12
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors SIMR'
    }).addTo(this.map);

    // FIX : Force la carte à prendre la bonne taille dès qu'elle est prête
    setTimeout(() => {
      this.map.invalidateSize();
    }, 500);
  }

  private chargerDonneesCartographiques() {
    this.isLoading.set(true);

    this.apiService.getClustersMap().subscribe(
      (data: any) => {
        // Log pour s'assurer que les données arrivent bien du backend !
        console.log("DONNÉES REÇUES DE PYTHON :", data);

        if (data) {
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

          this.clustersReels = parsedData.clusters || [];
          this.bruitReel = parsedData.bruit || [];

          this.nbClusters.set(this.clustersReels.length);
          this.nbCasIsoles.set(this.bruitReel.length);

          this.dessinerElements();
        }

        this.isLoading.set(false);
      },
      (err) => {
        console.error("Erreur API getClustersMap :", err);
        this.isLoading.set(false);
      }
    );

    console.log("Clusters réels :", this.clustersReels);
    console.log("Bruit réel :", this.bruitReel);
    console.log("Nombre de clusters :", this.nbClusters());
    console.log("Nombre de cas isolés :", this.nbCasIsoles());

  }

  lancerIA() {
    this.isAnalyzing.set(true);
    this.apiService.triggerDbscan().subscribe(
      (res) => {
        this.chargerDonneesCartographiques();
        this.isAnalyzing.set(false);
      },
      (err) => {
        console.error("Erreur lors du DBSCAN", err);
        this.isAnalyzing.set(false);
      }
    );
  }

  private dessinerElements(): void {
    // Nettoyer la carte avant de redessiner (FIX : layer typé avec L.Layer)
    this.map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Circle || layer instanceof L.CircleMarker) {
        this.map.removeLayer(layer);
      }
    });

    // 1. Dessiner les CLUSTERS
    this.clustersReels.forEach(cluster => {
      const color = (cluster.statut === 'Nouveau Cluster') ? '#ef4444' : '#f59e0b';

      const circle = L.circle([cluster.lat, cluster.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.4,
        radius: cluster.rayon
      }).addTo(this.map);

      circle.bindPopup(`
        <div style="font-family: sans-serif; font-size: 14px;">
          <b style="color: #0f172a; font-size: 16px;">Foyer Épidémique</b><br><br>
          <span style="color: #64748b;">Statut :</span> <span style="font-weight: bold; color: ${color};">${cluster.statut}</span><br>
          <span style="color: #64748b;">Cas détectés :</span> <b>${cluster.cas}</b><br>
          <span style="color: #64748b;">Rayon IA :</span> ${cluster.rayon} mètres
        </div>
      `);
    });

    // 2. Dessiner le BRUIT SPATIAL
    this.bruitReel.forEach(cas => {
      L.circleMarker([cas.lat, cas.lng], {
        radius: 5,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.9,
        weight: 1
      }).addTo(this.map).bindPopup("<b>Cas isolé</b><br><span style='color: #64748b;'>Ignoré par DBSCAN (Bruit)</span>");
    });
  }
}