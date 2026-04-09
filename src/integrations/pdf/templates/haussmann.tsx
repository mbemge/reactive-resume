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
// Styles
// ---------------------------------------------------------------------------

function createStyles(colors: ResumeData["metadata"]["design"]["colors"]) {
  return StyleSheet.create({
    // Layout
    page: {
      flexDirection: "row",
      fontFamily: "Helvetica",
      fontSize: 9.5,
      lineHeight: 1.5,
      color: colors.text,
      backgroundColor: colors.background,
    },

    // Sidebar
    sidebar: {
      width: "35%",
      backgroundColor: colors.primary,
      paddingVertical: 24,
      paddingHorizontal: 18,
      color: "#ffffff",
    },
    sidebarSection: {
      marginTop: 12,
    },
    sidebarSectionHeading: {
      fontSize: 10,
      fontWeight: "700",
      color: "#ffffff",
      textTransform: "uppercase",
      letterSpacing: 1,
      borderBottomWidth: 0.75,
      borderBottomColor: "rgba(255,255,255,0.35)",
      paddingBottom: 3,
      marginBottom: 6,
    },

    // Photo
    photoContainer: {
      alignItems: "center",
      marginBottom: 14,
    },
    photo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2.5,
      borderColor: "#ffffff",
      objectFit: "cover",
    },

    // Name / headline in sidebar
    name: {
      fontSize: 18,
      fontWeight: "700",
      color: "#ffffff",
      marginBottom: 2,
      textAlign: "center",
    },
    headline: {
      fontSize: 10,
      fontWeight: "400",
      color: "rgba(255,255,255,0.85)",
      textAlign: "center",
      marginBottom: 14,
    },

    // Contact block in sidebar
    contactRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    contactLabel: {
      fontSize: 8,
      fontWeight: "600",
      color: "rgba(255,255,255,0.65)",
      width: 50,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    contactValue: {
      fontSize: 9,
      fontWeight: "400",
      color: "#ffffff",
      flex: 1,
    },
    contactLink: {
      fontSize: 9,
      fontWeight: "400",
      color: "#ffffff",
      textDecoration: "none",
    },

    // Sidebar items (skills, languages, interests)
    sidebarItem: {
      marginBottom: 6,
    },
    sidebarItemName: {
      fontSize: 9.5,
      fontWeight: "600",
      color: "#ffffff",
    },
    sidebarItemDetail: {
      fontSize: 8.5,
      fontWeight: "400",
      color: "rgba(255,255,255,0.75)",
    },
    keywordRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 3,
      marginTop: 2,
    },
    keyword: {
      fontSize: 8,
      fontWeight: "400",
      color: "#ffffff",
      backgroundColor: "rgba(255,255,255,0.15)",
      paddingHorizontal: 5,
      paddingVertical: 1.5,
      borderRadius: 3,
    },

    // Main content
    main: {
      width: "65%",
      paddingVertical: 24,
      paddingHorizontal: 22,
    },
    mainSection: {
      marginBottom: 12,
    },
    mainSectionHeading: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
      borderBottomWidth: 0.75,
      borderBottomColor: colors.primary,
      paddingBottom: 3,
      marginBottom: 6,
    },

    // Items in main area
    item: {
      marginBottom: 8,
    },
    itemTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    itemTitle: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.text,
    },
    itemPeriod: {
      fontSize: 8.5,
      fontWeight: "400",
      color: colors.text,
      opacity: 0.6,
    },
    itemSubtitle: {
      fontSize: 9,
      fontWeight: "600",
      color: colors.text,
      opacity: 0.75,
      marginTop: 1,
    },
    itemDescription: {
      fontSize: 9.5,
      fontWeight: "400",
      color: colors.text,
      marginTop: 3,
      lineHeight: 1.5,
    },
    itemLink: {
      fontSize: 8.5,
      fontWeight: "400",
      color: colors.primary,
      textDecoration: "none",
      marginTop: 2,
    },

    // Summary
    summaryText: {
      fontSize: 9.5,
      fontWeight: "400",
      color: colors.text,
      lineHeight: 1.5,
    },
  });
}

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

export function HaussmannTemplate({ data }: { data: ResumeData }) {
  const { basics, picture, summary, sections, customSections, metadata } = data;
  const colors = metadata.design.colors;
  const styles = createStyles(colors);

  // ---- Sidebar helpers ----

  const showPhoto = !picture.hidden && !!picture.url;
  const hasContact = !!basics.email || !!basics.phone || !!basics.location;

  const visibleSkills = sections.skills.hidden ? [] : sections.skills.items.filter((i) => !i.hidden);

  const visibleLanguages = sections.languages.hidden ? [] : sections.languages.items.filter((i) => !i.hidden);

  const visibleInterests = sections.interests.hidden ? [] : sections.interests.items.filter((i) => !i.hidden);

  // ---- Main-area sections ----

  const visibleExperience = sections.experience.hidden ? [] : sections.experience.items.filter((i) => !i.hidden);

  const visibleEducation = sections.education.hidden ? [] : sections.education.items.filter((i) => !i.hidden);

  const visibleProjects = sections.projects.hidden ? [] : sections.projects.items.filter((i) => !i.hidden);

  const visibleAwards = sections.awards.hidden ? [] : sections.awards.items.filter((i) => !i.hidden);

  const visibleCertifications = sections.certifications.hidden
    ? []
    : sections.certifications.items.filter((i) => !i.hidden);

  const visiblePublications = sections.publications.hidden ? [] : sections.publications.items.filter((i) => !i.hidden);

  const visibleVolunteer = sections.volunteer.hidden ? [] : sections.volunteer.items.filter((i) => !i.hidden);

  const visibleReferences = sections.references.hidden ? [] : sections.references.items.filter((i) => !i.hidden);

  const visibleProfiles = sections.profiles.hidden ? [] : sections.profiles.items.filter((i) => !i.hidden);

  return (
    <View style={styles.page}>
      {/* ========================= SIDEBAR ========================= */}
      <View style={styles.sidebar}>
        {/* Photo */}
        {showPhoto && (
          <View style={styles.photoContainer}>
            <Image src={picture.url} style={styles.photo} />
          </View>
        )}

        {/* Name & headline */}
        <Text style={styles.name}>{basics.name}</Text>
        {!!basics.headline && <Text style={styles.headline}>{basics.headline}</Text>}

        {/* Contact */}
        {hasContact && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionHeading}>Contact</Text>

            {!!basics.email && (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Email</Text>
                <Link src={`mailto:${basics.email}`} style={styles.contactLink}>
                  {basics.email}
                </Link>
              </View>
            )}

            {!!basics.phone && (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Link src={`tel:${basics.phone}`} style={styles.contactLink}>
                  {basics.phone}
                </Link>
              </View>
            )}

            {!!basics.location && (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue}>{basics.location}</Text>
              </View>
            )}

            {!!basics.website.url && (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Web</Text>
                <Link src={basics.website.url} style={styles.contactLink}>
                  {basics.website.label || basics.website.url}
                </Link>
              </View>
            )}
          </View>
        )}

        {/* Skills */}
        {visibleSkills.length > 0 && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionHeading}>{sections.skills.title || "Skills"}</Text>
            {visibleSkills.map((skill) => (
              <View key={skill.id} style={styles.sidebarItem}>
                <Text style={styles.sidebarItemName}>{skill.name}</Text>
                {skill.keywords.length > 0 && (
                  <View style={styles.keywordRow}>
                    {skill.keywords.map((kw, idx) => (
                      <Text key={idx} style={styles.keyword}>
                        {kw}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {visibleLanguages.length > 0 && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionHeading}>{sections.languages.title || "Languages"}</Text>
            {visibleLanguages.map((lang) => (
              <View key={lang.id} style={styles.sidebarItem}>
                <Text style={styles.sidebarItemName}>{lang.language}</Text>
                {!!lang.fluency && <Text style={styles.sidebarItemDetail}>{lang.fluency}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Interests */}
        {visibleInterests.length > 0 && (
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionHeading}>{sections.interests.title || "Interests"}</Text>
            {visibleInterests.map((interest) => (
              <View key={interest.id} style={styles.sidebarItem}>
                <Text style={styles.sidebarItemName}>{interest.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ========================= MAIN CONTENT ========================= */}
      <View style={styles.main}>
        {/* Summary */}
        {!summary.hidden && !!stripHtml(summary.content) && (
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionHeading}>{summary.title || "Summary"}</Text>
            <Text style={styles.summaryText}>{stripHtml(summary.content)}</Text>
          </View>
        )}

        {/* Experience */}
        {visibleExperience.length > 0 && (
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionHeading}>{sections.experience.title || "Experience"}</Text>
            {visibleExperience.map((exp) => (
              <View key={exp.id} style={styles.item}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>{exp.company}</Text>
                  {!!exp.period && <Text style={styles.itemPeriod}>{exp.period}</Text>}
                </View>
                {!!exp.position && (
                  <Text style={styles.itemSubtitle}>
                    {exp.position}
                    {exp.location ? ` — ${exp.location}` : ""}
                  </Text>
                )}
                {exp.roles.length > 0 &&
                  exp.roles.map((role) => (
                    <View key={role.id} style={{ marginTop: 4, marginLeft: 6 }}>
                      <View style={styles.itemTitleRow}>
                        <Text style={styles.itemSubtitle}>{role.position}</Text>
                        {!!role.period && <Text style={styles.itemPeriod}>{role.period}</Text>}
                      </View>
                      {!!stripHtml(role.description) && (
                        <Text style={styles.itemDescription}>{stripHtml(role.description)}</Text>
                      )}
                    </View>
                  ))}
                {!!stripHtml(exp.description) && (
                  <Text style={styles.itemDescription}>{stripHtml(exp.description)}</Text>
                )}
                {!!exp.website.url && (
                  <Link src={exp.website.url} style={styles.itemLink}>
                    {exp.website.label || exp.website.url}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {visibleEducation.length > 0 && (
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionHeading}>{sections.education.title || "Education"}</Text>
            {visibleEducation.map((edu) => (
              <View key={edu.id} style={styles.item}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>{edu.school}</Text>
                  {!!edu.period && <Text style={styles.itemPeriod}>{edu.period}</Text>}
                </View>
                {(!!edu.degree || !!edu.area) && (
                  <Text style={styles.itemSubtitle}>
                    {[edu.degree, edu.area].filter(Boolean).join(" in ")}
                    {edu.grade ? ` — ${edu.grade}` : ""}
                  </Text>
                )}
                {!!stripHtml(edu.description) && (
                  <Text style={styles.itemDescription}>{stripHtml(edu.description)}</Text>
                )}
                {!!edu.website.url && (
                  <Link src={edu.website.url} style={styles.itemLink}>
                    {edu.website.label || edu.website.url}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {visibleProjects.length > 0 && (
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionHeading}>{sections.projects.title || "Projects"}</Text>
            {visibleProjects.map((proj) => (
              <View key={proj.id} style={styles.item}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>{proj.name}</Text>
                  {!!proj.period && <Text style={styles.itemPeriod}>{proj.period}</Text>}
                </View>
                {!!stripHtml(proj.description) && (
                  <Text style={styles.itemDescription}>{stripHtml(proj.description)}</Text>
                )}
                {!!proj.website.url && (
                  <Link src={proj.website.url} style={styles.itemLink}>
                    {proj.website.label || proj.website.url}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Awards */}
        {visibleAwards.length > 0 && (
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionHeading}>{sections.awards.title || "Awards"}</Text>
            {visibleAwards.map((award) => (
              <View key={award.id} style={styles.item}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>{award.title}</Text>
                  {!!award.date && <Text style={styles.itemPeriod}>{award.date}</Text>}
                </View>
                {!!award.awarder && <Text style={styles.itemSubtitle}>{award.awarder}</Text>}
                {!!stripHtml(award.description) && (
                  <Text style={styles.itemDescription}>{stripHtml(award.description)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {visibleCertifications.length > 0 && (
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionHeading}>{sections.certifications.title || "Certifications"}</Text>
            {visibleCertifications.map((cert) => (
              <View key={cert.id} style={styles.item}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>{cert.title}</Text>
                  {!!cert.date && <Text style={styles.itemPeriod}>{cert.date}</Text>}
                </View>
                {!!cert.issuer && <Text style={styles.itemSubtitle}>{cert.issuer}</Text>}
                {!!stripHtml(cert.description) && (
                  <Text style={styles.itemDescription}>{stripHtml(cert.description)}</Text>
                )}
                {!!cert.website.url && (
                  <Link src={cert.website.url} style={styles.itemLink}>
                    {cert.website.label || cert.website.url}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Publications */}
        {visiblePublications.length > 0 && (
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionHeading}>{sections.publications.title || "Publications"}</Text>
            {visiblePublications.map((pub) => (
              <View key={pub.id} style={styles.item}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>{pub.title}</Text>
                  {!!pub.date && <Text style={styles.itemPeriod}>{pub.date}</Text>}
                </View>
                {!!pub.publisher && <Text style={styles.itemSubtitle}>{pub.publisher}</Text>}
                {!!stripHtml(pub.description) && (
                  <Text style={styles.itemDescription}>{stripHtml(pub.description)}</Text>
                )}
                {!!pub.website.url && (
                  <Link src={pub.website.url} style={styles.itemLink}>
                    {pub.website.label || pub.website.url}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Volunteer */}
        {visibleVolunteer.length > 0 && (
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionHeading}>{sections.volunteer.title || "Volunteer"}</Text>
            {visibleVolunteer.map((vol) => (
              <View key={vol.id} style={styles.item}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>{vol.organization}</Text>
                  {!!vol.period && <Text style={styles.itemPeriod}>{vol.period}</Text>}
                </View>
                {!!vol.location && <Text style={styles.itemSubtitle}>{vol.location}</Text>}
                {!!stripHtml(vol.description) && (
                  <Text style={styles.itemDescription}>{stripHtml(vol.description)}</Text>
                )}
                {!!vol.website.url && (
                  <Link src={vol.website.url} style={styles.itemLink}>
                    {vol.website.label || vol.website.url}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* References */}
        {visibleReferences.length > 0 && (
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionHeading}>{sections.references.title || "References"}</Text>
            {visibleReferences.map((ref) => (
              <View key={ref.id} style={styles.item}>
                <Text style={styles.itemTitle}>{ref.name}</Text>
                {!!ref.position && <Text style={styles.itemSubtitle}>{ref.position}</Text>}
                {!!stripHtml(ref.description) && (
                  <Text style={styles.itemDescription}>{stripHtml(ref.description)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Profiles */}
        {visibleProfiles.length > 0 && (
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionHeading}>{sections.profiles.title || "Profiles"}</Text>
            {visibleProfiles.map((profile) => (
              <View key={profile.id} style={styles.sidebarItem}>
                <Text style={styles.itemTitle}>{profile.network}</Text>
                {!!profile.username && <Text style={styles.itemSubtitle}>{profile.username}</Text>}
                {!!profile.website.url && (
                  <Link src={profile.website.url} style={styles.itemLink}>
                    {profile.website.label || profile.website.url}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Custom sections */}
        {customSections
          .filter((section) => !section.hidden)
          .map((section) => {
            const visibleItems = section.items.filter((i) => !i.hidden);
            if (visibleItems.length === 0) return null;

            return (
              <View key={section.id} style={styles.mainSection}>
                <Text style={styles.mainSectionHeading}>{section.title}</Text>
                {visibleItems.map((item) => {
                  // Render based on common fields available in the union type
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
                    <View key={item.id} style={styles.item}>
                      {!!title && (
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemTitle}>{title}</Text>
                          {!!period && <Text style={styles.itemPeriod}>{period}</Text>}
                        </View>
                      )}
                      {!!subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
                      {!!stripHtml(description) && <Text style={styles.itemDescription}>{stripHtml(description)}</Text>}
                      {!!website?.url && (
                        <Link src={website.url} style={styles.itemLink}>
                          {website.label || website.url}
                        </Link>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
      </View>
    </View>
  );
}
