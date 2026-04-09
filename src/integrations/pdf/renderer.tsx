import { Document, Font, Page, renderToBuffer } from "@react-pdf/renderer";

import type { ResumeData } from "@/schema/resume/data";

import { HaussmannTemplate } from "./templates/haussmann";
import { MaraisTemplate } from "./templates/marais";
import { RivoliTemplate } from "./templates/rivoli";
import { SorbonneTemplate } from "./templates/sorbonne";

// --- Google Fonts Registration (Inter) ---

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI2fAZ9hjQ.woff2",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hjQ.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjQ.woff2",
      fontWeight: 700,
    },
  ],
});

// --- Types ---

export type TemplateProps = {
  data: ResumeData;
};

// --- Template Registry ---
// Each template renders a View (no Document/Page) — we wrap them in renderResumePdf.

const SUPPORTED_TEMPLATES = ["sorbonne", "haussmann", "rivoli", "marais"] as const;

type SupportedTemplate = (typeof SUPPORTED_TEMPLATES)[number];

function isSupportedTemplate(name: string): name is SupportedTemplate {
  return (SUPPORTED_TEMPLATES as readonly string[]).includes(name);
}

const templateComponents: Record<SupportedTemplate, React.FC<TemplateProps>> = {
  sorbonne: SorbonneTemplate,
  haussmann: HaussmannTemplate,
  rivoli: RivoliTemplate,
  marais: MaraisTemplate,
};

// --- Main Render Function ---

export async function renderResumePdf(data: ResumeData): Promise<Uint8Array> {
  const templateName = data.metadata.template;

  const TemplateComponent = isSupportedTemplate(templateName) ? templateComponents[templateName] : SorbonneTemplate;

  const buffer = await renderToBuffer(
    <Document>
      <Page size="A4" style={{ fontFamily: "Inter" }}>
        <TemplateComponent data={data} />
      </Page>
    </Document>,
  );

  return new Uint8Array(buffer);
}
