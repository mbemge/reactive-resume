import { cn } from "@/utils/style";

import type { TemplateProps } from "./types";

import { getSectionComponent } from "../shared/get-section-component";
import { PageLink } from "../shared/page-link";
import { PagePicture } from "../shared/page-picture";
import { PageSummary } from "../shared/page-summary";
import { useResumeStore } from "../store/resume";

const sectionClassName = cn(
  // Section Heading - ultra-minimal, wide letter-spacing, primary color
  "[&>h6]:text-[0.65em] [&>h6]:tracking-[0.25em] [&>h6]:uppercase",
  "[&>h6]:text-(--page-primary-color)",
  "[&>h6]:mt-1 [&>h6]:mb-3",
);

/**
 * Template: Rivoli
 *
 * Ultra-modern minimalist single-column template. Features a bold name,
 * thin accent line, contact items separated by dots, and wide-spaced
 * uppercase section headings. No sidebar — everything flows in one column.
 */
export function RivoliTemplate({ pageIndex, pageLayout }: TemplateProps) {
  const isFirstPage = pageIndex === 0;
  const { main, sidebar } = pageLayout;

  // Rivoli is single-column by design: merge main + sidebar sections
  const allSections = [...main, ...sidebar];

  return (
    <div className="template-rivoli page-content">
      <div className="flex">
        <main data-layout="main" className="group page-main z-10 flex-1">
          {isFirstPage && <Header />}

          {isFirstPage && (
            <PageSummary className={cn(sectionClassName, "px-(--page-margin-x) pt-(--page-gap-y) pb-2")} />
          )}

          <div className="space-y-(--page-gap-y) px-(--page-margin-x) pt-(--page-gap-y)">
            {allSections
              .filter((section) => section !== "summary")
              .map((section) => {
                const Component = getSectionComponent(section, { sectionClassName });
                return <Component key={section} id={section} />;
              })}
          </div>
        </main>
      </div>
    </div>
  );
}

function Header() {
  const basics = useResumeStore((state) => state.resume.data.basics);

  const contactItems: React.ReactNode[] = [];

  if (basics.email) {
    contactItems.push(
      <span key="email" className="basics-item-email flex items-center gap-x-1">
        <PageLink url={`mailto:${basics.email}`} label={basics.email} />
      </span>,
    );
  }

  if (basics.phone) {
    contactItems.push(
      <span key="phone" className="basics-item-phone flex items-center gap-x-1">
        <PageLink url={`tel:${basics.phone}`} label={basics.phone} />
      </span>,
    );
  }

  if (basics.location) {
    contactItems.push(
      <span key="location" className="basics-item-location">
        {basics.location}
      </span>,
    );
  }

  if (basics.website.url) {
    contactItems.push(
      <span key="website" className="basics-item-website flex items-center gap-x-1 text-(--page-primary-color)">
        <PageLink {...basics.website} />
      </span>,
    );
  }

  for (const field of basics.customFields) {
    contactItems.push(
      <span key={field.id} className="basics-item-custom flex items-center gap-x-1">
        {field.link ? <PageLink url={field.link} label={field.text} /> : <span>{field.text}</span>}
      </span>,
    );
  }

  return (
    <div className="page-header px-(--page-margin-x) pt-(--page-margin-y)">
      <div className="flex items-start gap-x-4">
        <PagePicture />

        <div className="page-basics flex-1">
          <h2 className="basics-name text-[2em] font-bold tracking-wide">{basics.name}</h2>
          {basics.headline && (
            <p className="basics-headline mt-1 text-[0.9em] text-(--page-text-color)/50">{basics.headline}</p>
          )}

          {/* Accent line */}
          <div className="my-2 h-[1px] bg-(--page-primary-color)" />

          {/* Contact items separated by dots */}
          <div className="basics-items flex flex-wrap items-center text-[0.8em] text-(--page-text-color)/60">
            {contactItems.map((item, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-(--page-text-color)/30">&middot;</span>}
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
