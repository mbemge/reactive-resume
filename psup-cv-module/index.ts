/**
 * psup-cv-module — Module autonome de generation de CV PDF pour Parcoursup.
 *
 * Dependances externes :
 *   - @react-pdf/renderer
 *   - uuid
 *   - react (peer dependency de @react-pdf/renderer)
 *
 * Usage :
 *   import { mapPsupToResumeData, renderResumePdf } from "./psup-cv-module";
 */

// Types
export type { ResumeData, ResumeMetadata, Basics, Picture, Summary, Sections } from "./types";
export type { CustomSection, CustomSectionItem } from "./types";
export type {
  ExperienceItem,
  EducationItem,
  SkillItem,
  LanguageItem,
  InterestItem,
  ProjectItem,
  CertificationItem,
  AwardItem,
  VolunteerItem,
  ReferenceItem,
  ProfileItem,
} from "./types";
export { defaultResumeData } from "./types";

// Schema (Parcoursup types)
export type {
  PsupCandidat,
  PsupVoeu,
  PsupFormation,
  PsupBulletin,
  PsupBulletinNote,
  PsupExperience,
  PsupLangue,
  PsupCompetence,
  PsupActiviteExtraScolaire,
  PsupAdresse,
} from "./schema";

// Mapper
export { mapPsupToResumeData, mergeParsedCvIntoResumeData } from "./mapper";

// Renderer
export { renderResumePdf } from "./renderer";
