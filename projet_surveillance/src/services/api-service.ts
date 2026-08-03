// api.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, Observable, of, throwError } from 'rxjs';

// ==========================================
// INTERFACES TYPESCRIPT
// ==========================================
const API_URL: string = 'https://api-simr.onrender.com/';

export interface DashboardStats {
  nouveauxCas: number;
        clustersActifs: number;
        fichesAttente: number;
}




@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) { }

  // ==========================================
  // AUTHENTIFICATION & STATUT SYSTÈME
  // ==========================================

  login(credentials: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  checkSystemStatus(): Observable<any> {
    return this.http.get(`${API_URL}/system-status`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère les statistiques globales (Cas récents, Fiches en attente, etc.)
   */
// api.service.ts (mettre à jour la fonction getDashboardStats)
  getDashboardStats(role: string, idCentre: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/dashboard/stats?role=${role}&id_centre=${idCentre}`);
  }

    lancerAnalyseDBSCAN(): Observable<any> {
    return this.http.post<any>(`${API_URL}/admin/trigger-dbscan`, {});
  }

  /**
   * (Optionnel) Pour forcer l'exécution de DBSCAN depuis le bouton "Actualiser"
   */
  triggerDbscan(): Observable<any> {
    return this.http.post(`${API_URL}/admin/run-dbscan`, {})
      .pipe(catchError(this.handleError));
  }

  // ==========================================
  // 2. CARTOGRAPHIE (MAP LEAFLET)
  // ==========================================

  /**
   * Récupère la liste des clusters épidémiques actifs
   */
  getClustersMap(): Observable<any> {
    return this.http.get<any>(`${API_URL}/map/clusters`)
      .pipe(catchError(this.handleError));
  }

  // ==========================================
  // 3. NUMÉRISATION (OCR SIMR)
  // ==========================================

  /**
   * Envoie l'image au backend Python pour l'extraction de texte (Tesseract)
   * @param file Le fichier image sélectionné par l'utilisateur


  // ==========================================
  // 3. NUMÉRISATION (OCR SIMR)
  // ==========================================

  /**
   * Envoie l'image au backend Python pour l'extraction de texte (Tesseract)
   * @param file Le fichier image sélectionné par l'utilisateur
   */
  uploadSimrForm(file: File): Observable<any> {
    const formData = new FormData();
    // Le nom 'file' doit correspondre au paramètre attendu par FastAPI (UploadFile = File(...))
    formData.append('file', file);

    return this.http.post(`${API_URL}/simr/upload`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Enregistre un cas manuellement ou depuis le formulaire OCR validé
   */
  enregistrerNouveauCas(casData: any): Observable<any> {
    return this.http.post(`${API_URL}/cas`, casData)
      .pipe(catchError(this.handleError));
  }

  // ==========================================
  // 4. ADMINISTRATION (PYRAMIDE SANITAIRE)
  // ==========================================

  getAiresSante(zoneId?: string | null): Observable<any[]> {
    let url = `${API_URL}/admin/aires`;
    if (zoneId) {
      url += `?zone_id=${zoneId}`;
    }
    return this.http.get<any[]>(url).pipe(catchError(this.handleError));
  }

  creerAireSante(data: any): Observable<any> {
    return this.http.post(`${API_URL}/admin/aires`, data)
      .pipe(catchError(this.handleError));
  }

  modifierAireSante(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/admin/aires/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  supprimerAireSante(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/admin/aires/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Ajout pour la Zone de santé
  getZonesSante(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/admin/zones`)
      .pipe(catchError(this.handleError));
  }

  creerZoneSante(data: any): Observable<any> {
    return this.http.post(`${API_URL}/admin/zones`, data)
      .pipe(catchError(this.handleError));
  }

  modifierZoneSante(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/admin/zones/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  getCentresSante(zoneId?: string | null): Observable<any[]> {
    let url = `${API_URL}/admin/centres`;
    if (zoneId) {
      url += `?zone_id=${zoneId}`;
    }
    return this.http.get<any[]>(url).pipe(catchError(this.handleError));
  }

  creerCentreSante(data: any): Observable<any> {
    return this.http.post(`${API_URL}/admin/centres`, data)
      .pipe(catchError(this.handleError));
  }

  supprimerCentreSante(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/admin/centres/${id}`)
      .pipe(catchError(this.handleError));
  }

  getUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/admin/utilisateurs`)
      .pipe(catchError(this.handleError));
  }

  creerUtilisateur(data: any): Observable<any> {
    return this.http.post(`${API_URL}/admin/utilisateurs`, data)
      .pipe(catchError(this.handleError));
  }

  modifierUtilisateur(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/admin/utilisateurs/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  supprimerUtilisateur(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/admin/utilisateurs/${id}`)
      .pipe(catchError(this.handleError));
  }

  modifierCentreSante(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/admin/centres/${id}`, data)
      .pipe(catchError(this.handleError));
  }
  // ==========================================
  // GESTION DES ERREURS
  // ==========================================

  /**
   * Intercepte et formate les erreurs renvoyées par le serveur Python
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue est survenue.';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client (problème réseau, etc.)
      errorMessage = `Erreur réseau : ${error.error.message}`;
    } else {
      // Erreur renvoyée par FastAPI (ex: status_code=500)
      if (error.status === 0) {
        errorMessage = 'Impossible de contacter le serveur. Le Backend FastAPI est-il allumé ?';
      } else {
        errorMessage = `Le serveur a renvoyé le code ${error.status}: ${error.error.detail || error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }


  validerEtCreerCas(data: any): Observable<any> {
  

    return this.http.post(`${API_URL}/cas`, data).pipe(catchError(this.handleError));
  }

}
