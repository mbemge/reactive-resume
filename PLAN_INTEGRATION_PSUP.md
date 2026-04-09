# Plan d'integration Reactive Resume dans PSUP

## Vue d'ensemble

- **PSUP** : deploye sur Vercel (frontend + API routes)
- **Reactive Resume** : deploye sur Hetzner via Coolify (microservice CV)
- Communication : PSUP appelle Reactive Resume via HTTPS + API key

---

## Architecture cible

```
┌─ VERCEL ─────────────────────────────────────────────┐
│                    APP PSUP                           │
│                                                       │
│  Frontend (React/Next.js)                             │
│  ├── Fiche candidat                                   │
│  │   ├── Onglet Infos                                 │
│  │   ├── Onglet Voeux                                 │
│  │   ├── Onglet Bulletins                             │
│  │   └── Onglet CV  ◄──── NOUVEAU                    │
│  │        ├── Upload CV etudiant (PDF/DOCX)           │
│  │        ├── Bouton "Generer CV" (par voeu)          │
│  │        ├── Preview PDF inline                      │
│  │        ├── Bouton "Modifier" → editeur RR          │
│  │        └── Liste des CVs generes                   │
│  │                                                    │
│  API Routes Vercel (/api/cv/*)                        │
│  └── Proxy vers Reactive Resume                       │
│       ├── POST /api/cv/parse     → RR /psup/parse-cv │
│       ├── POST /api/cv/generate  → RR /psup/generate │
│       └── POST /api/cv/batch     → RR /psup/batch    │
└──────────────────┬────────────────────────────────────┘
                   │ HTTPS + x-api-key header
                   │
┌─ HETZNER/COOLIFY ┼──────────────────────────────────────┐
│                   ▼                                      │
│  REACTIVE RESUME (Docker Compose)                        │
│  https://cv.votredomaine.com                             │
│                                                          │
│  API :                                                   │
│  ├── POST /api/rpc/psup/parse-cv                         │
│  ├── POST /api/rpc/psup/generate   → cree CV + PDF      │
│  ├── POST /api/rpc/psup/generate-batch                   │
│  ├── POST /api/rpc/psup/preview                          │
│  ├── GET  /api/rpc/resumes/{id}/pdf                      │
│  └── Editeur drag & drop : /builder/{resumeId}           │
│                                                          │
│  Services Docker :                                       │
│  ├── app (Node.js, port 3000)                            │
│  ├── postgres (PostgreSQL 16)                            │
│  ├── browserless (Chrome headless, generation PDF)       │
│  └── seaweedfs (stockage S3 local)                       │
└──────────────────────────────────────────────────────────┘
```

**Pourquoi un proxy dans PSUP ?**
- L'API key Reactive Resume reste cote serveur (jamais exposee au client)
- Le frontend PSUP appelle `/api/cv/*` (meme domaine, pas de CORS)
- Le proxy Vercel forward vers Hetzner avec le header `x-api-key`

---

## Phase 1 — Deploy Reactive Resume sur Hetzner (1-2 jours)

**Objectif** : Microservice CV operationnel

- [ ] Dans Coolify > Add Resource > Docker Compose
  - Source : GitHub `mbemge/reactive-resume`
  - Branche : `claude/analyze-cv-generator-FR3xe`
  - Compose file : `compose.coolify.yml`
- [ ] Variables d'environnement Coolify :

  | Variable | Valeur |
  |----------|--------|
  | `APP_URL` | `https://cv.votredomaine.com` |
  | `AUTH_SECRET` | `openssl rand -hex 32` |
  | `POSTGRES_PASSWORD` | mot de passe fort |

- [ ] Domaine + SSL (Coolify gere Let's Encrypt)
- [ ] Deploy, attendre ~5 min
- [ ] Tester :
  ```bash
  curl https://cv.votredomaine.com/api/health
  ```
- [ ] Creer un compte sur l'interface web
- [ ] Generer une API key (Settings > API Keys)
- [ ] Tester un CV manuellement + export PDF

**Validation** : `curl -H "x-api-key: rxr_xxx" https://cv.votredomaine.com/api/health` → 200

---

## Phase 2 — API Routes dans PSUP / Vercel (2-3 jours)

**Objectif** : PSUP peut appeler Reactive Resume

### 2.1 — Variables d'environnement Vercel

```
REACTIVE_RESUME_URL=https://cv.votredomaine.com
REACTIVE_RESUME_API_KEY=rxr_xxxxxxxxxx
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-4-20250514
AI_API_KEY=sk-ant-xxxxxxxxxx
```

### 2.2 — Client HTTP (dans PSUP)

```typescript
// lib/reactive-resume.ts

const RR_URL = process.env.REACTIVE_RESUME_URL;
const RR_KEY = process.env.REACTIVE_RESUME_API_KEY;

async function rrFetch(path: string, body: unknown) {
  const res = await fetch(`${RR_URL}/api/rpc${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": RR_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`RR API error: ${res.status}`);
  return res.json();
}

export async function parseCv(file: {
  name: string;
  data: string; // base64
  type: string;
}) {
  return rrFetch("/psup/parse-cv", {
    provider: process.env.AI_PROVIDER,
    model: process.env.AI_MODEL,
    apiKey: process.env.AI_API_KEY,
    baseURL: "",
    file,
  });
}

export async function generateCv(input: {
  candidat: PsupCandidat;
  voeu?: PsupVoeu;
  template?: string;
  generatePdf?: boolean;
  parsedCvData?: ResumeData;
}) {
  return rrFetch("/psup/generate", input);
}

export async function generateBatch(input: {
  candidats: Array<{ candidat: PsupCandidat; voeu?: PsupVoeu }>;
  template?: string;
  generatePdf?: boolean;
}) {
  return rrFetch("/psup/generate-batch", input);
}

export async function previewCv(input: {
  candidat: PsupCandidat;
  voeu?: PsupVoeu;
  parsedCvData?: ResumeData;
}) {
  return rrFetch("/psup/preview", input);
}
```

### 2.3 — API Routes Vercel (proxy)

```typescript
// app/api/cv/parse/route.ts (Next.js App Router)
import { parseCv } from "@/lib/reactive-resume";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await parseCv(body.file);
  return Response.json(result);
}
```

```typescript
// app/api/cv/generate/route.ts
import { generateCv } from "@/lib/reactive-resume";

export async function POST(req: Request) {
  const body = await req.json();

  // Recuperer les donnees PSUP du candidat depuis votre BDD
  const candidat = await getCandidatPsupData(body.candidatId);
  const voeu = body.voeuId ? await getVoeuData(body.voeuId) : undefined;

  const result = await generateCv({
    candidat,
    voeu,
    template: body.template ?? "sorbonne",
    generatePdf: body.generatePdf ?? true,
    parsedCvData: body.parsedCvData,
  });

  // Sauvegarder la reference dans la BDD PSUP
  await saveCandidatCv({
    candidatId: body.candidatId,
    voeuId: body.voeuId,
    resumeId: result.resumeId,
    nom: result.candidatNom,
    pdfUrl: result.pdfUrl,
    editorUrl: result.editorUrl,
  });

  return Response.json(result);
}
```

### 2.4 — Mapping donnees PSUP → format API

```
Table PSUP               →  Champ PsupCandidat
─────────────────────────────────────────────────
candidat.nom              →  nom
candidat.prenom           →  prenom
candidat.date_naissance   →  dateNaissance
candidat.email            →  email
candidat.telephone        →  telephone
candidat.adresse          →  adresse { rue, codePostal, ville }

scolarite[]               →  formations[] {
                               etablissement, filiere, anneeDebut,
                               anneeFin, diplome, specialites, options
                             }

bulletin[]                →  bulletins[] {
                               annee, classe, trimestre,
                               notes[] { matiere, moyenne, moyenneClasse,
                                         appreciation },
                               appreciationGenerale
                             }

voeu                      →  voeu {
                               id, formation, etablissement, ville,
                               descriptif, attendus[], criteresExamen[]
                             }

activite_extrascolaire[]  →  activitesExtraScolaires[] {
                               categorie (sport|art|association|
                                          engagement|autre),
                               titre, description, duree, niveau
                             }

langue[]                  →  langues[] {
                               langue, niveau (A1|A2|B1|B2|C1|C2|natif),
                               certifications[]
                             }

competence[]              →  competences[] { categorie, items[] }
```

### 2.5 — Table a ajouter dans la BDD PSUP

```sql
CREATE TABLE candidat_cvs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidat_id   UUID NOT NULL REFERENCES candidats(id),
  voeu_id       UUID REFERENCES voeux(id),
  resume_id     VARCHAR(255) NOT NULL,
  nom           VARCHAR(500),
  template      VARCHAR(50) DEFAULT 'sorbonne',
  pdf_url       TEXT,
  editor_url    TEXT,
  parsed_cv     JSONB,  -- donnees parsees du CV upload (cache)
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidat_cvs_candidat ON candidat_cvs(candidat_id);
```

**Validation** : `POST /api/cv/generate { candidatId, voeuId }` → retourne un PDF

---

## Phase 3 — Onglet CV dans le frontend PSUP (3-5 jours)

**Objectif** : Interface utilisateur dans la fiche candidat

### 3.1 — Composant OngletCV

```
OngletCV
├── Zone upload (haut)
│   ├── Dropzone "Deposer le CV de l'etudiant (PDF/DOCX)"
│   ├── Badge : "3 experiences, 5 competences extraites"
│   └── Bouton "Re-parser"
│
├── Generateur (milieu)
│   ├── Select voeu (dropdown des voeux du candidat)
│   ├── Select template (sorbonne, onyx, gengar, chikorita)
│   ├── [Apercu]  [Generer le CV]  [Generer pour tous les voeux]
│   └── Preview PDF inline (iframe ou react-pdf)
│
└── CVs generes (bas)
    └── Table
        | Nom du CV                         | Voeu          | Date       |            |
        | CV Marie Dupont - Licence Maths   | Licence Maths | 09/04/2026 | PDF Editer |
        | CV Marie Dupont - CPGE MPSI       | CPGE MPSI     | 09/04/2026 | PDF Editer |
```

### 3.2 — Appels frontend

```typescript
// Upload et parse
const onUpload = async (file: File) => {
  setLoading(true);
  const base64 = await fileToBase64(file);
  const parsed = await fetch("/api/cv/parse", {
    method: "POST",
    body: JSON.stringify({
      file: { name: file.name, data: base64, type: file.type }
    }),
  }).then(r => r.json());
  setParsedCv(parsed);
  setLoading(false);
};

// Generer CV
const onGenerate = async (voeuId: string) => {
  setGenerating(true);
  const result = await fetch("/api/cv/generate", {
    method: "POST",
    body: JSON.stringify({
      candidatId,
      voeuId,
      template: selectedTemplate,
      generatePdf: true,
      parsedCvData: parsedCv,
    }),
  }).then(r => r.json());
  // result = { resumeId, editorUrl, pdfUrl }
  setCvList(prev => [...prev, result]);
  setGenerating(false);
};

// Ouvrir editeur
const onEdit = (editorUrl: string) => {
  window.open(editorUrl, "_blank");
};
```

### 3.3 — Timings et UX

| Action | Duree | UX |
|--------|-------|----|
| Parse CV (IA) | 10-20s | Spinner + "Analyse du CV en cours..." |
| Generer CV (sans PDF) | 1-2s | Instantane |
| Generer CV (avec PDF) | 5-15s | Barre de progression |
| Ouvrir editeur | instantane | Nouvel onglet |
| Batch 10 CVs + PDF | 30-60s | Progress "3/10 generes..." |

**Validation** : Flow complet upload → generer → voir PDF → editer fonctionne

---

## Phase 4 — Ameliorations (2-3 jours)

- [ ] Tailoring IA : brancher le prompt `tailor-parcoursup-system.md`
  pour adapter automatiquement le contenu aux attendus du voeu
- [ ] Bouton "Generer pour tous les voeux" → appel batch
- [ ] Cache du parsing : stocker `parsed_cv` en base PSUP
  pour ne pas re-parser a chaque generation
- [ ] Nettoyage Reactive Resume :
  virer job search, PWA, locales inutiles, reduire templates
- [ ] Branding : remplacer le logo Reactive Resume par le logo PSUP
- [ ] Auth transparente : SSO ou token pre-genere pour que
  le conseiller accede a l'editeur sans se reconnecter

---

## Phase 5 — Production (1-2 jours)

- [ ] Tests de charge (50 CVs batch)
- [ ] Backup PostgreSQL (cron Coolify)
- [ ] Monitoring / alertes healthcheck
- [ ] Documentation conseillers
- [ ] Conformite RGPD (donnees candidats sur serveur externe)

---

## Estimation

| Phase | Duree | Ou |
|-------|-------|----|
| 1. Deploy Reactive Resume | 1-2j | Hetzner/Coolify |
| 2. API routes PSUP | 2-3j | Vercel (PSUP) |
| 3. Frontend onglet CV | 3-5j | Vercel (PSUP) |
| 4. Ameliorations | 2-3j | Les deux |
| 5. Production | 1-2j | Les deux |
| **Total** | **9-15 jours** | |

---

## Reference API

| Methode | Endpoint (Reactive Resume) | Description |
|---------|----------------------------|-------------|
| POST | `/api/rpc/psup/parse-cv` | Parse CV (PDF/DOCX) via IA |
| POST | `/api/rpc/psup/preview` | Apercu JSON sans sauvegarde |
| POST | `/api/rpc/psup/generate` | Cree CV + retourne editorUrl + pdfUrl |
| POST | `/api/rpc/psup/generate-batch` | Batch generation (max 100) |
| GET | `/api/rpc/resumes/{id}/pdf` | Telecharge le PDF |

**Auth** : header `x-api-key: rxr_votre_api_key` sur toutes les requetes.
