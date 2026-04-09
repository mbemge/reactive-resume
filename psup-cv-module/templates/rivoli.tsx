import { Image, Link, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ResumeData } from "../types";

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
// Component
// ---------------------------------------------------------------------------

export function RivoliTemplate({ data }: { data: ResumeData }) {
  const primaryColor = data.metadata.design.colors.primary;
  const textColor = data.metadata.design.colors.text;
  const bgColor = data.metadata.design.colors.background;

  const styles = StyleSheet.create({
    container: {
      padding: 40,
      fontFamily: "Helvetica",
      fontSize: 10,
      lineHeight: 1.5,
      color: textColor,
      backgroundColor: bgColor,
    },
    name: {
      fontSize: 28,
      fontWeight: "700",
      color: textColor,
      letterSpacing: 0.5,
    },
    headline: {
      fontSize: 12,
      fontWeight: "300",
      color: "#999999",
      marginTop: 4,
    },
    headerRule: {
      height: 1,
      backgroundColor: primaryColor,
      marginTop: 10,
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      fontSize: 8.5,
      color: "#777777",
      marginBottom: 4,
    },
    contactSeparator: {
      marginHorizontal: 6,
      color: "#bbbbbb",
    },
    sectionHeading: {
      fontSize: 9,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 3,
      color: primaryColor,
      marginTop: 20,
      marginBottom: 8,
    },
    itemContainer: {
      marginBottom: 10,
    },
    itemTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    itemTitle: {
      fontSize: 11,
      fontWeight: "700",
      color: textColor,
    },
    itemPeriod: {
      fontSize: 9,
      fontWeight: "400",
      color: "#888888",
    },
    itemSubtitle: {
      fontSize: 10,
      fontWeight: "400",
      color: "#555555",
      marginTop: 1,
    },
    itemDescription: {
      fontSize: 9,
      color: "#444444",
      lineHeight: 1.5,
      marginTop: 3,
    },
    itemMeta: {
      fontSize: 8.5,
      color: "#888888",
      marginTop: 1,
    },
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 2,
    },
    skillTag: {
      fontSize: 8.5,
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 2,
      borderWidth: 0.5,
      borderColor: primaryColor,
      color: primaryColor,
    },
    languageRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 2,
    },
    languageItem: {
      fontSize: 9.5,
      color: textColor,
    },
    languageFluency: {
      fontSize: 8.5,
      color: "#888888",
    },
    link: {
      textDecoration: "none",
    },
  });

  const contactItems: React.ReactNode[] = [];

  if (data.basics.email) {
    contactItems.push(
      <Link key="email" src={`mailto:${data.basics.email}`} style={[styles.link, { color: "#777777" }]}>
        {data.basics.email}
      </Link>,
    );
  }

  if (data.basics.phone) {
    contactItems.push(
      <Link key="phone" src={`tel:${data.basics.phone}`} style={[styles.link, { color: "#777777" }]}>
        {data.basics.phone}
      </Link>,
    );
  }

  if (data.basics.location) {
    contactItems.push(<Text key="location">{data.basics.location}</Text>);
  }

  if (data.basics.website?.url) {
    contactItems.push(
      <Link key="website" src={data.basics.website.url} style={[styles.link, { color: primaryColor }]}>
        {data.basics.website.label || data.basics.website.url}
      </Link>,
    );
  }

  for (const field of data.basics.customFields) {
    if (field.link) {
      contactItems.push(
        <Link key={field.id} src={field.link} style={[styles.link, { color: "#777777" }]}>
          {field.text}
        </Link>,
      );
    } else {
      contactItems.push(<Text key={field.id}>{field.text}</Text>);
    }
  }

  const pictureBlock =
    !data.picture.hidden && data.picture.url ? (
      <View style={{ marginBottom: 12, alignItems: "center" }}>
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

  const experienceSection = data.sections.experience;
  const experienceBlock =
    !experienceSection.hidden && experienceSection.items.length > 0 ? (
      <View>
        <Text style={styles.sectionHeading}>{experienceSection.title || "Experience"}</Text>
        {experienceSection.items
          .filter((item) => !item.hidden)
          .map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemTitle}>{item.company}</Text>
                {item.period ? <Text style={styles.itemPeriod}>{item.period}</Text> : null}
              </View>
              {item.position ? <Text style={styles.itemSubtitle}>{item.position}</Text> : null}
              {item.location ? <Text style={styles.itemMeta}>{item.location}</Text> : null}
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
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
    ) : null;

  const educationSection = data.sections.education;
  const educationBlock =
    !educationSection.hidden && educationSection.items.length > 0 ? (
      <View>
        <Text style={styles.sectionHeading}>{educationSection.title || "Education"}</Text>
        {educationSection.items
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
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
            </View>
          ))}
      </View>
    ) : null;

  const skillsSection = data.sections.skills;
  const skillsBlock =
    !skillsSection.hidden && skillsSection.items.length > 0 ? (
      <View>
        <Text style={styles.sectionHeading}>{skillsSection.title || "Skills"}</Text>
        <View style={styles.skillsRow}>
          {skillsSection.items
            .filter((item) => !item.hidden)
            .map((item) => (
              <Text key={item.id} style={styles.skillTag}>
                {item.name}
              </Text>
            ))}
        </View>
      </View>
    ) : null;

  const languagesSection = data.sections.languages;
  const languagesBlock =
    !languagesSection.hidden && languagesSection.items.length > 0 ? (
      <View>
        <Text style={styles.sectionHeading}>{languagesSection.title || "Languages"}</Text>
        <View style={styles.languageRow}>
          {languagesSection.items
            .filter((item) => !item.hidden)
            .map((item) => (
              <View key={item.id}>
                <Text style={styles.languageItem}>
                  {item.language}
                  {item.fluency ? <Text style={styles.languageFluency}>{`  ${item.fluency}`}</Text> : null}
                </Text>
              </View>
            ))}
        </View>
      </View>
    ) : null;

  const projectsSection = data.sections.projects;
  const projectsBlock =
    !projectsSection.hidden && projectsSection.items.length > 0 ? (
      <View>
        <Text style={styles.sectionHeading}>{projectsSection.title || "Projects"}</Text>
        {projectsSection.items
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
              {item.description ? <Text style={styles.itemDescription}>{stripHtml(item.description)}</Text> : null}
            </View>
          ))}
      </View>
    ) : null;

  const customSectionBlocks = data.customSections
    .filter((section) => !section.hidden)
    .map((section) => {
      const visibleItems = section.items.filter((i) => !i.hidden);
      if (visibleItems.length === 0) return null;

      return (
        <View key={section.id}>
          <Text style={styles.sectionHeading}>{section.title}</Text>
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

  return (
    <View style={styles.container}>
      {pictureBlock}
      <View>
        <Text style={styles.name}>{data.basics.name}</Text>
        {data.basics.headline ? <Text style={styles.headline}>{data.basics.headline}</Text> : null}
        <View style={styles.headerRule} />
        <View style={styles.contactRow}>
          {contactItems.map((item, index) => (
            <View key={index} style={{ flexDirection: "row", alignItems: "center" }}>
              {index > 0 ? <Text style={styles.contactSeparator}>{" \u00B7 "}</Text> : null}
              {item}
            </View>
          ))}
        </View>
      </View>
      {!data.summary.hidden && data.summary.content ? (
        <View>
          <Text style={styles.sectionHeading}>{data.summary.title || "Summary"}</Text>
          <Text style={styles.itemDescription}>{stripHtml(data.summary.content)}</Text>
        </View>
      ) : null}
      {experienceBlock}
      {educationBlock}
      {skillsBlock}
      {languagesBlock}
      {projectsBlock}
      {customSectionBlocks}
    </View>
  );
}
