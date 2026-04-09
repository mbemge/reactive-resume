/**
 * Exemple de route API Next.js (App Router) pour previsualiser un CV (retourne le ResumeData JSON).
 *
 * Fichier a placer dans : app/api/cv/preview/route.ts
 *
 * Utile pour debugger la structure de donnees avant le rendu PDF.
 */

import { NextResponse } from "next/server";

import { mapPsupToResumeData } from "@/lib/cv";

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

    const resumeData = mapPsupToResumeData(candidat, voeu, template);

    return NextResponse.json(resumeData);
  } catch (error) {
    console.error("Erreur preview CV:", error);
    return NextResponse.json({ error: "Erreur lors de la generation du preview" }, { status: 500 });
  }
}
