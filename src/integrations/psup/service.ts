import type { PsupCandidat, PsupVoeu } from "./schema";

import { resumeService } from "@/integrations/orpc/services/resume";
import { printerService } from "@/integrations/orpc/services/printer";
import { generateId } from "@/utils/string";

import { mapPsupToResumeData } from "./mapper";

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

export type BatchGenerateResult = {
  candidatNom: string;
  resumeId: string;
  pdfUrl?: string;
  error?: string;
};

/**
 * Genere un CV unique pour un candidat Parcoursup.
 * Cree le resume en base et optionnellement genere le PDF.
 */
export async function generateSingleCV(input: {
  userId: string;
  candidat: PsupCandidat;
  voeu?: PsupVoeu;
  template?: string;
  generatePdf?: boolean;
}): Promise<BatchGenerateResult> {
  const { userId, candidat, voeu, template, generatePdf } = input;
  const nom = `${candidat.prenom} ${candidat.nom}`;

  try {
    const resumeData = mapPsupToResumeData(candidat, voeu, template);

    const slug = `${candidat.prenom}-${candidat.nom}-${voeu?.id ?? "cv"}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const resumeName = voeu
      ? `CV ${nom} - ${voeu.formation}`
      : `CV ${nom}`;

    const resumeId = await resumeService.create({
      userId,
      name: resumeName,
      slug: `${slug}-${generateId().slice(0, 8)}`,
      tags: ["psup", "parcoursup", ...(voeu ? [voeu.formation] : [])],
      locale: "fr-FR",
      data: resumeData,
    });

    let pdfUrl: string | undefined;

    if (generatePdf) {
      const resume = await resumeService.getByIdForPrinter({ id: resumeId, userId });
      pdfUrl = await printerService.printResumeAsPDF({
        id: resume.id,
        data: resume.data,
        userId: resume.userId,
      });
    }

    return { candidatNom: nom, resumeId, pdfUrl };
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
export async function generateBatchCVs(input: BatchGenerateInput): Promise<BatchGenerateResult[]> {
  const { userId, candidats, template, generatePdf = false, concurrency = 3 } = input;
  const results: BatchGenerateResult[] = [];

  // Process in chunks to control concurrency
  for (let i = 0; i < candidats.length; i += concurrency) {
    const chunk = candidats.slice(i, i + concurrency);

    const chunkResults = await Promise.all(
      chunk.map(({ candidat, voeu }) =>
        generateSingleCV({ userId, candidat, voeu, template, generatePdf }),
      ),
    );

    results.push(...chunkResults);
  }

  return results;
}
