/**
 * Types pour la generation de CV — module autonome.
 * Pas de dependance a Reactive Resume.
 */

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

export type Url = {
  url: string;
  label: string;
};

export type CustomField = {
  id: string;
  icon: string;
  text: string;
  link: string;
};

// ---------------------------------------------------------------------------
// Picture
// ---------------------------------------------------------------------------

export type Picture = {
  hidden: boolean;
  url: string;
  size: number;
  rotation: number;
  aspectRatio: number;
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
  shadowColor: string;
  shadowWidth: number;
};

// ---------------------------------------------------------------------------
// Basics
// ---------------------------------------------------------------------------

export type Basics = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: Url;
  customFields: CustomField[];
};

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export type Summary = {
  title: string;
  columns: number;
  hidden: boolean;
  content: string;
};

// ---------------------------------------------------------------------------
// Section Items
// ---------------------------------------------------------------------------

type BaseItem = {
  id: string;
  hidden: boolean;
  options?: { showLinkInTitle: boolean };
};

export type RoleItem = {
  id: string;
  position: string;
  period: string;
  description: string;
};

export type ExperienceItem = BaseItem & {
  company: string;
  position: string;
  location: string;
  period: string;
  website: Url;
  description: string;
  roles: RoleItem[];
};

export type EducationItem = BaseItem & {
  school: string;
  degree: string;
  area: string;
  grade: string;
  location: string;
  period: string;
  website: Url;
  description: string;
};

export type ProjectItem = BaseItem & {
  name: string;
  period: string;
  website: Url;
  description: string;
};

export type SkillItem = BaseItem & {
  icon: string;
  name: string;
  proficiency: string;
  level: number;
  keywords: string[];
};

export type LanguageItem = BaseItem & {
  language: string;
  fluency: string;
  level: number;
};

export type InterestItem = BaseItem & {
  icon: string;
  name: string;
  keywords: string[];
};

export type AwardItem = BaseItem & {
  title: string;
  awarder: string;
  date: string;
  website: Url;
  description: string;
};

export type CertificationItem = BaseItem & {
  title: string;
  issuer: string;
  date: string;
  website: Url;
  description: string;
};

export type PublicationItem = BaseItem & {
  title: string;
  publisher: string;
  date: string;
  website: Url;
  description: string;
};

export type VolunteerItem = BaseItem & {
  organization: string;
  location: string;
  period: string;
  website: Url;
  description: string;
};

export type ReferenceItem = BaseItem & {
  name: string;
  position: string;
  website: Url;
  phone: string;
  description: string;
};

export type ProfileItem = BaseItem & {
  icon: string;
  network: string;
  username: string;
  website: Url;
};

export type SummaryItem = BaseItem & {
  content: string;
};

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

type Section<T> = {
  title: string;
  columns: number;
  hidden: boolean;
  items: T[];
};

export type Sections = {
  profiles: Section<ProfileItem>;
  experience: Section<ExperienceItem>;
  education: Section<EducationItem>;
  projects: Section<ProjectItem>;
  skills: Section<SkillItem>;
  languages: Section<LanguageItem>;
  interests: Section<InterestItem>;
  awards: Section<AwardItem>;
  certifications: Section<CertificationItem>;
  publications: Section<PublicationItem>;
  volunteer: Section<VolunteerItem>;
  references: Section<ReferenceItem>;
};

// ---------------------------------------------------------------------------
// Custom Sections
// ---------------------------------------------------------------------------

export type CustomSectionItem =
  | SummaryItem
  | ProfileItem
  | ExperienceItem
  | EducationItem
  | ProjectItem
  | SkillItem
  | LanguageItem
  | InterestItem
  | AwardItem
  | CertificationItem
  | PublicationItem
  | VolunteerItem
  | ReferenceItem;

export type CustomSection = {
  id: string;
  title: string;
  columns: number;
  hidden: boolean;
  type: string;
  items: CustomSectionItem[];
};

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export type ResumeMetadata = {
  template: string;
  layout: {
    sidebarWidth: number;
    pages: Array<{
      fullWidth: boolean;
      main: string[];
      sidebar: string[];
    }>;
  };
  css: { enabled: boolean; value: string };
  page: {
    gapX: number;
    gapY: number;
    marginX: number;
    marginY: number;
    format: string;
    locale: string;
    hideIcons: boolean;
  };
  design: {
    colors: {
      primary: string;
      text: string;
      background: string;
    };
    level: {
      icon: string;
      type: string;
    };
  };
  typography: {
    body: { fontFamily: string; fontWeights: string[]; fontSize: number; lineHeight: number };
    heading: { fontFamily: string; fontWeights: string[]; fontSize: number; lineHeight: number };
  };
  notes: string;
};

// ---------------------------------------------------------------------------
// ResumeData (type principal)
// ---------------------------------------------------------------------------

export type ResumeData = {
  picture: Picture;
  basics: Basics;
  summary: Summary;
  sections: Sections;
  customSections: CustomSection[];
  metadata: ResumeMetadata;
};

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const defaultResumeData: ResumeData = {
  picture: {
    hidden: false,
    url: "",
    size: 80,
    rotation: 0,
    aspectRatio: 1,
    borderRadius: 0,
    borderColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 0,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowWidth: 0,
  },
  basics: {
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    website: { url: "", label: "" },
    customFields: [],
  },
  summary: { title: "", columns: 1, hidden: false, content: "" },
  sections: {
    profiles: { title: "", columns: 1, hidden: false, items: [] },
    experience: { title: "", columns: 1, hidden: false, items: [] },
    education: { title: "", columns: 1, hidden: false, items: [] },
    projects: { title: "", columns: 1, hidden: false, items: [] },
    skills: { title: "", columns: 1, hidden: false, items: [] },
    languages: { title: "", columns: 1, hidden: false, items: [] },
    interests: { title: "", columns: 1, hidden: false, items: [] },
    awards: { title: "", columns: 1, hidden: false, items: [] },
    certifications: { title: "", columns: 1, hidden: false, items: [] },
    publications: { title: "", columns: 1, hidden: false, items: [] },
    volunteer: { title: "", columns: 1, hidden: false, items: [] },
    references: { title: "", columns: 1, hidden: false, items: [] },
  },
  customSections: [],
  metadata: {
    template: "sorbonne",
    layout: {
      sidebarWidth: 35,
      pages: [
        {
          fullWidth: false,
          main: ["summary", "education", "experience"],
          sidebar: ["skills", "languages", "interests"],
        },
      ],
    },
    css: { enabled: false, value: "" },
    page: { gapX: 4, gapY: 6, marginX: 14, marginY: 12, format: "a4", locale: "fr-FR", hideIcons: false },
    design: {
      colors: {
        primary: "rgba(30, 58, 138, 1)",
        text: "rgba(0, 0, 0, 1)",
        background: "rgba(255, 255, 255, 1)",
      },
      level: { icon: "star", type: "circle" },
    },
    typography: {
      body: { fontFamily: "Inter", fontWeights: ["400"], fontSize: 10, lineHeight: 1.4 },
      heading: { fontFamily: "Inter", fontWeights: ["600"], fontSize: 13, lineHeight: 1.3 },
    },
    notes: "",
  },
};
