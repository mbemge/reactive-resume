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
  // Section Heading - small square bullet + bold text
  "[&>h6]:text-[0.7em] [&>h6]:tracking-[0.1em] [&>h6]:uppercase",
  "[&>h6]:flex [&>h6]:items-center [&>h6]:gap-1.5",
  "[&>h6]:mb-2",
  "[&>h6]:before:inline-block [&>h6]:before:content-['']",
  "[&>h6]:before:size-1 [&>h6]:before:bg-(--page-primary-color)",

  // Section Item Header in Sidebar Layout
  "group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
  "group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",
);

/**
 * Template: Marais
 *
 * A creative template with a full-width primary-color header banner,
 * two-column body layout, small square bullet section headings,
 * and a light gray sidebar. Skill pills use the primary color.
 */
export function MaraisTemplate({ pageIndex, pageLayout }: TemplateProps) {
  const isFirstPage = pageIndex === 0;
  const { main, sidebar, fullWidth } = pageLayout;

  return (
    <div className="template-marais page-content">
      {/* Sidebar background - light gray */}
      {!fullWidth && (
        <div className="page-sidebar-background pointer-events-none absolute inset-y-0 z-0 w-(--page-sidebar-width) shrink-0 bg-[#F5F5F5] ltr:inset-e-0 rtl:inset-s-0" />
      )}

      {/* Full-width header with primary color */}
      {isFirstPage && <Header />}

      <div className="flex">
        {/* Main content */}
        <main data-layout="main" className="group page-main z-10 flex-1">
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
            className="group page-sidebar z-10 w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) overflow-x-hidden px-(--page-margin-x) pt-(--page-gap-y)"
          >
            {sidebar.map((section) => {
              const Component = getSectionComponent(section, { sectionClassName });
              return <Component key={section} id={section} />;
            })}
          </aside>
        )}
      </div>
    </div>
  );
}

function Header() {
  const basics = useResumeStore((state) => state.resume.data.basics);

  return (
    <div className="page-header relative z-10 bg-(--page-primary-color) px-(--page-margin-x) py-4 text-(--page-background-color)">
      <div className="flex items-center gap-x-4">
        <PagePicture className="rounded-full border-2 border-(--page-background-color)" />

        <div className="page-basics flex-1">
          <h2 className="basics-name text-[1.6em] font-bold text-(--page-background-color)">{basics.name}</h2>
          {basics.headline && (
            <p className="basics-headline mt-0.5 text-[0.9em] text-(--page-background-color)/85">{basics.headline}</p>
          )}

          {/* Contact info row */}
          <div className="basics-items mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.78em] text-(--page-background-color)/80">
            {basics.email && (
              <span className="basics-item-email flex items-center gap-x-1">
                <EnvelopeIcon className="shrink-0" />
                <PageLink url={`mailto:${basics.email}`} label={basics.email} />
              </span>
            )}

            {basics.phone && (
              <span className="basics-item-phone flex items-center gap-x-1">
                <PhoneIcon className="shrink-0" />
                <PageLink url={`tel:${basics.phone}`} label={basics.phone} />
              </span>
            )}

            {basics.location && (
              <span className="basics-item-location flex items-center gap-x-1">
                <MapPinIcon className="shrink-0" />
                <span>{basics.location}</span>
              </span>
            )}

            {basics.website.url && (
              <span className="basics-item-website flex items-center gap-x-1">
                <GlobeIcon className="shrink-0" />
                <PageLink {...basics.website} />
              </span>
            )}

            {basics.customFields.map((field) => (
              <span key={field.id} className="basics-item-custom flex items-center gap-x-1">
                <PageIcon icon={field.icon} className="shrink-0" />
                {field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
