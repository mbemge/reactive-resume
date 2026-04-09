/**
 * Schema des donnees Parcoursup.
 * Definit la structure des candidats, voeux, bulletins, etc.
 */

// ---------------------------------------------------------------------------
// Types candidat Parcoursup
// ---------------------------------------------------------------------------

export type PsupAdresse = {
  rue?: string;
  codePostal?: string;
  ville: string;
  pays?: string;
};

export type PsupBulletinNote = {
  matiere: string;
  moyenne?: number;
  moyenneClasse?: number;
  appreciation?: string;
};

export type PsupBulletin = {
  annee: string;
  classe: string;
  trimestre: string;
  notes: PsupBulletinNote[];
  appreciationGenerale?: string;
};

export type PsupFormation = {
  etablissement: string;
  ville?: string;
  filiere: string;
  anneeDebut: string;
  anneeFin?: string;
  diplome?: string;
  mention?: string;
  specialites: string[];
  options: string[];
};

export type PsupExperience = {
  type: "stage" | "emploi" | "benevolat" | "projet" | "autre";
  titre: string;
  organisme?: string;
  lieu?: string;
  dateDebut: string;
  dateFin?: string;
  description?: string;
};

export type PsupLangue = {
  langue: string;
  niveau: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "natif";
  certifications: string[];
};

export type PsupCompetence = {
  categorie: string;
  items: string[];
};

export type PsupActiviteExtraScolaire = {
  categorie: "sport" | "art" | "association" | "engagement" | "autre";
  titre: string;
  description?: string;
  duree?: string;
  niveau?: string;
};

export type PsupVoeu = {
  id: string;
  formation: string;
  etablissement: string;
  ville?: string;
  type?: string;
  descriptif?: string;
  attendus: string[];
  criteresExamen: string[];
};

export type PsupCandidat = {
  nom: string;
  prenom: string;
  dateNaissance?: string;
  email?: string;
  telephone?: string;
  adresse?: PsupAdresse;
  photo?: string;
  formations: PsupFormation[];
  bulletins: PsupBulletin[];
  experiences: PsupExperience[];
  langues: PsupLangue[];
  competences: PsupCompetence[];
  activitesExtraScolaires: PsupActiviteExtraScolaire[];
  voeux: PsupVoeu[];
  projetMotivation?: string;
};
