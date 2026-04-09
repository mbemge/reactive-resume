import z from "zod";

/**
 * Schema Zod pour les donnees d'un candidat Parcoursup.
 *
 * Represente les informations qu'on peut extraire d'une fiche candidat
 * sur Parcoursup ou depuis un systeme Psup interne.
 */

export const psupAdresseSchema = z.object({
  rue: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string(),
  pays: z.string().default("France"),
});

export const psupBulletinNoteSchema = z.object({
  matiere: z.string(),
  moyenne: z.number().optional(),
  moyenneClasse: z.number().optional(),
  appreciation: z.string().optional(),
});

export const psupBulletinSchema = z.object({
  annee: z.string(),
  classe: z.string(),
  trimestre: z.string(),
  notes: z.array(psupBulletinNoteSchema),
  appreciationGenerale: z.string().optional(),
});

export const psupFormationSchema = z.object({
  etablissement: z.string(),
  ville: z.string().optional(),
  filiere: z.string(),
  anneeDebut: z.string(),
  anneeFin: z.string().optional(),
  diplome: z.string().optional(),
  mention: z.string().optional(),
  specialites: z.array(z.string()).default([]),
  options: z.array(z.string()).default([]),
});

export const psupExperienceSchema = z.object({
  type: z.enum(["stage", "emploi", "benevolat", "projet", "autre"]),
  titre: z.string(),
  organisme: z.string().optional(),
  lieu: z.string().optional(),
  dateDebut: z.string(),
  dateFin: z.string().optional(),
  description: z.string().optional(),
});

export const psupLangueSchema = z.object({
  langue: z.string(),
  niveau: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "natif"]),
  certifications: z.array(z.string()).default([]),
});

export const psupCompetenceSchema = z.object({
  categorie: z.string(),
  items: z.array(z.string()),
});

export const psupActiviteExtraScolaireSchema = z.object({
  categorie: z.enum(["sport", "art", "association", "engagement", "autre"]),
  titre: z.string(),
  description: z.string().optional(),
  duree: z.string().optional(),
  niveau: z.string().optional(),
});

export const psupVoeuSchema = z.object({
  id: z.string(),
  formation: z.string(),
  etablissement: z.string(),
  ville: z.string().optional(),
  type: z.string().optional(),
  descriptif: z.string().optional(),
  attendus: z.array(z.string()).default([]),
  criteresExamen: z.array(z.string()).default([]),
});

export const psupCandidatSchema = z.object({
  // Identite
  nom: z.string(),
  prenom: z.string(),
  dateNaissance: z.string().optional(),
  email: z.string().optional(),
  telephone: z.string().optional(),
  adresse: psupAdresseSchema.optional(),
  photo: z.string().optional(),

  // Parcours scolaire
  formations: z.array(psupFormationSchema).default([]),
  bulletins: z.array(psupBulletinSchema).default([]),

  // Experiences
  experiences: z.array(psupExperienceSchema).default([]),

  // Competences et langues
  langues: z.array(psupLangueSchema).default([]),
  competences: z.array(psupCompetenceSchema).default([]),

  // Activites extra-scolaires
  activitesExtraScolaires: z.array(psupActiviteExtraScolaireSchema).default([]),

  // Parcoursup
  voeux: z.array(psupVoeuSchema).default([]),

  // Texte libre / lettre de motivation generique
  projetMotivation: z.string().optional(),
});

export type PsupCandidat = z.infer<typeof psupCandidatSchema>;
export type PsupVoeu = z.infer<typeof psupVoeuSchema>;
export type PsupFormation = z.infer<typeof psupFormationSchema>;
export type PsupExperience = z.infer<typeof psupExperienceSchema>;
export type PsupLangue = z.infer<typeof psupLangueSchema>;
export type PsupCompetence = z.infer<typeof psupCompetenceSchema>;
export type PsupActiviteExtraScolaire = z.infer<typeof psupActiviteExtraScolaireSchema>;
