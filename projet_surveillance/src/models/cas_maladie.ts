// Interface pour typer proprement l'envoi d'un nouveau cas vers l'API Python
export interface NouveauCasPayload {
    // Identité
    patientNom: string;
    patientPrenom: string;
    patientPostnom: string;
    sexe: string;
    dateNaissance: string | null; // Format YYYY-MM-DD
    telephone: string;

    // Localisation (Adresse)
    commune: string;
    quartier: string;
    avenue: string;
    numeroResidence: string;
    lat_gps?: number | null;

    lng_gps?: number | null;
    id_centre?: number | null;
    id_utilisateur?:number|null;

    // Clinique
    symptomes: string;
    statutId: number;
    idMaladie: number;
    sourceSaisie: string; // 'MANUEL' ou 'OCR_SIMR'
}

export interface Patient {
    id: number;
    nom: string;
    prenom: string;
    post_nom: string;
    sexe: string;
    date_naissance: Date;
    telephone: string;
    id_adresse: number;
}
