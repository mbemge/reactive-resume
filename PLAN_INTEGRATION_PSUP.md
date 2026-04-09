# Plan d'integration Reactive Resume dans PSUP

## Vue d'ensemble

Reactive Resume est deploye comme microservice sur Hetzner (Coolify).
L'app PSUP communique avec lui via API REST pour generer des CVs
a partir des fiches candidats Parcoursup.

---

## Architecture cible

```
┌─────────────────────────────────────────────────────┐
│                    APP PSUP                          │
│                                                      │
│  Fiche candidat                                      │
│  ├── Onglet Infos                                    │
│  ├── Onglet Voeux                                    │
│  ├── Onglet Bulletins                                │
│  └── Onglet CV  ◄──── NOUVEAU                       │
│       ├── Upload CV etudiant (PDF/DOCX)              │
│       ├── Bouton "Generer CV" (par voeu)             │
│       ├── Preview PDF inline                         │
│       ├── Bouton "Modifier" → ouvre l'editeur        │
│       └── Liste des CVs generes                      │
│                                                      │
│  Backend PSUP                                        │
│  └── Service CvService                               │
│       ├── parseCv(file) → experiences                │
│       ├── generateCv(candidat, voeu, experiences)    │
│       └── listCvs(candidatId)                        │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS (API key ou JWT)
                   ▼
┌──────────────────────────────────────────────────────┐
│            REACTIVE RESUME (Microservice)             │
│            https://cv.votredomaine.com                │
│                                                      │
│  API Endpoints utilises :                             │
│  ├── POST /api/rpc/psup/parse-cv                     │
│  ├── POST /api/rpc/psup/generate                     │
│  ├── POST /api/rpc/psup/generate-batch               │
│  ├── POST /api/rpc/psup/preview                      │
│  ├── GET  /api/rpc/resumes/{id}/pdf                  │
│  └── Editeur : /builder/{resumeId}                   │
│                                                      │
│  Infrastructure :                                     │
│  ├── PostgreSQL (stockage CVs)                       │
│  ├── Browserless (generation PDF)                    │
│  └── SeaweedFS (stockage fichiers PDF)               │
└──────────────────────────────────────────────────────┘
```

---

## Phases de developpement

### Phase 1 — Infrastructure (1-2 jours)

**Objectif** : Deployer Reactive Resume sur Coolify

**Taches** :

- [ ] Deployer via Coolify avec `compose.coolify.yml`
  - Source : GitHub `mbemge/reactive-resume`
  - Branche : `claude/analyze-cv-generator-FR3xe`
  - Compose file : `compose.coolify.yml`
- [ ] Configurer les variables d'environnement dans Coolify :
  - `APP_URL` = `https://cv.votredomaine.com`
  - `AUTH_SECRET` = generer avec `openssl rand -hex 32`
  - `POSTGRES_PASSWORD` = mot de passe fort
- [ ] Configurer le domaine + SSL dans Coolify
- [ ] Creer un compte utilisateur (email/mot de passe)
- [ ] Generer une API key dans Reactive Resume (Settings > API Keys)
- [ ] Tester : `curl https://cv.votredomaine.com/api/health`
- [ ] Tester la generation PDF : creer un CV manuellement, exporter

**Validation** : L'URL repond, on peut creer un CV et exporter un PDF.

---

### Phase 2 — Service backend PSUP (3-5 jours)

**Objectif** : Creer le service cote PSUP qui communique avec Reactive Resume

**2.1 — Configuration**

- [ ] Ajouter les variables d'environnement dans PSUP :
  ```
  REACTIVE_RESUME_URL=https://cv.votredomaine.com
  REACTIVE_RESUME_API_KEY=rxr_xxxxxxxxxx
  ```
- [ ] Creer un provider IA pour le parsing de CV :
  ```
  AI_PROVIDER=anthropic  (ou openai, gemini)
  AI_MODEL=claude-sonnet-4-20250514
  AI_API_KEY=sk-ant-xxxxxxxxxx
  ```

**2.2 — Service CvService (dans le backend PSUP)**

```
CvService
├── parseCv(file: File) → ParsedCvData
│   Appelle POST /api/rpc/psup/parse-cv
│   Envoie le fichier en base64 + credentials IA
│   Retourne les experiences/competences extraites
│
├── generateCv(candidatId, voeuId, parsedCvData?) → GenerateResult
│   1. Recupere les donnees PSUP du candidat (identite, formations,
│      bulletins, langues, competences, activites, voeu)
│   2. Mappe vers le format PsupCandidat + PsupVoeu
│   3. Appelle POST /api/rpc/psup/generate
│   4. Stocke le resumeId dans la table candidat_cvs de PSUP
│   5. Retourne { resumeId, editorUrl, pdfUrl }
│
├── previewCv(candidatId, voeuId) → ResumeData
│   Appelle POST /api/rpc/psup/preview
│   Retourne le JSON sans sauvegarder (pour apercu)
│
├── getPdf(resumeId) → string (URL)
│   Appelle GET /api/rpc/resumes/{resumeId}/pdf
│   Retourne l'URL du PDF
│
├── listCvs(candidatId) → CandidatCv[]
│   Requete sur la table candidat_cvs de PSUP
│   Retourne la liste des CVs generes pour ce candidat
│
└── deleteCv(resumeId) → void
    Supprime le CV de Reactive Resume + de la table locale
```

**2.3 — Mapping des donnees PSUP → PsupCandidat**

Le format attendu par l'API est documente dans le schema Zod.
Voici le mapping depuis les tables PSUP typiques :

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
                               categorie, titre, description,
                               duree, niveau
                             }

langue[]                  →  langues[] { langue, niveau, certifications }

competence[]              →  competences[] { categorie, items[] }
```

**2.4 — Table a ajouter dans PSUP**

```sql
CREATE TABLE candidat_cvs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidat_id   UUID NOT NULL REFERENCES candidats(id),
  voeu_id       UUID REFERENCES voeux(id),
  resume_id     VARCHAR(255) NOT NULL,  -- ID dans Reactive Resume
  nom           VARCHAR(500),
  template      VARCHAR(50) DEFAULT 'sorbonne',
  pdf_url       TEXT,
  editor_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidat_cvs_candidat ON candidat_cvs(candidat_id);
```

**Validation** : Depuis le backend PSUP, on peut generer un CV et recuperer le PDF.

---

### Phase 3 — Frontend PSUP : Onglet CV (3-5 jours)

**Objectif** : Ajouter l'onglet CV dans la fiche candidat

**3.1 — Composant OngletCV**

```
OngletCV
├── Section "CV source" (en haut)
│   ├── Zone de drop / bouton upload pour le CV de l'etudiant
│   ├── Indicateur : "CV parse : 3 experiences, 5 competences extraites"
│   └── Bouton "Re-parser" si le CV a change
│
├── Section "Generer un CV" (milieu)
│   ├── Selecteur de voeu (dropdown des voeux du candidat)
│   ├── Selecteur de template (sorbonne, onyx, gengar, chikorita)
│   ├── Bouton "Apercu" → affiche un preview sans sauvegarder
│   ├── Bouton "Generer le CV" → cree + genere PDF
│   └── Checkbox "Generer pour tous les voeux"
│
└── Section "CVs generes" (en bas)
    ├── Liste des CVs deja generes
    │   ├── Nom du CV (ex: "CV Marie Dupont - Licence Maths")
    │   ├── Voeu associe
    │   ├── Date de generation
    │   ├── Bouton "Voir PDF" → ouvre le PDF
    │   ├── Bouton "Modifier" → ouvre l'editeur Reactive Resume
    │   └── Bouton "Regenerer" → ecrase et regenere
    └── Bouton "Telecharger tous les PDFs" (zip)
```

**3.2 — Appels API depuis le frontend PSUP**

```javascript
// 1. Upload et parse du CV de l'etudiant
const parsedData = await cvService.parseCv(file);
// Stocker parsedData dans le state du composant

// 2. Generer un CV pour un voeu
const result = await cvService.generateCv(
  candidatId,
  voeuId,
  parsedData  // optionnel, si un CV a ete uploade
);
// result = { resumeId, editorUrl, pdfUrl }

// 3. Ouvrir l'editeur pour retouches
window.open(result.editorUrl, '_blank');
// Ou dans un iframe :
<iframe src={result.editorUrl} />

// 4. Voir le PDF
<iframe src={result.pdfUrl} type="application/pdf" />
```

**3.3 — UX a respecter**

- Le parsing du CV prend ~10-15s → afficher un loader avec message
- La generation du PDF prend ~5-10s → afficher une barre de progression
- Quand l'editeur s'ouvre, le conseiller doit etre deja authentifie
  (passer le token via query param ou pre-authentifier via cookie)
- Les CVs generes restent accessibles tant qu'ils ne sont pas supprimes

**Validation** : Le conseiller peut uploader un CV, generer un CV adapte
au voeu, le voir en PDF, et l'ouvrir dans l'editeur pour retouches.

---

### Phase 4 — Ameliorations (2-3 jours)

**Objectif** : Polir l'experience et ajouter l'adaptation IA par voeu

- [ ] Brancher le prompt de tailoring Parcoursup
  (`tailor-parcoursup-system.md`) sur un endpoint dedie
  pour ameliorer automatiquement le contenu du CV par rapport
  aux attendus du voeu
- [ ] Ajouter la generation batch :
  un bouton "Generer les CVs pour tous les voeux" qui appelle
  `POST /psup/generate-batch`
- [ ] Nettoyer Reactive Resume :
  - Virer le job search, la PWA, les locales inutiles
  - Simplifier l'auth (garder email/mdp uniquement)
  - Reduire les templates (4-5 modernes)
- [ ] Personnaliser la landing page de Reactive Resume
  pour afficher le logo PSUP au lieu du branding Reactive Resume

---

### Phase 5 — Production (1-2 jours)

- [ ] Tests de charge : generer 50 CVs en batch, verifier que
  Browserless tient (ajuster CONCURRENT si besoin)
- [ ] Backup PostgreSQL automatise (cron dans Coolify)
- [ ] Monitoring : alertes si le healthcheck echoue
- [ ] Documentation : guide utilisateur pour les conseillers
  (comment uploader, generer, modifier un CV)
- [ ] RGPD : verifier la conformite (donnees personnelles
  des candidats stockees dans Reactive Resume)

---

## Estimation globale

| Phase | Duree estimee | Prerequis |
|-------|--------------|-----------|
| Phase 1 — Infrastructure | 1-2 jours | Serveur Hetzner + Coolify |
| Phase 2 — Backend PSUP | 3-5 jours | Phase 1 terminee |
| Phase 3 — Frontend PSUP | 3-5 jours | Phase 2 terminee |
| Phase 4 — Ameliorations | 2-3 jours | Phase 3 terminee |
| Phase 5 — Production | 1-2 jours | Phase 4 terminee |
| **Total** | **10-17 jours** | |

---

## Endpoints API — Resume

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/rpc/psup/parse-cv` | Parse un CV (PDF/DOCX) via IA |
| POST | `/api/rpc/psup/preview` | Apercu sans sauvegarde |
| POST | `/api/rpc/psup/generate` | Genere un CV + retourne editorUrl |
| POST | `/api/rpc/psup/generate-batch` | Genere N CVs (max 100) |
| GET | `/api/rpc/resumes/{id}/pdf` | Exporte un CV en PDF |

## Authentification

Toutes les requetes vers Reactive Resume doivent inclure le header :
```
x-api-key: rxr_votre_api_key
```

L'API key se genere dans Reactive Resume > Settings > API Keys.
