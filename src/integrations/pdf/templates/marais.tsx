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
    .replace(/<\/li>\s*<li[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading({
  title,
  primaryColor,
  textColor,
}: {
  title: string;
  primaryColor: string;
  textColor: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        marginTop: 10,
      }}
    >
      <View
        style={{
          width: 4,
          height: 4,
          backgroundColor: primaryColor,
          marginRight: 6,
        }}
      />
      <Text
        style={{
          fontSize: 9,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 1,
          color: textColor,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function LevelDots({ level, primaryColor }: { level: number; primaryColor: string }) {
  const maxDots = 5;
  const dots = [];
  for (let i = 0; i < maxDots; i++) {
    dots.push(
      <View
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: i < level ? primaryColor : "#D0D0D0",
        }}
      />,
    );
  }
  return <View style={{ flexDirection: "row", gap: 3 }}>{dots}</View>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MaraisTemplate({ data }: { data: ResumeData }) {
  const primaryColor = data.metadata.design.colors.primary;
  const textColor = data.metadata.design.colors.text;
  const bgColor = data.metadata.design.colors.background;

  const styles = StyleSheet.create({
    // -- Page-level wrapper --
    container: {
      flexDirection: "column",
      fontFamily: "Helvetica",
      fontSize: 10,
      lineHeight: 1.5,
      color: textColor,
      backgroundColor: bgColor,
    },

    // -- Header (full width, primary color background) --
    header: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      backgroundColor: primaryColor,
    },
    headerName: {
      fontSize: 22,
      fontWeight: "700",
      color: "#ffffff",
    },
    headerHeadline: {
      fontSize: 11,
      fontWeight: "400",
      color: "#ffffff",
      opacity: 0.85,
      marginTop: 2,
    },
    headerContactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 8,
      fontSize: 8.5,
      color: "#ffffff",
      opacity: 0.8,
    },
    headerContactLink: {
      textDecoration: "none",
      color: "#ffffff",
    },

    // -- Body layout --
    body: {
      flexDirection: "row",
      flex: 1,
    },
    mainColumn: {
      flex: 6,
      paddingTop: 14,
      paddingBottom: 14,
      paddingLeft: 24,
      paddingRight: 16,
    },
    sidebarColumn: {
      flex: 4,
      backgroundColor: "#F5F5F5",
      paddingTop: 14,
      paddingBottom: 14,
      paddingLeft: 14,
      paddingRight: 18,
    },

    // -- Items --
    itemContainer: {
      marginBottom: 6,
    },
    itemTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    itemTitle: {
      fontSize: 10,
      fontWeight: "700",
      color: textColor,
    },
    itemSubtitle: {
      fontSize: 9.5,
      fontWeight: "400",
      color: "#444444",
    },
    itemPeriod: {
      fontSize: 8.5,
      fontWeight: "400",
      color: "#888888",
    },
    itemDescription: {
      fontSize: 9,
      color: "#444444",
      lineHeight: 1.45,
      marginTop: 2,
    },
    itemMeta: {
      fontSize: 8.5,
      color: "#888888",
      marginTop: 1,
    },

    // -- Skill pills --
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 4,
    },
    skillPill: {
      fontSize: 7,
      fontWeight: "600",
      color: "#ffffff",
      backgroundColor: primaryColor,
      paddingVertical: 3,
      paddingHorizontal: 6,
      borderRadius: 3,
    },

    // -- Language level dots --
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    languageName: {
      fontSize: 9,
      fontWeight: "500",
      color: textColor,
    },
    languageFluency: {
      fontSize: 8,
      color: "#888888",
      marginLeft: 4,
    },

    // -- Interest list --
    interestItem: {
      fontSize: 9,
      marginBottom: 2,
      color: "#444444",
    },

    // -- Link --
    link: {
      textDecoration: "none",
    },
  });

  // -------------------------------------------------------------------------
  // Picture
  // -------------------------------------------------------------------------

  const pictureBlock =
    !data.picture.hidden && data.picture.url ? (
      <View style={{ marginBottom: 10, alignItems: "center" }}>
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
  // Custom sections
  // -------------------------------------------------------------------------

  const customSectionBlocks = data.customSections
    .filter((section) => !section.hidden)
    .map((section) => {
      const visibleItems = section.items.filter((i) => !i.hidden);
      if (visibleItems.length === 0) return null;

      return (
        <View key={section.id}>
          <SectionHeading title={section.title} primaryColor={primaryColor} textColor={textColor} />
          {visibleItems.map((item) => {
            const anyItem = item as Record<string, unknown>;
            const title =
              (anyItem.title as string) ||
              (anyItem.company as string) ||
              (anyItem.school as string) ||
              (anyItem.name as string) ||
              (anyItem.organization as string) ||
              (anyItem.network as string) ||
              (anyItem.language as string) ||
              "";
            const subtitle =
              (anyItem.position as string) ||
              (anyItem.degree as string) ||
              (anyItem.issuer as string) ||
              (anyItem.publisher as string) ||
              (anyItem.awarder as string) ||
              (anyItem.fluency as string) ||
              (anyItem.username as string) ||
              "";
            const period = (anyItem.period as string) || (anyItem.date as string) || "";
            const description = (anyItem.description as string) || (anyItem.content as string) || "";
            const website = anyItem.website as { url: string; label: string } | undefined;

            return (
              <View key={item.id} style={styles.itemContainer}>
                {title ? (
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{title}</Text>
                    {period ? <Text style={styles.itemPeriod}>{period}</Text> : null}
                  </View>
                ) : null}
                {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
                {stripHtml(description) ? <Text style={styles.itemDescription}>{stripHtml(description)}</Text> : null}
                {website?.url ? (
                  <Link src={website.url} style={[styles.link, styles.itemMeta, { color: primaryColor }]}>
                    {website.label || website.url}
                  </Link>
                ) : null}
              </View>
            );
          })}
        </View>
      );
    });

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Header (full width, primary color background) */}
      <View style={styles.header}>
        <Text style={styles.headerName}>{data.basics.name}</Text>
        {data.basics.headline ? <Text style={styles.headerHeadline}>{data.basics.headline}</Text> : null}
        <View style={styles.headerContactRow}>
          {data.basics.email ? (
            <Link src={`mailto:${data.basics.email}`} style={styles.headerContactLink}>
              {data.basics.email}
            </Link>
          ) : null}
          {data.basics.phone ? (
            <Link src={`tel:${data.basics.phone}`} style={styles.headerContactLink}>
              {data.basics.phone}
            </Link>
          ) : null}
          {data.basics.location ? <Text>{data.basics.location}</Text> : null}
          {data.basics.website?.url ? (
            <Link src={data.basics.website.url} style={styles.headerContactLink}>
              {data.basics.website.label || data.basics.website.url}
            </Link>
          ) : null}
          {data.basics.customFields.map((field) =>
            field.link ? (
              <Link key={field.id} src={field.link} style={styles.headerContactLink}>
                {field.text}
              </Link>
            ) : (
              <Text key={field.id}>{field.text}</Text>
            ),
          )}
        </View>
      </View>

      {/* Body (two columns) */}
      <View style={styles.body}>
        {/* Main Column (60%) */}
        <View style={styles.mainColumn}>
          {/* Picture (if present, rendered at top of main) */}
          {pictureBlock}

          {/* Summary */}
          {!data.summary.hidden && data.summary.content ? (
            <View>
              <SectionHeading
                title={data.summary.title || "Summary"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              <Text style={styles.itemDescription}>{stripHtml(data.summary.content)}</Text>
            </View>
          ) : null}

          {/* Experience */}
          {!data.sections.experience.hidden && data.sections.experience.items.length > 0 ? (
            <View>
              <SectionHeading
                title={data.sections.experience.title || "Experience"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              {data.sections.experience.items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{item.company}</Text>
                      {item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
                    </View>
                    {item.position ? <Text style={styles.itemSubtitle}>{item.position}</Text> : null}
                    {item.location ? <Text style={styles.itemMeta}>{item.location}</Text> : null}
                    {item.description ? (
                      <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text>
                    ) : null}
                    {item.roles && item.roles.length > 0
                      ? item.roles.map((role) => (
                          <View key={role.id} style={{ marginTop: 4, marginLeft: 8 }}>
                            <View style={styles.itemTitleRow}>
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
          ) : null}

          {/* Education */}
          {!data.sections.education.hidden && data.sections.education.items.length > 0 ? (
            <View>
              <SectionHeading
                title={data.sections.education.title || "Education"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              {data.sections.education.items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{item.school}</Text>
                      {item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
                    </View>
                    {item.degree || item.area ? (
                      <Text style={styles.itemSubtitle}>{[item.degree, item.area].filter(Boolean).join(", ")}</Text>
                    ) : null}
                    {item.location ? <Text style={styles.itemMeta}>{item.location}</Text> : null}
                    {item.description ? (
                      <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text>
                    ) : null}
                  </View>
                ))}
            </View>
          ) : null}

          {/* Projects */}
          {!data.sections.projects.hidden && data.sections.projects.items.length > 0 ? (
            <View>
              <SectionHeading
                title={data.sections.projects.title || "Projects"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              {data.sections.projects.items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{item.name}</Text>
                      {item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
                    </View>
                    {item.website?.url ? (
                      <Link src={item.website.url} style={[styles.link, styles.itemMeta, { color: primaryColor }]}>
                        {item.website.label || item.website.url}
                      </Link>
                    ) : null}
                    {item.description ? (
                      <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text>
                    ) : null}
                  </View>
                ))}
            </View>
          ) : null}

          {/* Custom sections in main area */}
          {customSectionBlocks}
        </View>

        {/* Sidebar Column (40%) */}
        <View style={styles.sidebarColumn}>
          {/* Skills (colored pill tags) */}
          {!data.sections.skills.hidden && data.sections.skills.items.length > 0 ? (
            <View>
              <SectionHeading
                title={data.sections.skills.title || "Skills"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              <View style={styles.skillsContainer}>
                {data.sections.skills.items
                  .filter((item) => !item.hidden)
                  .map((item) => (
                    <Text key={item.id} style={styles.skillPill}>
                      {item.name}
                    </Text>
                  ))}
              </View>
            </View>
          ) : null}

          {/* Languages (with level dots) */}
          {!data.sections.languages.hidden && data.sections.languages.items.length > 0 ? (
            <View>
              <SectionHeading
                title={data.sections.languages.title || "Languages"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              {data.sections.languages.items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <View key={item.id} style={styles.languageItem}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.languageName}>{item.language}</Text>
                      {item.fluency ? <Text style={styles.languageFluency}>{item.fluency}</Text> : null}
                    </View>
                    {item.level > 0 ? <LevelDots level={item.level} primaryColor={primaryColor} /> : null}
                  </View>
                ))}
            </View>
          ) : null}

          {/* Interests (simple list) */}
          {!data.sections.interests.hidden && data.sections.interests.items.length > 0 ? (
            <View>
              <SectionHeading
                title={data.sections.interests.title || "Interests"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              {data.sections.interests.items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <Text key={item.id} style={styles.interestItem}>
                    {item.name}
                  </Text>
                ))}
            </View>
          ) : null}

          {/* Awards */}
          {!data.sections.awards.hidden && data.sections.awards.items.length > 0 ? (
            <View>
              <SectionHeading
                title={data.sections.awards.title || "Awards"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              {data.sections.awards.items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMeta}>{[item.awarder, item.date].filter(Boolean).join(" | ")}</Text>
                  </View>
                ))}
            </View>
          ) : null}

          {/* Certifications */}
          {!data.sections.certifications.hidden && data.sections.certifications.items.length > 0 ? (
            <View>
              <SectionHeading
                title={data.sections.certifications.title || "Certifications"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              {data.sections.certifications.items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMeta}>{[item.issuer, item.date].filter(Boolean).join(" | ")}</Text>
                  </View>
                ))}
            </View>
          ) : null}

          {/* References */}
          {!data.sections.references.hidden && data.sections.references.items.length > 0 ? (
            <View>
              <SectionHeading
                title={data.sections.references.title || "References"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              {data.sections.references.items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    {item.position ? <Text style={styles.itemSubtitle}>{item.position}</Text> : null}
                    {item.description ? (
                      <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text>
                    ) : null}
                  </View>
                ))}
            </View>
          ) : null}

          {/* Profiles */}
          {!data.sections.profiles.hidden && data.sections.profiles.items.length > 0 ? (
            <View>
              <SectionHeading
                title={data.sections.profiles.title || "Profiles"}
                primaryColor={primaryColor}
                textColor={textColor}
              />
              {data.sections.profiles.items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <Text style={styles.itemTitle}>{item.network}</Text>
                    {item.username ? (
                      item.website?.url ? (
                        <Link src={item.website.url} style={[styles.link, styles.itemMeta, { color: primaryColor }]}>
                          {item.username}
                        </Link>
                      ) : (
                        <Text style={styles.itemMeta}>{item.username}</Text>
                      )
                    ) : null}
                  </View>
                ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
