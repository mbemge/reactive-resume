# psup-cv-module

Module autonome de generation de CV PDF pour les candidats Parcoursup. Zero dependance au projet Reactive Resume — fonctionne comme bibliotheque interne dans n'importe quelle app Next.js/Vercel.

## Installation

### 1. Copier le module

Copier le dossier `psup-cv-module/` dans votre projet PSUP, par exemple dans `lib/cv/` :

```
lib/cv/
  index.ts
  types.ts
  schema.ts
  mapper.ts
  renderer.tsx
  templates/
    sorbonne.tsx
    haussmann.tsx
    rivoli.tsx
    marais.tsx
```

### 2. Installer les dependances

```bash
npm install @react-pdf/renderer uuid
npm install -D @types/react
```

### 3. Configurer tsconfig.json

Verifier que JSX est active et que le path alias pointe bien :

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Usage

### Generer un PDF depuis une route API

```typescript
// app/api/cv/generate/route.ts
import { mapPsupToResumeData, renderResumePdf } from "@/lib/cv";
import type { PsupCandidat } from "@/lib/cv";

export async function POST(request: Request) {
  const { candidat, voeu, template } = await request.json();

  // Mapper les donnees Parcoursup -> ResumeData
  const resumeData = mapPsupToResumeData(candidat, voeu, template);

  // Generer le PDF
  const pdfBuffer = await renderResumePdf(resumeData);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cv.pdf"`,
    },
  });
}
```

### Appel depuis le frontend

```typescript
const response = await fetch("/api/cv/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    candidat: {
      nom: "Dupont",
      prenom: "Marie",
      email: "marie.dupont@email.com",
      dateNaissance: "15/03/2006",
      adresse: { ville: "Paris", codePostal: "75005" },
      formations: [
        {
          etablissement: "Lycee Henri IV",
          ville: "Paris",
          filiere: "Terminale Generale",
          anneeDebut: "2023",
          anneeFin: "2024",
          specialites: ["Mathematiques", "Physique-Chimie"],
          options: [],
        },
      ],
      bulletins: [],
      experiences: [],
      langues: [
        { langue: "Francais", niveau: "natif", certifications: [] },
        { langue: "Anglais", niveau: "B2", certifications: ["Cambridge B2 First"] },
      ],
      competences: [{ categorie: "Informatique", items: ["Python", "HTML/CSS", "LaTeX"] }],
      activitesExtraScolaires: [
        {
          categorie: "sport",
          titre: "Tennis",
          duree: "8 ans",
          niveau: "Competition departementale",
        },
      ],
      voeux: [],
    },
    voeu: {
      id: "1",
      formation: "Licence Mathematiques",
      etablissement: "Universite Paris-Saclay",
      attendus: ["Solides bases en mathematiques", "Capacite de raisonnement"],
      criteresExamen: [],
    },
    template: "sorbonne", // ou "haussmann", "rivoli", "marais"
  }),
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
window.open(url);
```

## Templates disponibles

| Template      | Description                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `sorbonne`    | 2 colonnes (65/35), barre d'accent en haut, sidebar grise, style classique |
| `haussmann`   | 2 colonnes, sidebar couleur primaire avec texte blanc, photo circulaire    |
| `rivoli`      | 1 colonne minimaliste, headings espaces, ligne d'accent fine              |
| `marais`      | Header bandeau colore, 2 colonnes (60/40), pills competences, dots niveaux |

## Structure des donnees

### PsupCandidat

Donnees du candidat Parcoursup : identite, formations, bulletins, experiences, langues, competences, activites.

### PsupVoeu

Voeu specifique pour adapter le CV (formation visee, attendus, criteres).

### ResumeData

Structure intermediaire utilisee par les templates PDF. Generee automatiquement par `mapPsupToResumeData()`.

## Fonctions exportees

- `mapPsupToResumeData(candidat, voeu?, template?)` — Convertit les donnees PSUP en ResumeData
- `mergeParsedCvIntoResumeData(psupResume, parsedCv)` — Fusionne un CV parse (IA) dans le ResumeData PSUP
- `renderResumePdf(data)` — Genere le PDF (retourne `Promise<Uint8Array>`)
