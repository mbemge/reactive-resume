import type { InferSelectModel } from "drizzle-orm";

import { ORPCError } from "@orpc/server";

import type { schema } from "@/integrations/drizzle";

import { renderResumePdf } from "@/integrations/pdf/renderer";

import { getStorageService, uploadFile } from "./storage";

// Deduplicate concurrent requests for the same resume
const activePrintJobs = new Map<string, Promise<string>>();

/**
 * Generates a PDF from a resume using @react-pdf/renderer (pure Node.js, no browser needed)
 * and uploads it to storage.
 */
async function doPrintResumeAsPDF(
  input: Pick<InferSelectModel<typeof schema.resume>, "id" | "data" | "userId">,
): Promise<string> {
  const { id, data, userId } = input;

  // Step 1: Delete any existing PDF for this resume
  const storageService = getStorageService();
  const pdfPrefix = `uploads/${userId}/pdfs/${id}`;
  await storageService.delete(pdfPrefix);

  try {
    // Step 2: Render PDF using @react-pdf/renderer
    const pdfBuffer = await renderResumePdf(data);

    // Step 3: Upload to storage
    const result = await uploadFile({
      userId,
      resumeId: id,
      data: pdfBuffer,
      contentType: "application/pdf",
      type: "pdf",
    });

    return result.url;
  } catch (error) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to generate PDF", cause: error });
  }
}

export const printerService = {
  healthcheck: async (): Promise<object> => {
    // @react-pdf/renderer is a pure Node.js library — no external service to check.
    // We return healthy as long as the module is loaded.
    return { status: "healthy", engine: "react-pdf" };
  },

  /** Generates a PDF, deduplicating concurrent requests for the same resume. */
  printResumeAsPDF: async (
    input: Pick<InferSelectModel<typeof schema.resume>, "id" | "data" | "userId">,
  ): Promise<string> => {
    const { id } = input;

    const existing = activePrintJobs.get(id);
    if (existing) return existing;

    const job = doPrintResumeAsPDF(input).finally(() => {
      activePrintJobs.delete(id);
    });

    activePrintJobs.set(id, job);
    return job;
  },

  /**
   * Screenshot generation is not available with @react-pdf (no browser).
   * Returns an empty string — callers handle null/empty gracefully.
   */
  getResumeScreenshot: async (
    _input: Pick<InferSelectModel<typeof schema.resume>, "userId" | "id" | "data" | "updatedAt">,
  ): Promise<string> => {
    return "";
  },
};
