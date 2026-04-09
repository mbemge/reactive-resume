import { Image, Link, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ResumeData } from "@/schema/resume/data";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SorbonneTemplate({ data }: { data: ResumeData }) {
  const primary = data.metadata.design.colors.primary;
  const textColor = data.metadata.design.colors.text;
  const bgColor = data.metadata.design.colors.background;

  const styles = StyleSheet.create({
    // -- Page-level wrapper --------------------------------------------------
    container: {
      flexDirection: "column",
      backgroundColor: bgColor,
      color: textColor,
      fontFamily: "Helvetica",
      fontSize: 10,
    },

    // -- Top accent bar ------------------------------------------------------
    accentBar: {
      height: 3,
      backgroundColor: primary,
      width: "100%",
    },

    // -- Header --------------------------------------------------------------
    header: {
      paddingHorizontal: 32,
      paddingTop: 20,
      paddingBottom: 16,
    },
    name: {
      fontSize: 24,
      fontWeight: "600",
      color: textColor,
      marginBottom: 2,
    },
    headline: {
      fontSize: 11,
      color: primary,
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
    },
    contactItem: {
      fontSize: 9,
      color: textColor,
    },
    contactSeparator: {
      fontSize: 9,
      color: textColor,
      marginHorizontal: 6,
    },

    // -- Body layout ---------------------------------------------------------
    body: {
      flexDirection: "row",
      flexGrow: 1,
      paddingBottom: 24,
    },
    mainColumn: {
      width: "65%",
      paddingLeft: 32,
      paddingRight: 16,
    },
    sidebar: {
      width: "35%",
      backgroundColor: "#F8F8F8",
      paddingLeft: 16,
      paddingRight: 24,
      paddingTop: 4,
    },

    // -- Section heading -----------------------------------------------------
    sectionHeading: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      marginTop: 14,
    },
    sectionHeadingBorder: {
      width: 2,
      height: 12,
      backgroundColor: primary,
      marginRight: 6,
    },
    sectionHeadingText: {
      fontSize: 8,
      fontWeight: "600",
      letterSpacing: 2,
      textTransform: "uppercase",
      color: primary,
    },

    // -- Items ---------------------------------------------------------------
    itemBlock: {
      marginBottom: 8,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    itemTitle: {
      fontSize: 11,
      fontWeight: "600",
      color: textColor,
    },
    itemSubtitle: {
      fontSize: 10,
      color: textColor,
    },
    itemPeriod: {
      fontSize: 9,
      color: textColor,
      textAlign: "right",
      flexShrink: 0,
      marginLeft: 8,
    },
    itemLocation: {
      fontSize: 9,
      color: textColor,
      marginTop: 1,
    },
    itemDescription: {
      fontSize: 10,
      color: textColor,
      marginTop: 3,
      lineHeight: 1.4,
    },

    // -- Sidebar items -------------------------------------------------------
    sidebarItem: {
      marginBottom: 6,
    },
    sidebarItemName: {
      fontSize: 10,
      fontWeight: "600",
      color: textColor,
    },
    sidebarItemDetail: {
      fontSize: 9,
      color: textColor,
      marginTop: 1,
    },

    // -- Summary -------------------------------------------------------------
    summaryText: {
      fontSize: 10,
      color: textColor,
      lineHeight: 1.5,
    },

    // -- Picture -------------------------------------------------------------
    picture: {
      marginBottom: 8,
    },

    // -- Link ----------------------------------------------------------------
    link: {
      color: primary,
      textDecoration: "none",
    },
  });

  // -------------------------------------------------------------------------
  // Section heading renderer
  // -------------------------------------------------------------------------

  const SectionHeading = ({ title }: { title: string }) => (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingBorder} />
      <Text style={styles.sectionHeadingText}>{title}</Text>
    </View>
  );

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------

  const contactParts: string[] = [];
  if (data.basics.email) contactParts.push(data.basics.email);
  if (data.basics.phone) contactParts.push(data.basics.phone);
  if (data.basics.location) contactParts.push(data.basics.location);

  const headerBlock = (
    <View style={styles.header}>
      {data.basics.name ? <Text style={styles.name}>{data.basics.name}</Text> : null}
      {data.basics.headline ? <Text style={styles.headline}>{data.basics.headline}</Text> : null}
      {contactParts.length > 0 && (
        <View style={styles.contactRow}>
          {contactParts.map((part, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center" }}>
              {idx > 0 && <Text style={styles.contactSeparator}>|</Text>}
              <Text style={styles.contactItem}>{part}</Text>
            </View>
          ))}
          {data.basics.website.url ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.contactSeparator}>|</Text>
              <Link src={data.basics.website.url} style={[styles.contactItem, styles.link]}>
                {data.basics.website.label || data.basics.website.url}
              </Link>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );

  // -------------------------------------------------------------------------
  // Picture (rendered in sidebar if visible)
  // -------------------------------------------------------------------------

  const pictureBlock =
    !data.picture.hidden && data.picture.url ? (
      <View style={styles.picture}>
        <Image
          src={data.picture.url}
          style={{
            width: data.picture.size,
            height: data.picture.size / (data.picture.aspectRatio || 1),
            borderRadius: data.picture.borderRadius,
            borderColor: data.picture.borderColor,
            borderWidth: data.picture.borderWidth,
          }}
        />
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------

  const summaryBlock =
    !data.summary.hidden && data.summary.content ? (
      <View>
        <SectionHeading title={data.summary.title || "Summary"} />
        <Text style={styles.summaryText}>{stripHtml(data.summary.content)}</Text>
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Experience
  // -------------------------------------------------------------------------

  const experienceSection = data.sections.experience;
  const experienceBlock =
    !experienceSection.hidden && experienceSection.items.length > 0 ? (
      <View>
        <SectionHeading title={experienceSection.title || "Experience"} />
        {experienceSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.itemBlock}>
              <View style={styles.itemHeader}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={styles.itemTitle}>{item.company}</Text>
                  {item.position ? <Text style={styles.itemSubtitle}>{item.position}</Text> : null}
                </View>
                {item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
              </View>
              {item.location ? <Text style={styles.itemLocation}>{item.location}</Text> : null}
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
              {item.roles && item.roles.length > 0
                ? item.roles.map((role) => (
                    <View key={role.id} style={{ marginTop: 4, marginLeft: 8 }}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemSubtitle}>{role.position}</Text>
                        {role.period ? <Text style={styles.itemPeriod}>{role.period}</Text> : null}
                      </View>
                      {role.description ? (
                        <Text style={styles.itemDescription}>{stripHtml(role.description)}</Text>
                      ) : null}
                    </View>
                  ))
                : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Education
  // -------------------------------------------------------------------------

  const educationSection = data.sections.education;
  const educationBlock =
    !educationSection.hidden && educationSection.items.length > 0 ? (
      <View>
        <SectionHeading title={educationSection.title || "Education"} />
        {educationSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.itemBlock}>
              <View style={styles.itemHeader}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={styles.itemTitle}>{item.school}</Text>
                  {item.degree || item.area ? (
                    <Text style={styles.itemSubtitle}>{[item.degree, item.area].filter(Boolean).join(", ")}</Text>
                  ) : null}
                </View>
                {item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
              </View>
              {item.grade ? <Text style={styles.sidebarItemDetail}>Grade: {item.grade}</Text> : null}
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Projects
  // -------------------------------------------------------------------------

  const projectsSection = data.sections.projects;
  const projectsBlock =
    !projectsSection.hidden && projectsSection.items.length > 0 ? (
      <View>
        <SectionHeading title={projectsSection.title || "Projects"} />
        {projectsSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.itemBlock}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {item.website?.url ? (
                    <Link src={item.website.url} style={styles.link}>
                      {item.name}
                    </Link>
                  ) : (
                    item.name
                  )}
                </Text>
                {item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
              </View>
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Awards
  // -------------------------------------------------------------------------

  const awardsSection = data.sections.awards;
  const awardsBlock =
    !awardsSection.hidden && awardsSection.items.length > 0 ? (
      <View>
        <SectionHeading title={awardsSection.title || "Awards"} />
        {awardsSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.itemBlock}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.date ? <Text style={styles.itemPeriod}>{item.date}</Text> : null}
              </View>
              {item.awarder ? <Text style={styles.itemSubtitle}>{item.awarder}</Text> : null}
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Certifications
  // -------------------------------------------------------------------------

  const certsSection = data.sections.certifications;
  const certsBlock =
    !certsSection.hidden && certsSection.items.length > 0 ? (
      <View>
        <SectionHeading title={certsSection.title || "Certifications"} />
        {certsSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.itemBlock}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.date ? <Text style={styles.itemPeriod}>{item.date}</Text> : null}
              </View>
              {item.issuer ? <Text style={styles.itemSubtitle}>{item.issuer}</Text> : null}
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Publications
  // -------------------------------------------------------------------------

  const pubsSection = data.sections.publications;
  const pubsBlock =
    !pubsSection.hidden && pubsSection.items.length > 0 ? (
      <View>
        <SectionHeading title={pubsSection.title || "Publications"} />
        {pubsSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.itemBlock}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.date ? <Text style={styles.itemPeriod}>{item.date}</Text> : null}
              </View>
              {item.publisher ? <Text style={styles.itemSubtitle}>{item.publisher}</Text> : null}
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Volunteer
  // -------------------------------------------------------------------------

  const volunteerSection = data.sections.volunteer;
  const volunteerBlock =
    !volunteerSection.hidden && volunteerSection.items.length > 0 ? (
      <View>
        <SectionHeading title={volunteerSection.title || "Volunteer"} />
        {volunteerSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.itemBlock}>
              <View style={styles.itemHeader}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={styles.itemTitle}>{item.organization}</Text>
                </View>
                {item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
              </View>
              {item.location ? <Text style={styles.itemLocation}>{item.location}</Text> : null}
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // References
  // -------------------------------------------------------------------------

  const refsSection = data.sections.references;
  const refsBlock =
    !refsSection.hidden && refsSection.items.length > 0 ? (
      <View>
        <SectionHeading title={refsSection.title || "References"} />
        {refsSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.itemBlock}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              {item.position ? <Text style={styles.itemSubtitle}>{item.position}</Text> : null}
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Skills (sidebar)
  // -------------------------------------------------------------------------

  const skillsSection = data.sections.skills;
  const skillsBlock =
    !skillsSection.hidden && skillsSection.items.length > 0 ? (
      <View>
        <SectionHeading title={skillsSection.title || "Skills"} />
        {skillsSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.sidebarItem}>
              <Text style={styles.sidebarItemName}>{item.name}</Text>
              {item.keywords.length > 0 ? (
                <Text style={styles.sidebarItemDetail}>{item.keywords.join(", ")}</Text>
              ) : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Languages (sidebar)
  // -------------------------------------------------------------------------

  const languagesSection = data.sections.languages;
  const languagesBlock =
    !languagesSection.hidden && languagesSection.items.length > 0 ? (
      <View>
        <SectionHeading title={languagesSection.title || "Languages"} />
        {languagesSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.sidebarItem}>
              <Text style={styles.sidebarItemName}>{item.language}</Text>
              {item.fluency ? <Text style={styles.sidebarItemDetail}>{item.fluency}</Text> : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Interests (sidebar)
  // -------------------------------------------------------------------------

  const interestsSection = data.sections.interests;
  const interestsBlock =
    !interestsSection.hidden && interestsSection.items.length > 0 ? (
      <View>
        <SectionHeading title={interestsSection.title || "Interests"} />
        {interestsSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.sidebarItem}>
              <Text style={styles.sidebarItemName}>{item.name}</Text>
              {item.keywords.length > 0 ? (
                <Text style={styles.sidebarItemDetail}>{item.keywords.join(", ")}</Text>
              ) : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Profiles (sidebar)
  // -------------------------------------------------------------------------

  const profilesSection = data.sections.profiles;
  const profilesBlock =
    !profilesSection.hidden && profilesSection.items.length > 0 ? (
      <View>
        <SectionHeading title={profilesSection.title || "Profiles"} />
        {profilesSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.sidebarItem}>
              <Text style={styles.sidebarItemName}>{item.network}</Text>
              {item.username ? (
                item.website?.url ? (
                  <Link src={item.website.url} style={[styles.sidebarItemDetail, styles.link]}>
                    {item.username}
                  </Link>
                ) : (
                  <Text style={styles.sidebarItemDetail}>{item.username}</Text>
                )
              ) : null}
            </View>
          ))}
      </View>
    ) : null;

  // -------------------------------------------------------------------------
  // Custom sections (rendered in main column)
  // -------------------------------------------------------------------------

  const customSectionBlocks = data.customSections
    .filter((section) => !section.hidden)
    .map((section) => (
      <View key={section.id}>
        <SectionHeading title={section.title} />
        {section.items
          .filter((item) => !item.hidden)
          .map((item) => {
            // Handle experience-type custom sections
            if ("company" in item && "position" in item) {
              return (
                <View key={item.id} style={styles.itemBlock}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.company}</Text>
                    {"period" in item && item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
                  </View>
                  {"position" in item && item.position ? (
                    <Text style={styles.itemSubtitle}>{item.position}</Text>
                  ) : null}
                  {"description" in item && item.description ? (
                    <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text>
                  ) : null}
                </View>
              );
            }

            // Handle education-type custom sections
            if ("school" in item) {
              return (
                <View key={item.id} style={styles.itemBlock}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.school}</Text>
                    {"period" in item && item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
                  </View>
                  {"degree" in item && item.degree ? <Text style={styles.itemSubtitle}>{item.degree}</Text> : null}
                  {"description" in item && item.description ? (
                    <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text>
                  ) : null}
                </View>
              );
            }

            // Handle skill-type custom sections
            if ("keywords" in item && "name" in item) {
              return (
                <View key={item.id} style={styles.sidebarItem}>
                  <Text style={styles.sidebarItemName}>{item.name}</Text>
                  {item.keywords.length > 0 ? (
                    <Text style={styles.sidebarItemDetail}>{item.keywords.join(", ")}</Text>
                  ) : null}
                </View>
              );
            }

            // Handle generic items with content (summary-type)
            if ("content" in item && item.content) {
              return (
                <View key={item.id} style={styles.itemBlock}>
                  <Text style={styles.itemDescription}>{stripHtml(item.content)}</Text>
                </View>
              );
            }

            // Handle items with title (awards, certifications, publications)
            if ("title" in item) {
              return (
                <View key={item.id} style={styles.itemBlock}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {"description" in item && item.description ? (
                    <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text>
                  ) : null}
                </View>
              );
            }

            // Handle items with name (projects, languages, interests)
            if ("name" in item) {
              return (
                <View key={item.id} style={styles.itemBlock}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  {"description" in item && item.description ? (
                    <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text>
                  ) : null}
                </View>
              );
            }

            return null;
          })}
      </View>
    ));

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Top accent bar */}
      <View style={styles.accentBar} />

      {/* Header */}
      {headerBlock}

      {/* Two-column body */}
      <View style={styles.body}>
        {/* Main column (65%) */}
        <View style={styles.mainColumn}>
          {summaryBlock}
          {experienceBlock}
          {educationBlock}
          {projectsBlock}
          {awardsBlock}
          {certsBlock}
          {pubsBlock}
          {volunteerBlock}
          {refsBlock}
          {customSectionBlocks}
        </View>

        {/* Sidebar (35%) */}
        <View style={styles.sidebar}>
          {pictureBlock}
          {profilesBlock}
          {skillsBlock}
          {languagesBlock}
          {interestsBlock}
        </View>
      </View>
    </View>
  );
}
