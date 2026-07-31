import { Component, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { FormsModule, NgForm } from '@angular/forms';
import { NouveauCasPayload } from '../../models/cas_maladie';


@Component({
  selector: 'app-form-simr',
  imports: [FormsModule],
  templateUrl: './form-simr.html',
  styleUrl: './form-simr.css',
})
export class FormSimr {

  @ViewChild('casForm') casForm!: NgForm;

  isSubmitting = false;
  id_centre = Number(localStorage.getItem('user_centre_id') || 0);
  id_utilisateur = Number(localStorage.getItem('user_id') || 0);

  // Variables pour gérer l'affichage de la notification
  notification = {
    show: false,
    type: 'success', // 'success' ou 'error'
    message: ''
  };

  maladies = [
    { id: 1, nom: 'Choléra' }
  ];

  gps = {
    lat: null as number | null,
    lng: null as number | null
  };

  obtenirGPS() {

    navigator.geolocation.getCurrentPosition(
      (position) => {

        this.gps.lat = position.coords.latitude;
        this.gps.lng = position.coords.longitude;

        console.log(this.gps);

      },
      (err) => {
        console.log(err);
      }
    );

  }





  symptomesOfficiels = [
    'Diarrhée aqueuse (Eau de riz)',
    'Vomissements',
    'Déshydratation sévère',
    'Crampes musculaires',
    'Soif intense',
    'Perte d\'élasticité de la peau'
  ];

  // L'objet lié au formulaire HTML
  casData = {
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

    statutId: 1, // 1 = Suspect
    idMaladie: 1, // Choléra par défaut
    sourceSaisie: 'MANUEL',

    symptomes: [
      { type: 'OFFICIEL', valeur: '', autreValeur: '' }
    ]
  };

  constructor(private apiService: ApiService) { }

  ngOnInit() {   this.obtenirGPS();}

  ajouterSymptome() {
    this.casData.symptomes.push({ type: 'OFFICIEL', valeur: '', autreValeur: '' });
   
  }

  supprimerSymptome(index: number) {
    if (this.casData.symptomes.length > 1) {
      this.casData.symptomes.splice(index, 1);
    }
  }

  showNotification(type: 'success' | 'error', message: string) {
    this.notification = { show: true, type, message };

    // Faire disparaître la notification automatiquement après 5 secondes si c'est un succès
    if (type === 'success') {
      setTimeout(() => {
        this.notification.show = false;
      }, 5000);
    }
  }

  soumettreCas() {
    // 1. Validation : Forcer l'affichage des erreurs si l'utilisateur clique sur "Enregistrer"
    if (this.casForm.invalid) {
      // Marquer tous les champs comme touchés pour déclencher le texte rouge en dessous
      Object.keys(this.casForm.controls).forEach(key => {
        this.casForm.controls[key].markAsTouched();
      });

      this.showNotification('error', "Veuillez remplir tous les champs obligatoires (marqués d'une *) avant d'enregistrer.");
      return; // On arrête tout, on n'envoie pas à l'API
    }

    // 2. Si le formulaire est valide, on procède à l'envoi
    this.isSubmitting = true;
    this.notification.show = false;

    const listeSymptomesFinaux = this.casData.symptomes
      .map(s => s.type === 'AUTRE' ? s.autreValeur : s.valeur)
      .filter(s => s.trim() !== '');

    const payload: NouveauCasPayload = {
      patientNom: this.casData.patientNom,
      patientPrenom: this.casData.patientPrenom,
      patientPostnom: this.casData.patientPostnom,
      sexe: this.casData.sexe,
      dateNaissance: this.casData.dateNaissance ? this.casData.dateNaissance : null,
      telephone: this.casData.telephone,

      commune: this.casData.commune,
      quartier: this.casData.quartier,
      avenue: this.casData.avenue,
      numeroResidence: this.casData.numeroResidence,
      lat_gps: this.gps.lat,
      lng_gps: this.gps.lng,
      id_centre:this.id_centre,
      id_utilisateur:this.id_utilisateur,

      statutId: this.casData.statutId,
      idMaladie: this.casData.idMaladie,
      sourceSaisie: this.casData.sourceSaisie,
      symptomes: listeSymptomesFinaux.join('; ')
    };

    this.apiService.validerEtCreerCas(payload).subscribe({
      next: (response) => {
        this.showNotification('success', 'Le cas a été enregistré avec succès dans la base de données !');
        this.isSubmitting = false;
        this.resetForm();
      },
      error: (err) => {
        this.showNotification('error', "Une erreur s'est produite lors de l'enregistrement. Vérifiez votre connexion au serveur.");
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }

  resetForm() {
    this.casData = {
      patientNom: '', patientPrenom: '', patientPostnom: '', dateNaissance: '', sexe: 'M', telephone: '',
      commune: '', quartier: '', avenue: '', numeroResidence: '',
      statutId: 1, idMaladie: 1, sourceSaisie: 'MANUEL',
      symptomes: [{ type: 'OFFICIEL', valeur: '', autreValeur: '' }]
    };
    // On réinitialise aussi l'état des erreurs Angular
    if (this.casForm) {
      this.casForm.resetForm(this.casData);
    }
  }
}

