/**
 * Exemple de route API Next.js (App Router) pour generer un CV PDF.
 *
 * Fichier a placer dans : app/api/cv/generate/route.ts
 *
 * Requete POST avec body JSON :
 * {
 *   "candidat": { ... PsupCandidat ... },
 *   "voeu": { ... PsupVoeu ... },       // optionnel
 *   "template": "sorbonne"              // optionnel: sorbonne | haussmann | rivoli | marais
 * }
 *
 * Retourne le PDF en reponse binaire.
 */

import { NextResponse } from "next/server";

// Ajuster le chemin selon l'emplacement dans votre projet
import { mapPsupToResumeData, renderResumePdf } from "@/lib/cv";

import type { PsupCandidat, PsupVoeu } from "@/lib/cv";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const candidat: PsupCandidat = body.candidat;
    const voeu: PsupVoeu | undefined = body.voeu;
    const template: string | undefined = body.template;

    if (!candidat || !candidat.nom || !candidat.prenom) {
      return NextResponse.json({ error: "Donnees candidat manquantes (nom, prenom requis)" }, { status: 400 });
    }

    // 1. Mapper les donnees Parcoursup vers ResumeData
    const resumeData = mapPsupToResumeData(candidat, voeu, template);

    // 2. Generer le PDF
    const pdfBuffer = await renderResumePdf(resumeData);

    // 3. Retourner le PDF
    const filename = `cv-${candidat.prenom.toLowerCase()}-${candidat.nom.toLowerCase()}.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur generation CV:", error);
    return NextResponse.json({ error: "Erreur lors de la generation du CV" }, { status: 500 });
  }
}
