import type { ResumeData } from "@/schema/resume/data";

import type {
  PsupActiviteExtraScolaire,
  PsupCandidat,
  PsupCompetence,
  PsupExperience,
  PsupFormation,
  PsupLangue,
  PsupVoeu,
} from "./schema";

import { defaultResumeData } from "@/schema/resume/data";
import { generateId } from "@/utils/string";

const NIVEAU_MAP: Record<string, { fluency: string; level: number }> = {
  natif: { fluency: "Langue maternelle", level: 5 },
  C2: { fluency: "Maitrise (C2)", level: 5 },
  C1: { fluency: "Avance (C1)", level: 4 },
  B2: { fluency: "Intermediaire avance (B2)", level: 3 },
  B1: { fluency: "Intermediaire (B1)", level: 2 },
  A2: { fluency: "Elementaire (A2)", level: 1 },
  A1: { fluency: "Decouverte (A1)", level: 1 },
};

const EXPERIENCE_TYPE_LABELS: Record<string, string> = {
  stage: "Stage",
  emploi: "Emploi",
  benevolat: "Benevolat",
  projet: "Projet",
  autre: "Experience",
};

function mapFormation(formation: PsupFormation) {
  const parts: string[] = [];
  if (formation.specialites.length > 0) {
    parts.push(`Specialites : ${formation.specialites.join(", ")}`);
  }
  if (formation.options.length > 0) {
    parts.push(`Options : ${formation.options.join(", ")}`);
  }
  if (formation.mention) {
    parts.push(`Mention : ${formation.mention}`);
  }

  return {
    id: generateId(),
    hidden: false,
    school: formation.etablissement,
    degree: formation.diplome ?? formation.filiere,
    area: formation.filiere,
    grade: formation.mention ?? "",
    location: formation.ville ?? "",
    period: formation.anneeFin
      ? `${formation.anneeDebut} - ${formation.anneeFin}`
      : `${formation.anneeDebut} - Present`,
    website: { url: "", label: "" },
    description: parts.length > 0 ? `<p>${parts.join("</p><p>")}</p>` : "",
  };
}

function mapExperience(exp: PsupExperience) {
  return {
    id: generateId(),
    hidden: false,
    company: exp.organisme ?? EXPERIENCE_TYPE_LABELS[exp.type] ?? "Experience",
    position: exp.titre,
    location: exp.lieu ?? "",
    period: exp.dateFin ? `${exp.dateDebut} - ${exp.dateFin}` : exp.dateDebut,
    website: { url: "", label: "" },
    description: exp.description ? `<p>${exp.description}</p>` : "",
    roles: [],
  };
}

function mapLangue(langue: PsupLangue) {
  const mapped = NIVEAU_MAP[langue.niveau] ?? { fluency: langue.niveau, level: 2 };
  const certInfo =
    langue.certifications.length > 0 ? ` (${langue.certifications.join(", ")})` : "";

  return {
    id: generateId(),
    hidden: false,
    language: langue.langue,
    fluency: `${mapped.fluency}${certInfo}`,
    level: mapped.level,
  };
}

function mapCompetences(competences: PsupCompetence[]) {
  return competences.map((comp) => ({
    id: generateId(),
    hidden: false,
    icon: "",
    name: comp.categorie,
    proficiency: "",
    level: 0,
    keywords: comp.items,
  }));
}

function mapActivitesAsInterests(activites: PsupActiviteExtraScolaire[]) {
  return activites.map((act) => ({
    id: generateId(),
    hidden: false,
    icon: "",
    name: act.titre,
    keywords: [act.categorie, act.niveau, act.duree].filter(Boolean) as string[],
  }));
}

function buildMotivationCustomSection(voeu: PsupVoeu, motivation?: string) {
  if (!motivation && voeu.attendus.length === 0) return null;

  const items: string[] = [];
  if (motivation) items.push(motivation);
  if (voeu.attendus.length > 0) {
    items.push(
      `<strong>Attendus de la formation :</strong><ul>${voeu.attendus.map((a) => `<li>${a}</li>`).join("")}</ul>`,
    );
  }

  return {
    id: generateId(),
    type: "summary" as const,
    title: "Projet de formation motive",
    columns: 1,
    hidden: false,
    items: [
      {
        id: generateId(),
        hidden: false,
        content: items.join(""),
      },
    ],
  };
}

function buildActivitesCustomSection(activites: PsupActiviteExtraScolaire[]) {
  if (activites.length === 0) return null;

  return {
    id: generateId(),
    type: "experience" as const,
    title: "Activites extra-scolaires",
    columns: 1,
    hidden: false,
    items: activites.map((act) => ({
      id: generateId(),
      hidden: false,
      company: act.categorie.charAt(0).toUpperCase() + act.categorie.slice(1),
      position: act.titre,
      location: "",
      period: act.duree ?? "",
      website: { url: "", label: "" },
      description: act.description ? `<p>${act.description}</p>` : "",
      roles: [],
    })),
  };
}

/**
 * Convertit les donnees d'un candidat Parcoursup en ResumeData
 * compatible avec Reactive Resume.
 *
 * @param candidat - Fiche candidat Parcoursup
 * @param voeu - Voeu specifique pour lequel adapter le CV (optionnel)
 * @param template - Template a utiliser (defaut: "sorbonne")
 */
export function mapPsupToResumeData(
  candidat: PsupCandidat,
  voeu?: PsupVoeu,
  template?: string,
): ResumeData {
  const location = candidat.adresse
    ? `${candidat.adresse.ville}${candidat.adresse.codePostal ? ` (${candidat.adresse.codePostal})` : ""}`
    : "";

  const headline = voeu
    ? `Candidat(e) - ${voeu.formation}`
    : candidat.formations[0]
      ? `Eleve en ${candidat.formations[0].filiere}`
      : "";

  const customSections: ResumeData["customSections"] = [];

  // Section motivation (si voeu specifique)
  if (voeu) {
    const motivSection = buildMotivationCustomSection(voeu, candidat.projetMotivation);
    if (motivSection) customSections.push(motivSection);
  }

  // Section activites extra-scolaires
  const activitesSection = buildActivitesCustomSection(candidat.activitesExtraScolaires);
  if (activitesSection) customSections.push(activitesSection);

  const customSectionIds = customSections.map((s) => s.id);

  return {
    picture: {
      ...defaultResumeData.picture,
      url: candidat.photo ?? "",
      hidden: !candidat.photo,
    },
    basics: {
      name: `${candidat.prenom} ${candidat.nom}`,
      headline,
      email: candidat.email ?? "",
      phone: candidat.telephone ?? "",
      location,
      website: { url: "", label: "" },
      customFields: candidat.dateNaissance
        ? [{ id: generateId(), icon: "calendar", text: `Ne(e) le ${candidat.dateNaissance}`, link: "" }]
        : [],
    },
    summary: {
      title: "Profil",
      columns: 1,
      hidden: !candidat.projetMotivation && !voeu,
      content: candidat.projetMotivation
        ? `<p>${candidat.projetMotivation}</p>`
        : voeu
          ? `<p>Candidat(e) motive(e) pour integrer ${voeu.formation} a ${voeu.etablissement}.</p>`
          : "",
    },
    sections: {
      profiles: { title: "Profils", columns: 1, hidden: true, items: [] },
      experience: {
        title: "Experiences",
        columns: 1,
        hidden: candidat.experiences.length === 0,
        items: candidat.experiences.map(mapExperience),
      },
      education: {
        title: "Formation",
        columns: 1,
        hidden: candidat.formations.length === 0,
        items: candidat.formations.map(mapFormation),
      },
      projects: { title: "Projets", columns: 1, hidden: true, items: [] },
      skills: {
        title: "Competences",
        columns: 2,
        hidden: candidat.competences.length === 0,
        items: mapCompetences(candidat.competences),
      },
      languages: {
        title: "Langues",
        columns: 2,
        hidden: candidat.langues.length === 0,
        items: candidat.langues.map(mapLangue),
      },
      interests: {
        title: "Centres d'interet",
        columns: 2,
        hidden: candidat.activitesExtraScolaires.length === 0,
        items: mapActivitesAsInterests(candidat.activitesExtraScolaires),
      },
      awards: { title: "Distinctions", columns: 1, hidden: true, items: [] },
      certifications: { title: "Certifications", columns: 1, hidden: true, items: [] },
      publications: { title: "Publications", columns: 1, hidden: true, items: [] },
      volunteer: { title: "Benevolat", columns: 1, hidden: true, items: [] },
      references: { title: "References", columns: 1, hidden: true, items: [] },
    },
    customSections,
    metadata: {
      ...defaultResumeData.metadata,
      template: (template as ResumeData["metadata"]["template"]) ?? "onyx",
      layout: {
        sidebarWidth: 35,
        pages: [
          {
            fullWidth: false,
            main: [
              "summary",
              "education",
              "experience",
              ...customSectionIds,
            ],
            sidebar: ["skills", "languages", "interests"],
          },
        ],
      },
      page: {
        ...defaultResumeData.metadata.page,
        locale: "fr-FR",
        format: "a4",
      },
      design: {
        colors: {
          primary: "rgba(30, 58, 138, 1)",
          text: "rgba(0, 0, 0, 1)",
          background: "rgba(255, 255, 255, 1)",
        },
        level: {
          icon: "star",
          type: "circle",
        },
      },
      typography: {
        body: {
          fontFamily: "Inter",
          fontWeights: ["400"],
          fontSize: 10,
          lineHeight: 1.4,
        },
        heading: {
          fontFamily: "Inter",
          fontWeights: ["600"],
          fontSize: 13,
          lineHeight: 1.3,
        },
      },
      notes: "",
    },
  };
}
