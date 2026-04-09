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
  // Section Heading - thin uppercase with subtle left accent
  "[&>h6]:text-[0.7em] [&>h6]:tracking-[0.15em] [&>h6]:uppercase",
  "[&>h6]:border-l-2 [&>h6]:border-(--page-primary-color) [&>h6]:pl-2",
  "[&>h6]:mb-2",

  // Section Item Header in Sidebar Layout
  "group-data-[layout=sidebar]:[&_.section-item-header>div]:flex-col",
  "group-data-[layout=sidebar]:[&_.section-item-header>div]:items-start",

  // Sidebar section headings - inverted colors
  "group-data-[layout=sidebar]:[&>h6]:border-(--page-background-color)/50",
  "group-data-[layout=sidebar]:[&>h6]:text-(--page-background-color)",

  // Sidebar level indicators
  "group-data-[layout=sidebar]:[&_.section-item-level>div]:border-(--page-background-color)/50",
  "group-data-[layout=sidebar]:[&_.section-item-level>div]:data-[active=true]:bg-(--page-background-color)",

  // Sidebar icon color override
  "group-data-[layout=sidebar]:[&_.section-item_i]:text-(--page-background-color)!",
);

/**
 * Template: Sorbonne
 *
 * A modern, clean resume template inspired by French academic elegance.
 * Features a slim colored sidebar with a geometric accent, uppercase
 * section headings with left border accents, and generous whitespace.
 */
export function SorbonneTemplate({ pageIndex, pageLayout }: TemplateProps) {
  const isFirstPage = pageIndex === 0;
  const { main, sidebar, fullWidth } = pageLayout;

  return (
    <div className="template-sorbonne page-content">
      {/* Sidebar background - slim, modern, with geometric accent */}
      {!fullWidth && (
        <>
          <div className="page-sidebar-background pointer-events-none absolute inset-y-0 z-0 w-(--page-sidebar-width) shrink-0 bg-(--page-primary-color) ltr:inset-e-0 rtl:inset-s-0" />
          {/* Decorative thin line accent between main and sidebar */}
          <div className="pointer-events-none absolute inset-y-0 z-10 w-[2px] bg-(--page-background-color)/20 ltr:right-[calc(var(--page-sidebar-width)-1px)] rtl:left-[calc(var(--page-sidebar-width)-1px)]" />
        </>
      )}

      <div className="flex">
        {/* Main content */}
        <main data-layout="main" className="group page-main z-10 flex-1">
          {isFirstPage && <Header />}

          {isFirstPage && (
            <PageSummary
              className={cn(sectionClassName, "px-(--page-margin-x) pt-(--page-gap-y) pb-2", "[&>h6]:hidden")}
            />
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
            className="group page-sidebar z-10 w-(--page-sidebar-width) shrink-0 space-y-(--page-gap-y) overflow-x-hidden px-(--page-margin-x) pt-(--page-margin-y) text-(--page-background-color)"
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
    <div className="page-header relative">
      {/* Top accent bar */}
      <div className="h-[3px] bg-(--page-primary-color)" />

      <div className="flex items-center gap-x-(--page-margin-x) px-(--page-margin-x) py-(--page-margin-y)">
        <PagePicture />

        <div className="page-basics flex-1 space-y-2">
          {/* Name with modern styling */}
          <div>
            <h2 className="basics-name tracking-wide">{basics.name}</h2>
            <p className="basics-headline mt-0.5 text-(--page-primary-color)">{basics.headline}</p>
          </div>

          {/* Contact info in a clean horizontal layout */}
          <div className="basics-items flex flex-wrap gap-x-4 gap-y-1 text-[0.85em] opacity-75 *:flex *:items-center *:gap-x-1.5">
            {basics.email && (
              <div className="basics-item-email">
                <EnvelopeIcon />
                <PageLink url={`mailto:${basics.email}`} label={basics.email} />
              </div>
            )}

            {basics.phone && (
              <div className="basics-item-phone">
                <PhoneIcon />
                <PageLink url={`tel:${basics.phone}`} label={basics.phone} />
              </div>
            )}

            {basics.location && (
              <div className="basics-item-location">
                <MapPinIcon />
                <span>{basics.location}</span>
              </div>
            )}

            {basics.website.url && (
              <div className="basics-item-website">
                <GlobeIcon />
                <PageLink {...basics.website} />
              </div>
            )}

            {basics.customFields.map((field) => (
              <div key={field.id} className="basics-item-custom">
                <PageIcon icon={field.icon} />
                {field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom separator */}
      <div className="mx-(--page-margin-x) border-b border-(--page-text-color)/10" />
    </div>
  );
}
