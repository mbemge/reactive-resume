import z from "zod";

import { psupCandidatSchema, psupVoeuSchema } from "@/integrations/psup/schema";
import { generateBatchCVs, generateSingleCV } from "@/integrations/psup/service";
import { mapPsupToResumeData, mergeParsedCvIntoResumeData } from "@/integrations/psup/mapper";
import { resumeDataSchema } from "@/schema/resume/data";
import { env } from "@/utils/env";

import { protectedProcedure } from "../context";
import { aiService, fileInputSchema } from "../services/ai";

const generateResultSchema = z.object({
  candidatNom: z.string(),
  resumeId: z.string(),
  editorUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  error: z.string().optional(),
});

export const psupRouter = {
  /**
   * Parse un CV uploade (PDF/DOCX) via l'IA et retourne les donnees extraites.
   * Utilise pour recuperer les experiences/competences absentes de PSUP.
   */
  parseCv: protectedProcedure
    .route({
      method: "POST",
      path: "/psup/parse-cv",
      tags: ["Parcoursup"],
      operationId: "parsePsupCv",
      summary: "Parse an uploaded CV to extract experiences and skills",
      description:
        "Uploads a student's existing CV (PDF or DOCX) and uses AI to extract structured data " +
        "(experiences, skills, projects, certifications). This data can then be merged with PSUP " +
        "candidate data when generating a tailored CV. Requires AI provider credentials.",
      successDescription: "The CV was successfully parsed.",
    })
    .input(
      z.object({
        provider: z.enum(["openai", "anthropic", "gemini", "ollama", "vercel-ai-gateway"]),
        model: z.string(),
        apiKey: z.string(),
        baseURL: z.string().default(""),
        file: fileInputSchema.describe("The CV file (PDF or DOCX) as base64."),
      }),
    )
    .output(resumeDataSchema)
    .handler(async ({ input }) => {
      const isPdf =
        input.file.name.toLowerCase().endsWith(".pdf") ||
        input.file.type === "application/pdf";

      if (isPdf) {
        return aiService.parsePdf(input);
      }

      return aiService.parseDocx({
        ...input,
        mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    }),

  /**
   * Genere un CV a partir des donnees PSUP d'un candidat.
   * Optionnellement fusionne avec un CV parse pour les experiences.
   * Retourne l'URL de l'editeur pour retouches manuelles.
   */
  generateCV: protectedProcedure
    .route({
      method: "POST",
      path: "/psup/generate",
      tags: ["Parcoursup"],
      operationId: "generatePsupCV",
      summary: "Generate a CV from Parcoursup candidate data",
      description:
        "Creates a resume from a Parcoursup candidate profile. Can be tailored for a specific " +
        "voeu (formation) and enriched with parsed CV data (experiences from the student's " +
        "existing CV). Returns the resume ID, an editor URL for manual adjustments, and " +
        "optionally a PDF URL.",
      successDescription: "The CV was generated successfully.",
    })
    .input(
      z.object({
        candidat: psupCandidatSchema.describe("The Parcoursup candidate data."),
        voeu: psupVoeuSchema.optional().describe("The specific voeu to tailor the CV for."),
        template: z.string().optional().describe("The template to use (default: onyx)."),
        generatePdf: z.boolean().optional().describe("Whether to generate a PDF immediately."),
        parsedCvData: resumeDataSchema.optional().describe(
          "Structured data from a previously parsed CV (from /psup/parse-cv). " +
          "Experiences, skills, and projects from this will be merged into the generated CV.",
        ),
      }),
    )
    .output(generateResultSchema)
    .handler(async ({ input, context }) => {
      return generateSingleCV({
        userId: context.user.id,
        candidat: input.candidat,
        voeu: input.voeu,
        template: input.template,
        generatePdf: input.generatePdf,
        parsedCvData: input.parsedCvData,
        appUrl: env.APP_URL,
      });
    }),

  /**
   * Genere des CVs en batch pour plusieurs candidats.
   */
  generateBatch: protectedProcedure
    .route({
      method: "POST",
      path: "/psup/generate-batch",
      tags: ["Parcoursup"],
      operationId: "generatePsupBatch",
      summary: "Generate CVs in batch from Parcoursup candidate data",
      description:
        "Creates resumes for multiple Parcoursup candidates at once. Controls concurrency " +
        "to avoid overloading the PDF generation service.",
      successDescription: "The batch CV generation completed.",
    })
    .input(
      z.object({
        candidats: z
          .array(z.object({ candidat: psupCandidatSchema, voeu: psupVoeuSchema.optional() }))
          .min(1)
          .max(100)
          .describe("Array of candidates (max 100)."),
        template: z.string().optional(),
        generatePdf: z.boolean().optional(),
        concurrency: z.number().min(1).max(10).optional(),
      }),
    )
    .output(
      z.object({
        results: z.array(generateResultSchema),
        total: z.number(),
        success: z.number(),
        failed: z.number(),
      }),
    )
    .handler(async ({ input, context }) => {
      const results = await generateBatchCVs({
        userId: context.user.id,
        candidats: input.candidats,
        template: input.template,
        generatePdf: input.generatePdf,
        concurrency: input.concurrency,
      });

      const success = results.filter((r) => !r.error).length;

      return {
        results,
        total: results.length,
        success,
        failed: results.length - success,
      };
    }),

  /**
   * Preview : genere un ResumeData sans le sauvegarder en base.
   * Utile pour afficher un apercu avant de valider.
   */
  preview: protectedProcedure
    .route({
      method: "POST",
      path: "/psup/preview",
      tags: ["Parcoursup"],
      operationId: "previewPsupCV",
      summary: "Preview a CV without saving it",
      description:
        "Generates a ResumeData object from PSUP candidate data without persisting it. " +
        "Useful for showing a preview before the user confirms generation.",
      successDescription: "The preview data was generated.",
    })
    .input(
      z.object({
        candidat: psupCandidatSchema,
        voeu: psupVoeuSchema.optional(),
        template: z.string().optional(),
        parsedCvData: resumeDataSchema.optional(),
      }),
    )
    .output(resumeDataSchema)
    .handler(async ({ input }) => {
      let resumeData = mapPsupToResumeData(input.candidat, input.voeu, input.template);

      if (input.parsedCvData) {
        resumeData = mergeParsedCvIntoResumeData(resumeData, input.parsedCvData);
      }

      return resumeData;
    }),
};
