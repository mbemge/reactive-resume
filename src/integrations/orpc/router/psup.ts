import z from "zod";

import { psupCandidatSchema, psupVoeuSchema } from "@/integrations/psup/schema";
import { generateBatchCVs, generateSingleCV } from "@/integrations/psup/service";

import { protectedProcedure } from "../context";

export const psupRouter = {
  generateCV: protectedProcedure
    .route({
      method: "POST",
      path: "/psup/generate",
      tags: ["Parcoursup"],
      operationId: "generatePsupCV",
      summary: "Generate a CV from Parcoursup candidate data",
      description:
        "Creates a resume from a Parcoursup candidate profile, optionally tailored for a specific voeu (formation). Returns the resume ID and optionally a PDF URL.",
      successDescription: "The CV was generated successfully.",
    })
    .input(
      z.object({
        candidat: psupCandidatSchema.describe("The Parcoursup candidate data."),
        voeu: psupVoeuSchema.optional().describe("The specific voeu to tailor the CV for."),
        template: z.string().optional().describe("The template to use (default: onyx)."),
        generatePdf: z.boolean().optional().describe("Whether to generate a PDF (default: false)."),
      }),
    )
    .output(
      z.object({
        candidatNom: z.string(),
        resumeId: z.string(),
        pdfUrl: z.string().optional(),
        error: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      return generateSingleCV({
        userId: context.user.id,
        candidat: input.candidat,
        voeu: input.voeu,
        template: input.template,
        generatePdf: input.generatePdf,
      });
    }),

  generateBatch: protectedProcedure
    .route({
      method: "POST",
      path: "/psup/generate-batch",
      tags: ["Parcoursup"],
      operationId: "generatePsupBatch",
      summary: "Generate CVs in batch from Parcoursup candidate data",
      description:
        "Creates resumes for multiple Parcoursup candidates at once. Controls concurrency to avoid overloading the PDF generation service. Returns results for each candidate.",
      successDescription: "The batch CV generation completed.",
    })
    .input(
      z.object({
        candidats: z
          .array(
            z.object({
              candidat: psupCandidatSchema,
              voeu: psupVoeuSchema.optional(),
            }),
          )
          .min(1)
          .max(100)
          .describe("Array of candidates to generate CVs for (max 100)."),
        template: z.string().optional().describe("The template to use for all CVs."),
        generatePdf: z.boolean().optional().describe("Whether to generate PDFs (default: false)."),
        concurrency: z
          .number()
          .min(1)
          .max(10)
          .optional()
          .describe("Number of concurrent PDF generations (default: 3, max: 10)."),
      }),
    )
    .output(
      z.object({
        results: z.array(
          z.object({
            candidatNom: z.string(),
            resumeId: z.string(),
            pdfUrl: z.string().optional(),
            error: z.string().optional(),
          }),
        ),
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
};
