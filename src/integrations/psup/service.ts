import type { ResumeData } from "@/schema/resume/data";

import { printerService } from "@/integrations/orpc/services/printer";
import { resumeService } from "@/integrations/orpc/services/resume";
import { generateId } from "@/utils/string";

import type { PsupCandidat, PsupVoeu } from "./schema";

import { mapPsupToResumeData, mergeParsedCvIntoResumeData } from "./mapper";

export type BatchGenerateInput = {
  userId: string;
  candidats: Array<{
    candidat: PsupCandidat;
    voeu?: PsupVoeu;
  }>;
  template?: string;
  generatePdf?: boolean;
  concurrency?: number;
};

export type GenerateResult = {
  candidatNom: string;
  resumeId: string;
  editorUrl?: string;
  pdfUrl?: string;
  error?: string;
};

/**
 * Genere un CV pour un candidat Parcoursup.
 *
 * Flow complet :
 * 1. Convertit les donnees PSUP en ResumeData (identite, formations, bulletins, voeu)
 * 2. Si un CV parse est fourni, fusionne les experiences/competences extraites
 * 3. Cree le CV en base de donnees
 * 4. Optionnellement genere le PDF
 * 5. Retourne le resumeId + URL de l'editeur pour retouches manuelles
 */
export async function generateSingleCV(input: {
  userId: string;
  candidat: PsupCandidat;
  voeu?: PsupVoeu;
  template?: string;
  generatePdf?: boolean;
  parsedCvData?: ResumeData;
  appUrl?: string;
}): Promise<GenerateResult> {
  const { userId, candidat, voeu, template, generatePdf, parsedCvData, appUrl } = input;
  const nom = `${candidat.prenom} ${candidat.nom}`;

  try {
    // Step 1: Map PSUP data to ResumeData
    let resumeData = mapPsupToResumeData(candidat, voeu, template);

    // Step 2: Merge parsed CV data (experiences, competences, projets) if provided
    if (parsedCvData) {
      resumeData = mergeParsedCvIntoResumeData(resumeData, parsedCvData);
    }

    // Step 3: Create resume in database
    const slug = `${candidat.prenom}-${candidat.nom}-${voeu?.id ?? "cv"}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const resumeName = voeu ? `CV ${nom} - ${voeu.formation}` : `CV ${nom}`;

    const resumeId = await resumeService.create({
      userId,
      name: resumeName,
      slug: `${slug}-${generateId().slice(0, 8)}`,
      tags: ["psup", "parcoursup", ...(voeu ? [voeu.formation] : [])],
      locale: "fr-FR",
      data: resumeData,
    });

    // Step 4: Generate PDF if requested
    let pdfUrl: string | undefined;

    if (generatePdf) {
      const resume = await resumeService.getByIdForPrinter({ id: resumeId, userId });
      pdfUrl = await printerService.printResumeAsPDF({
        id: resume.id,
        data: resume.data,
        userId: resume.userId,
      });
    }

    // Step 5: Build editor URL for manual editing
    const editorUrl = appUrl ? `${appUrl}/builder/${resumeId}` : undefined;

    return { candidatNom: nom, resumeId, editorUrl, pdfUrl };
  } catch (error) {
    return {
      candidatNom: nom,
      resumeId: "",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Genere des CVs en batch pour plusieurs candidats.
 * Controle la concurrence pour ne pas surcharger Browserless.
 */
export async function generateBatchCVs(input: BatchGenerateInput): Promise<GenerateResult[]> {
  const { userId, candidats, template, generatePdf = false, concurrency = 3 } = input;
  const results: GenerateResult[] = [];

  for (let i = 0; i < candidats.length; i += concurrency) {
    const chunk = candidats.slice(i, i + concurrency);

    const chunkResults = await Promise.all(
      chunk.map(({ candidat, voeu }) => generateSingleCV({ userId, candidat, voeu, template, generatePdf })),
    );

    results.push(...chunkResults);
  }

  return results;
}
