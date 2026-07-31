import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api-service';
import { NouveauCasPayload } from '../../../models/cas_maladie';

@Component({
  selector: 'app-simr-upload',
  imports: [FormsModule],
  templateUrl: './simr-upload.html',
  styleUrl: './simr-upload.css',
})
export class SimrUpload {


  etape = signal<'UPLOAD' | 'VALIDATION'>('UPLOAD');
  isUploading = signal<boolean>(false);
  imagePreview = signal<string | ArrayBuffer | null>(null);
  isSubmitting = false;

  // Variables pour la notification
  notification = { show: false, type: 'success', message: '' };

  // Les référentiels
  maladies = [{ id: 1, nom: 'Choléra' }];
  symptomesOfficiels = [
    'Diarrhée aqueuse (Eau de riz)', 'Vomissements', 'Déshydratation sévère',
    'Crampes musculaires', 'Soif intense', 'Perte d\'élasticité de la peau'
  ];

  // Le modèle complet (Exactement comme la saisie manuelle)
  ocrResult = signal({
    patientNom: '',
    patientPrenom: '',
    patientPostnom: '',
    dateNaissance: '',
    sexe: 'M',
    telephone: '',
    commune: '',
    quartier: '',
    avenue: '',
    numeroResidence: '',
    statutId: 1,
    idMaladie: 1,
    symptomes: [{ type: 'OFFICIEL', valeur: '', autreValeur: '' }],
    confiance: 0
  });

  constructor(private apiService: ApiService) { }

  // --- GESTION DES SYMPTÔMES DYNAMIQUES ---
  ajouterSymptome() {
    this.ocrResult.update(current => {
      const newSymptomes = [...current.symptomes, { type: 'OFFICIEL', valeur: '', autreValeur: '' }];
      return { ...current, symptomes: newSymptomes };
    });
  }

  supprimerSymptome(index: number) {
    this.ocrResult.update(current => {
      if (current.symptomes.length > 1) {
        const newSymptomes = [...current.symptomes];
        newSymptomes.splice(index, 1);
        return { ...current, symptomes: newSymptomes };
      }
      return current;
    });
  }

  // --- UPLOAD ---
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading.set(true);

      const reader = new FileReader();
      reader.onload = e => this.imagePreview.set(reader.result);
      reader.readAsDataURL(file);

      this.apiService.uploadSimrForm(file).subscribe({
        next: (response) => {
          console.log("Réponse de FastAPI :", response);

          // ⚠️ TEST LOGIQUE : Vérifie si le Backend renvoie le nouvel objet structuré "donnees_structurees" (Regex) 
          if (response.ocr_data.donnees_structurees) {
            // MODE REGEX (NOUVEAU BACKEND)
            const donneesPython = response.ocr_data.donnees_structurees;

            this.ocrResult.update(current => ({
              ...current,
              patientNom: donneesPython.patientNom || '',
              patientPrenom: donneesPython.patientPrenom || '',
              patientPostnom: donneesPython.patientPostnom || '',
              dateNaissance: donneesPython.age || '', // Python renvoie l'age ou la date ici
              sexe: donneesPython.sexe || 'M',
              telephone: donneesPython.telephone || '',
              commune: donneesPython.commune || '',
              quartier: donneesPython.quartier || '',
              avenue: donneesPython.avenue || '',
              confiance: response.ocr_data.confiance_moyenne
            }));
          } else {
            // Plan B (Ancien Backend)
            this.parserTexteExtrait(response.ocr_data.texte_extrait);
            this.ocrResult.update(current => ({
              ...current,
              confiance: response.ocr_data.confiance_moyenne
            }));
          }

          this.isUploading.set(false);
          this.etape.set('VALIDATION');
        },
        error: (err) => {
          console.error("Erreur d'upload :", err);
          alert("Erreur lors de la communication avec le serveur.");
          this.isUploading.set(false);
        }
      });
    }
  }

  // L'ancien parser, conservé comme "plan B"
  parserTexteExtrait(texteBruit: string) {
    const lignes = texteBruit.split('\n');
    let newResult = { ...this.ocrResult() };
    lignes.forEach(ligne => {
      if (ligne.toLowerCase().startsWith('nom:')) newResult.patientNom = ligne.split(':')[1].trim();
      else if (ligne.toLowerCase().startsWith('prenom:')) newResult.patientPrenom = ligne.split(':')[1].trim();
      else if (ligne.toLowerCase().startsWith('age:')) newResult.dateNaissance = ligne.split(':')[1].trim(); // Bidouille pour l'age/date
      else if (ligne.toLowerCase().startsWith('commune:')) newResult.commune = ligne.split(':')[1].trim();
    });
    this.ocrResult.set(newResult);
  }

  showNotification(type: 'success' | 'error', message: string) {
    this.notification = { show: true, type, message };
    if (type === 'success') {
      setTimeout(() => this.notification.show = false, 5000);
    }
  }

  // --- VALIDATION FINALE ---
  validerFiche() {
    this.isSubmitting = true;
    const currentData = this.ocrResult();

    const listeSymptomesFinaux = currentData.symptomes
      .map((s: any) => s.type === 'AUTRE' ? s.autreValeur : s.valeur)
      .filter((s: string) => s.trim() !== '');

    const payload: NouveauCasPayload = {
      patientNom: currentData.patientNom,
      patientPrenom: currentData.patientPrenom,
      patientPostnom: currentData.patientPostnom,
      sexe: currentData.sexe,
      dateNaissance: currentData.dateNaissance ? currentData.dateNaissance : null,
      telephone: currentData.telephone,

      commune: currentData.commune,
      quartier: currentData.quartier,
      avenue: currentData.avenue,
      numeroResidence: currentData.numeroResidence,

      statutId: currentData.statutId,
      idMaladie: currentData.idMaladie,
      sourceSaisie: 'OCR_SIMR',
      symptomes: listeSymptomesFinaux.join('; ')
    };

    this.apiService.validerEtCreerCas(payload).subscribe({
      next: (response) => {
        this.showNotification('success', 'Fiche OCR validée et enregistrée en base de données !');
        this.isSubmitting = false;
        setTimeout(() => {
          this.etape.set('UPLOAD');
          this.imagePreview.set(null);
        }, 3000); // Retour à l'écran d'upload après 3 sec
      },
      error: (err) => {
        this.showNotification('error', "Erreur lors de l'enregistrement de la fiche.");
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }

  annuler() {
    this.etape.set('UPLOAD');
    this.imagePreview.set(null);
  }
}


