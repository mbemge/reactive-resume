import { EnvelopeIcon, GlobeIcon, MapPinIcon, PhoneIcon } from "@phosphor-icons/react";

import { cn } from "@/utils/style";

import type { TemplateProps } from "./types";

import { getSectionComponent } from "../shared/get-section-component";
import { PageIcon } from "../shared/page-icon";
import { PageLink } from "../shared/page-link";
import { PagePicture } from "../shared/page-picture";
import { PageSummary } from "../shared/page-summary";
import { useResumeStore } from "../store/resume";

const sectionClassName = cn(
  // Section Heading - uppercase with primary-colored underline
  "[&>h6]:text-[0.7em] [&>h6]:tracking-[0.1em] [&>h6]:uppercase",
  "[&>h6]:border-b [&>h6]:border-(--page-primary-color) [&>h6]:pb-1",
  "[&>h6]:mb-2 [&>h6]:text-(--page-primary-color)",

  // Section Item Header in Sidebar Layout
  "group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
  "group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",

  // Sidebar section headings - white text on colored background
  "group-data-[layout=sidebar]:[&>h6]:text-(--page-background-color)",
  "group-data-[layout=sidebar]:[&>h6]:border-(--page-background-color)/35",

  // Sidebar level indicators
  "group-data-[layout=sidebar]:[&_.section-item-level>div]:border-(--page-background-color)/50",
  "group-data-[layout=sidebar]:[&_.section-item-level>div]:data-[active=true]:bg-(--page-background-color)",

  // Sidebar icon color override
  "group-data-[layout=sidebar]:[&_.section-item_i]:text-(--page-background-color)!",
);

/**
 * Template: Haussmann
 *
 * A bold template with a colored sidebar (primary color background, white text).
 * The sidebar hosts the photo, contact info, skills, languages, and interests.
 * The main column focuses on summary, experience, education, and projects.
 */
export function HaussmannTemplate({ pageIndex, pageLayout }: TemplateProps) {
  const isFirstPage = pageIndex === 0;
  const { main, sidebar, fullWidth } = pageLayout;

  return (
    <div className="template-haussmann page-content">
      {/* Sidebar background - full primary color */}
      {!fullWidth && (
        <div className="page-sidebar-background pointer-events-none absolute inset-y-0 z-0 w-(--page-sidebar-width) shrink-0 bg-(--page-primary-color) ltr:inset-e-0 rtl:inset-s-0" />
      )}

      <div className="flex">
        {/* Main content */}
        <main data-layout="main" className="group page-main z-10 flex-1">
          {isFirstPage && <MainHeader />}

          {isFirstPage && (
            <PageSummary className={cn(sectionClassName, "px-(--page-margin-x) pt-(--page-gap-y) pb-2")} />
          )}

          <div className="space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-gap-y)">
            {main
              .filter((section) => section !== "summary")
              .map((section) => {
                const Component = getSectionComponent(section, { sectionClassName });
                return <Component key={section} id={section} />;
              })}
          </div>
        </main>

        {/* Sidebar */}
        {!fullWidth && (
          <aside
            data-layout="sidebar"
            className="group page-sidebar z-10 w-(--page-sidebar-width) shrink-0 overflow-x-hidden px-(--page-margin-x) pt-(--page-margin-y) text-(--page-background-color)"
          >
            {isFirstPage && <SidebarHeader />}

            <div className="space-y-(--page-gap-y)">
              {sidebar.map((section) => {
                const Component = getSectionComponent(section, { sectionClassName });
                return <Component key={section} id={section} />;
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function MainHeader() {
  const basics = useResumeStore((state) => state.resume.data.basics);

  return (
    <div className="page-header px-(--page-margin-x) pt-(--page-margin-y)">
      <div className="page-basics">
        <h2 className="basics-name text-[1.8em] font-bold tracking-wide">{basics.name}</h2>
        {basics.headline && (
          <p className="basics-headline mt-1 text-[1em] text-(--page-primary-color)">{basics.headline}</p>
        )}
      </div>
    </div>
  );
}

function SidebarHeader() {
  const basics = useResumeStore((state) => state.resume.data.basics);

  return (
    <div className="mb-4 space-y-3">
      <PagePicture className="mx-auto rounded-full border-2 border-(--page-background-color)" />

      {/* Contact info - vertical stack in sidebar */}
      <div className="basics-items space-y-1.5 text-[0.8em]">
        {basics.email && (
          <div className="basics-item-email flex items-center gap-x-2">
            <EnvelopeIcon className="shrink-0 opacity-65" />
            <PageLink url={`mailto:${basics.email}`} label={basics.email} />
          </div>
        )}

        {basics.phone && (
          <div className="basics-item-phone flex items-center gap-x-2">
            <PhoneIcon className="shrink-0 opacity-65" />
            <PageLink url={`tel:${basics.phone}`} label={basics.phone} />
          </div>
        )}

        {basics.location && (
          <div className="basics-item-location flex items-center gap-x-2">
            <MapPinIcon className="shrink-0 opacity-65" />
            <span>{basics.location}</span>
          </div>
        )}

        {basics.website.url && (
          <div className="basics-item-website flex items-center gap-x-2">
            <GlobeIcon className="shrink-0 opacity-65" />
            <PageLink {...basics.website} />
          </div>
        )}

        {basics.customFields.map((field) => (
          <div key={field.id} className="basics-item-custom flex items-center gap-x-2">
            <PageIcon icon={field.icon} className="shrink-0 opacity-65" />
            {field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
