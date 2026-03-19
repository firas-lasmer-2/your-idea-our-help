import { Mail, Phone, MapPin, Linkedin, Github, Award, BookOpen, Stethoscope, Wrench as WrenchIcon } from "lucide-react";
import { ResumeCustomization, ResumeData } from "@/types/resume";
import { normalizeResumeTemplateId, type ResumeTemplateId } from "@/lib/template-recommendations";

interface Props {
  data: ResumeData;
  customization: ResumeCustomization;
  template: string;
}

interface LayoutProps {
  data: ResumeData;
  customization: ResumeCustomization;
  color: string;
  fullName: string;
  spacing: string;
}

const ResumePreview = ({ data, customization, template }: Props) => {
  const { personalInfo, education, experience } = data;
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  if (!fullName && education.length === 0 && experience.length === 0) {
    return (
      <div className="py-16 text-center" style={{ color: "#94a3b8" }}>
        <p style={{ fontSize: "18px" }}>📄</p>
        <p style={{ fontSize: "14px", marginTop: "8px" }}>CV Preview</p>
      </div>
    );
  }

  const normalizedTemplate = normalizeResumeTemplateId(template);
  const spacing = customization.spacing === "compact" ? "10px" : customization.spacing === "spacious" ? "24px" : "16px";
  const layoutProps = {
    data,
    customization,
    color: customization.accentColor,
    fullName,
    spacing,
  };

  switch (normalizedTemplate) {
    case "essentiel":
      return <EssentielLayout {...layoutProps} />;
    case "trajectoire":
      return <TrajectoireLayout {...layoutProps} />;
    case "direction":
      return <DirectionLayout {...layoutProps} />;
    case "signature":
      return <SignatureLayout {...layoutProps} />;
    case "academique":
      return <AcademiqueLayout {...layoutProps} />;
    case "medical":
      return <MedicalLayout {...layoutProps} />;
    case "technique":
      return <TechniqueLayout {...layoutProps} />;
    case "horizon":
    default:
      return <HorizonLayout {...layoutProps} />;
  }
};

function getPhoto(personalInfo: ResumeData["personalInfo"], customization: ResumeCustomization) {
  return customization.showPhoto && personalInfo.photoUrl ? personalInfo.photoUrl : "";
}

function ContactRow({
  info,
  align = "left",
  textColor = "#64748b",
  iconColor = "#64748b",
}: {
  info: ResumeData["personalInfo"];
  align?: "left" | "center";
  textColor?: string;
  iconColor?: string;
}) {
  const items = [
    info.email && { icon: Mail, text: info.email },
    info.phone && { icon: Phone, text: info.phone },
    info.city && { icon: MapPin, text: info.city },
    info.linkedIn && { icon: Linkedin, text: info.linkedIn },
    info.github && { icon: Github, text: info.github },
  ].filter(Boolean) as { icon: typeof Mail; text: string }[];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px 14px",
        justifyContent: align === "center" ? "center" : "flex-start",
      }}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <span
            key={`${item.text}-${index}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textColor, fontSize: "11px" }}
          >
            <Icon style={{ width: 11, height: 11, color: iconColor }} />
            <span>{item.text}</span>
          </span>
        );
      })}
    </div>
  );
}

function SectionTitle({
  title,
  color,
  eyebrow,
}: {
  title: string;
  color: string;
  eyebrow?: string;
}) {
  return (
    <div style={{ marginBottom: "10px" }}>
      {eyebrow ? (
        <p style={{ margin: 0, fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#94a3b8" }}>
          {eyebrow}
        </p>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h2 style={{ margin: 0, fontSize: "13px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: "1px", background: `${color}33` }} />
      </div>
    </div>
  );
}

function SummaryBlock({ text, color, variant = "plain" }: { text?: string; color: string; variant?: "plain" | "soft" | "quote" }) {
  if (!text) return null;
  const styles: Record<string, React.CSSProperties> = {
    plain: { fontSize: "12px", lineHeight: 1.75, color: "#475569" },
    soft: { fontSize: "12px", lineHeight: 1.75, color: "#334155", border: `1px solid ${color}22`, background: `${color}0f`, borderRadius: "16px", padding: "16px 18px" },
    quote: { fontSize: "12px", lineHeight: 1.8, color: "#334155", borderLeft: `4px solid ${color}`, paddingLeft: "14px", fontStyle: "italic" },
  };
  return <p style={{ margin: 0, ...styles[variant] }}>{text}</p>;
}

function ExperienceList({ items, color, bulletStyle = "dot" }: { items: ResumeData["experience"]; color: string; bulletStyle?: "dot" | "arrow" | "bar" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {items.map((item) => (
        <div key={item.id}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{item.position}</p>
              <p style={{ margin: "3px 0 0", fontSize: "11px", fontWeight: 600, color }}>{item.company}</p>
            </div>
            <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8", whiteSpace: "nowrap" }}>
              {[item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" - ")}
            </p>
          </div>
          {item.bullets.filter(Boolean).length > 0 ? (
            <ul style={{ listStyle: "none", paddingLeft: 0, margin: "7px 0 0", display: "flex", flexDirection: "column", gap: "4px" }}>
              {item.bullets.filter(Boolean).map((bullet, index) => (
                <li key={index} style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#475569", lineHeight: 1.6 }}>
                  <span style={{ color, fontWeight: 800 }}>
                    {bulletStyle === "arrow" ? ">" : bulletStyle === "bar" ? "|" : "•"}
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EducationList({ items }: { items: ResumeData["education"] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map((item) => (
        <div key={item.id}>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
            {item.degree}
            {item.field ? ` - ${item.field}` : ""}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
            {item.institution}
            {item.startDate || item.endDate ? ` - ${[item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" - ")}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

function SkillBlocks({ categories, color, mode = "chips" }: { categories: ResumeData["skillCategories"]; color: string; mode?: "chips" | "lines" }) {
  const active = categories.filter((category) => category.skills.length > 0);
  if (active.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {active.map((category) => (
        <div key={category.id}>
          <p style={{ margin: 0, fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b" }}>
            {category.name}
          </p>
          {mode === "lines" ? (
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#475569", lineHeight: 1.6 }}>{category.skills.join(" • ")}</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "6px" }}>
              {category.skills.map((skill, index) => (
                <span
                  key={`${category.id}-${index}`}
                  style={{
                    padding: "4px 9px",
                    borderRadius: "999px",
                    border: `1px solid ${color}26`,
                    background: `${color}10`,
                    color,
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CompactList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p style={{ margin: 0, fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b" }}>{title}</p>
      <p style={{ margin: "5px 0 0", fontSize: "11px", color: "#475569", lineHeight: 1.7 }}>{items.join(" • ")}</p>
    </div>
  );
}

function ProjectsList({ items, color, mode = "plain" }: { items: ResumeData["projects"]; color: string; mode?: "plain" | "cards" }) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={mode === "cards" ? { border: "1px solid #e2e8f0", borderRadius: "14px", padding: "12px 14px", background: "#fff" } : {}}
        >
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{item.name}</p>
          {item.description ? <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#475569", lineHeight: 1.6 }}>{item.description}</p> : null}
          {item.technologies.length > 0 ? (
            <p style={{ margin: "6px 0 0", fontSize: "10px", color }}>{item.technologies.join(" • ")}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function CertificationsList({ items, color }: { items: ResumeData["certifications"]; color: string }) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      {items.map((item) => (
        <div key={item.id}>
          <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>{item.name}</p>
          <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#64748b" }}>
            {[item.issuer, item.date].filter(Boolean).join(" - ")}
          </p>
          {item.url ? <p style={{ margin: "2px 0 0", fontSize: "10px", color }}>{item.url}</p> : null}
        </div>
      ))}
    </div>
  );
}

function BaseShell({
  children,
  background = "#ffffff",
  border = "1px solid #e2e8f0",
  fontFamily = "Inter, system-ui, sans-serif",
}: {
  children: React.ReactNode;
  background?: string;
  border?: string;
  fontFamily?: string;
}) {
  return (
    <div style={{ background, border, padding: "26px", color: "#0f172a", fontFamily, fontSize: "12px" }}>
      {children}
    </div>
  );
}

// ─── Essentiel ───
function EssentielLayout({ data, customization, color, fullName, spacing }: LayoutProps) {
  const photo = getPhoto(data.personalInfo, customization);

  return (
    <BaseShell border="1px solid #dbe4ee">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "flex-start", borderBottom: "2px solid #e2e8f0", paddingBottom: "18px" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 900, letterSpacing: "-0.03em" }}>{fullName || "Votre Nom"}</h1>
          <p style={{ margin: "6px 0 0", fontSize: "11px", fontWeight: 700, color }}>{data.jobTitle || "Profil professionnel"}</p>
          <div style={{ marginTop: "10px" }}>
            <ContactRow info={data.personalInfo} />
          </div>
        </div>
        {photo ? <img src={photo} alt="" style={{ width: "72px", height: "72px", borderRadius: "12px", objectFit: "cover" }} /> : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: spacing, marginTop: "18px" }}>
        <SummaryBlock text={data.summary} color={color} variant="plain" />

        {data.experience.length > 0 ? (
          <div>
            <SectionTitle title="Experience" color={color} />
            <ExperienceList items={data.experience} color={color} bulletStyle="dot" />
          </div>
        ) : null}

        {data.education.length > 0 ? (
          <div>
            <SectionTitle title="Formation" color={color} />
            <EducationList items={data.education} />
          </div>
        ) : null}

        {data.skillCategories.some((category) => category.skills.length > 0) ? (
          <div>
            <SectionTitle title="Competences" color={color} />
            <SkillBlocks categories={data.skillCategories} color={color} mode="lines" />
          </div>
        ) : null}

        {data.certifications.length > 0 ? (
          <div>
            <SectionTitle title="Certifications" color={color} />
            <CertificationsList items={data.certifications} color={color} />
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: data.projects.length > 0 ? "1fr 1fr" : "1fr", gap: "18px" }}>
          {data.projects.length > 0 ? (
            <div>
              <SectionTitle title="Projets" color={color} />
              <ProjectsList items={data.projects} color={color} />
            </div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.languages.length > 0 ? <CompactList title="Langues" items={data.languages.map((item) => `${item.name} (${item.level})`)} /> : null}
            {data.interests.length > 0 ? <CompactList title="Centres d'interet" items={data.interests} /> : null}
          </div>
        </div>
      </div>
    </BaseShell>
  );
}

// ─── Horizon ───
function HorizonLayout({ data, customization, color, fullName, spacing }: LayoutProps) {
  const photo = getPhoto(data.personalInfo, customization);

  return (
    <BaseShell background="#fbfdff" border="1px solid #e5edf5" fontFamily="'Manrope', Inter, system-ui, sans-serif">
      <div style={{ display: "grid", gridTemplateColumns: photo ? "1fr auto" : "1fr", gap: "18px", alignItems: "start" }}>
        <div>
          <p style={{ margin: 0, fontSize: "10px", fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color }}>
            {data.jobTitle || "Candidate profile"}
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: 900, letterSpacing: "-0.04em" }}>{fullName || "Votre Nom"}</h1>
          <div style={{ marginTop: "12px" }}>
            <ContactRow info={data.personalInfo} />
          </div>
        </div>
        {photo ? <img src={photo} alt="" style={{ width: "88px", height: "88px", borderRadius: "20px", objectFit: "cover", border: "1px solid #dbe4ee" }} /> : null}
      </div>

      <div style={{ marginTop: "14px", height: "5px", width: "180px", borderRadius: "999px", background: `linear-gradient(90deg, ${color}, ${color}00)` }} />

      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 0.95fr", gap: "18px", marginTop: "18px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing }}>
          <SummaryBlock text={data.summary} color={color} variant="soft" />
          {data.experience.length > 0 ? (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "18px", padding: "16px 18px", background: "#fff" }}>
              <SectionTitle title="Experience" color={color} eyebrow="Core" />
              <ExperienceList items={data.experience} color={color} bulletStyle="arrow" />
            </div>
          ) : null}
          {data.projects.length > 0 ? (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "18px", padding: "16px 18px", background: "#fff" }}>
              <SectionTitle title="Projets" color={color} eyebrow="Proof" />
              <ProjectsList items={data.projects} color={color} mode="cards" />
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {data.skillCategories.some((category) => category.skills.length > 0) ? (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "18px", padding: "16px 18px", background: "#fff" }}>
              <SectionTitle title="Competences" color={color} />
              <SkillBlocks categories={data.skillCategories} color={color} />
            </div>
          ) : null}
          {data.education.length > 0 ? (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "18px", padding: "16px 18px", background: "#fff" }}>
              <SectionTitle title="Formation" color={color} />
              <EducationList items={data.education} />
            </div>
          ) : null}
          {data.certifications.length > 0 ? (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "18px", padding: "16px 18px", background: "#fff" }}>
              <SectionTitle title="Certifications" color={color} />
              <CertificationsList items={data.certifications} color={color} />
            </div>
          ) : null}
          {data.languages.length > 0 ? (
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "18px", padding: "16px 18px", background: "#fff" }}>
              <CompactList title="Langues" items={data.languages.map((item) => `${item.name} (${item.level})`)} />
            </div>
          ) : null}
        </div>
      </div>
    </BaseShell>
  );
}

// ─── Trajectoire ───
function TrajectoireLayout({ data, customization, color, fullName, spacing }: LayoutProps) {
  const photo = getPhoto(data.personalInfo, customization);

  return (
    <BaseShell background="#ffffff" border="1px solid #dbe4ee" fontFamily="'IBM Plex Sans', Inter, system-ui, sans-serif">
      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 0.85fr", gap: "22px" }}>
        <div>
          <div style={{ borderBottom: `3px solid ${color}`, paddingBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontSize: "10px", fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color }}>Trajectoire</p>
                <h1 style={{ margin: "6px 0 0", fontSize: "31px", fontWeight: 900, letterSpacing: "-0.04em" }}>{fullName || "Votre Nom"}</h1>
                <p style={{ margin: "4px 0 0", fontSize: "11px", fontWeight: 700, color }}>{data.jobTitle || "Profil en progression"}</p>
              </div>
              {photo ? <img src={photo} alt="" style={{ width: "72px", height: "72px", borderRadius: "16px", objectFit: "cover" }} /> : null}
            </div>
            <div style={{ marginTop: "12px" }}>
              <ContactRow info={data.personalInfo} />
            </div>
          </div>

          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: spacing }}>
            <SummaryBlock text={data.summary} color={color} variant="quote" />
            {data.experience.length > 0 ? (
              <div>
                <SectionTitle title="Experience" color={color} eyebrow="Timeline" />
                <div style={{ borderLeft: `2px solid ${color}33`, marginLeft: "6px", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {data.experience.map((item) => (
                    <div key={item.id} style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: "-22px", top: "4px", width: "10px", height: "10px", borderRadius: "999px", background: color, boxShadow: `0 0 0 4px ${color}18` }} />
                      <ExperienceList items={[item]} color={color} bulletStyle="bar" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {data.skillCategories.some((category) => category.skills.length > 0) ? (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px" }}>
              <SectionTitle title="Competences" color={color} />
              <SkillBlocks categories={data.skillCategories} color={color} />
            </div>
          ) : null}
          {data.education.length > 0 ? (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px" }}>
              <SectionTitle title="Formation" color={color} />
              <EducationList items={data.education} />
            </div>
          ) : null}
          {data.projects.length > 0 ? (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px" }}>
              <SectionTitle title="Projets" color={color} />
              <ProjectsList items={data.projects} color={color} />
            </div>
          ) : null}
          {data.languages.length > 0 ? <CompactList title="Langues" items={data.languages.map((item) => `${item.name} (${item.level})`)} /> : null}
          {data.interests.length > 0 ? <CompactList title="Centres d'interet" items={data.interests} /> : null}
        </div>
      </div>
    </BaseShell>
  );
}

// ─── Direction ───
function DirectionLayout({ data, customization, color, fullName, spacing }: LayoutProps) {
  const photo = getPhoto(data.personalInfo, customization);

  return (
    <BaseShell background="#fffdfa" border="1px solid #ece5db" fontFamily="'Source Serif 4', Georgia, serif">
      <div style={{ textAlign: "center", borderBottom: "1px solid #d6cfc4", paddingBottom: "18px" }}>
        <p style={{ margin: 0, fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase", color: "#7c6f60" }}>
          {data.jobTitle || "Executive profile"}
        </p>
        <h1 style={{ margin: "10px 0 0", fontSize: "34px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{fullName || "Votre Nom"}</h1>
        <div style={{ marginTop: "12px" }}>
          <ContactRow info={data.personalInfo} align="center" textColor="#6b665f" iconColor={color} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: photo ? "1.2fr 0.8fr" : "1fr", gap: "22px", marginTop: "18px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing }}>
          <SummaryBlock text={data.summary} color={color} variant="quote" />
          {data.experience.length > 0 ? (
            <div>
              <SectionTitle title="Experience" color={color} eyebrow="Leadership" />
              <ExperienceList items={data.experience} color={color} bulletStyle="bar" />
            </div>
          ) : null}
          {data.projects.length > 0 ? (
            <div>
              <SectionTitle title="Initiatives clefs" color={color} />
              <ProjectsList items={data.projects} color={color} />
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {photo ? <img src={photo} alt="" style={{ width: "100%", maxWidth: "160px", borderRadius: "18px", objectFit: "cover", alignSelf: "center" }} /> : null}
          {data.education.length > 0 ? (
            <div style={{ borderTop: `3px solid ${color}`, paddingTop: "12px" }}>
              <SectionTitle title="Formation" color={color} />
              <EducationList items={data.education} />
            </div>
          ) : null}
          {data.skillCategories.some((category) => category.skills.length > 0) ? (
            <div style={{ borderTop: `3px solid ${color}`, paddingTop: "12px" }}>
              <SectionTitle title="Expertise" color={color} />
              <SkillBlocks categories={data.skillCategories} color={color} mode="lines" />
            </div>
          ) : null}
          {data.certifications.length > 0 ? (
            <div style={{ borderTop: `3px solid ${color}`, paddingTop: "12px" }}>
              <SectionTitle title="Certifications" color={color} />
              <CertificationsList items={data.certifications} color={color} />
            </div>
          ) : null}
          {data.languages.length > 0 ? <CompactList title="Langues" items={data.languages.map((item) => `${item.name} (${item.level})`)} /> : null}
        </div>
      </div>
    </BaseShell>
  );
}

// ─── Signature ───
function SignatureLayout({ data, customization, color, fullName, spacing }: LayoutProps) {
  const photo = getPhoto(data.personalInfo, customization);

  return (
    <BaseShell background="#ffffff" border="1px solid #dae4f0" fontFamily="'Space Grotesk', Inter, system-ui, sans-serif">
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100%" }}>
        <div style={{ background: `linear-gradient(180deg, ${color}, ${color}dd)`, color: "#fff", padding: "22px 18px", borderRadius: "18px 0 0 18px", margin: "-26px 0 -26px -26px" }}>
          {photo ? <img src={photo} alt="" style={{ width: "92px", height: "92px", borderRadius: "18px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.25)" }} /> : null}
          <h1 style={{ margin: photo ? "18px 0 0" : 0, fontSize: "26px", lineHeight: 1.05, fontWeight: 900 }}>{fullName || "Votre Nom"}</h1>
          <p style={{ margin: "8px 0 0", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.78)" }}>
            {data.jobTitle || "Signature profile"}
          </p>
          <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <ContactRow info={data.personalInfo} textColor="rgba(255,255,255,0.9)" iconColor="#ffffff" />
          </div>
          {data.skillCategories.some((category) => category.skills.length > 0) ? (
            <div style={{ marginTop: "22px" }}>
              <p style={{ margin: 0, fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.75)" }}>
                Competences
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                {data.skillCategories.flatMap((category) => category.skills).slice(0, 10).map((skill, index) => (
                  <span key={`${skill}-${index}`} style={{ padding: "4px 8px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", fontSize: "10px", fontWeight: 700 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ padding: "0 0 0 22px", display: "flex", flexDirection: "column", gap: spacing }}>
          <SummaryBlock text={data.summary} color={color} variant="soft" />
          {data.experience.length > 0 ? (
            <div>
              <SectionTitle title="Experience" color={color} eyebrow="Impact" />
              <ExperienceList items={data.experience} color={color} bulletStyle="arrow" />
            </div>
          ) : null}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            {data.projects.length > 0 ? (
              <div>
                <SectionTitle title="Projets" color={color} />
                <ProjectsList items={data.projects} color={color} mode="cards" />
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.education.length > 0 ? (
                <div>
                  <SectionTitle title="Formation" color={color} />
                  <EducationList items={data.education} />
                </div>
              ) : null}
              {data.certifications.length > 0 ? (
                <div>
                  <SectionTitle title="Certifications" color={color} />
                  <CertificationsList items={data.certifications} color={color} />
                </div>
              ) : null}
              {data.languages.length > 0 ? <CompactList title="Langues" items={data.languages.map((item) => `${item.name} (${item.level})`)} /> : null}
            </div>
          </div>
        </div>
      </div>
    </BaseShell>
  );
}

// ─── Académique (NEW) ───
function AcademiqueLayout({ data, customization, color, fullName, spacing }: LayoutProps) {
  const photo = getPhoto(data.personalInfo, customization);

  return (
    <BaseShell background="#fafbfd" border="1px solid #d4dae5" fontFamily="'Merriweather', 'Source Serif 4', Georgia, serif">
      <div style={{ borderBottom: `2px solid ${color}`, paddingBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700, letterSpacing: "0.01em", color: "#1e293b" }}>{fullName || "Votre Nom"}</h1>
            <p style={{ margin: "6px 0 0", fontSize: "12px", fontWeight: 600, color, letterSpacing: "0.04em" }}>
              {data.jobTitle || "Profil académique"}
            </p>
          </div>
          {photo ? <img src={photo} alt="" style={{ width: "76px", height: "76px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${color}33` }} /> : null}
        </div>
        <div style={{ marginTop: "10px" }}>
          <ContactRow info={data.personalInfo} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: spacing, marginTop: "18px" }}>
        <SummaryBlock text={data.summary} color={color} variant="quote" />

        {/* Education first — key for academic CVs */}
        {data.education.length > 0 ? (
          <div>
            <SectionTitle title="Formation & Diplômes" color={color} />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {data.education.map((item) => (
                <div key={item.id} style={{ paddingLeft: "14px", borderLeft: `3px solid ${color}22` }}>
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                    {item.degree}{item.field ? ` — ${item.field}` : ""}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color }}>
                    {item.institution}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#94a3b8" }}>
                    {[item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" — ")}
                  </p>
                  {item.description ? <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#475569", lineHeight: 1.6 }}>{item.description}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Projects as "Publications / Recherche" */}
        {data.projects.length > 0 ? (
          <div>
            <SectionTitle title="Publications & Recherche" color={color} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {data.projects.map((item) => (
                <div key={item.id}>
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#0f172a", fontStyle: "italic" }}>{item.name}</p>
                  {item.description ? <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#475569", lineHeight: 1.6 }}>{item.description}</p> : null}
                  {item.technologies.length > 0 ? (
                    <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#64748b" }}>Mots-clés : {item.technologies.join(", ")}</p>
                  ) : null}
                  {item.url ? <p style={{ margin: "2px 0 0", fontSize: "10px", color }}>{item.url}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {data.experience.length > 0 ? (
          <div>
            <SectionTitle title="Expérience professionnelle" color={color} />
            <ExperienceList items={data.experience} color={color} bulletStyle="dot" />
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          {data.skillCategories.some((c) => c.skills.length > 0) ? (
            <div>
              <SectionTitle title="Compétences" color={color} />
              <SkillBlocks categories={data.skillCategories} color={color} mode="lines" />
            </div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.certifications.length > 0 ? (
              <div>
                <SectionTitle title="Certifications & Prix" color={color} />
                <CertificationsList items={data.certifications} color={color} />
              </div>
            ) : null}
            {data.languages.length > 0 ? <CompactList title="Langues" items={data.languages.map((l) => `${l.name} (${l.level})`)} /> : null}
            {data.interests.length > 0 ? <CompactList title="Centres d'intérêt" items={data.interests} /> : null}
          </div>
        </div>
      </div>
    </BaseShell>
  );
}

// ─── Médical (NEW) ───
function MedicalLayout({ data, customization, color, fullName, spacing }: LayoutProps) {
  const photo = getPhoto(data.personalInfo, customization);

  return (
    <BaseShell background="#ffffff" border="1px solid #d0dce8" fontFamily="'Inter', system-ui, sans-serif">
      <div style={{ display: "flex", gap: "18px", alignItems: "flex-start", borderBottom: `3px solid ${color}`, paddingBottom: "16px" }}>
        {photo ? <img src={photo} alt="" style={{ width: "80px", height: "80px", borderRadius: "14px", objectFit: "cover", border: `2px solid ${color}33` }} /> : null}
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 900, letterSpacing: "-0.02em" }}>{fullName || "Votre Nom"}</h1>
          <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {data.jobTitle || "Professionnel de santé"}
          </p>
          <div style={{ marginTop: "10px" }}>
            <ContactRow info={data.personalInfo} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.75fr", gap: "22px", marginTop: "18px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing }}>
          <SummaryBlock text={data.summary} color={color} variant="plain" />

          {data.experience.length > 0 ? (
            <div>
              <SectionTitle title="Expérience clinique" color={color} />
              <ExperienceList items={data.experience} color={color} bulletStyle="dot" />
            </div>
          ) : null}

          {data.projects.length > 0 ? (
            <div>
              <SectionTitle title="Cas cliniques & Projets" color={color} />
              <ProjectsList items={data.projects} color={color} />
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Certifications prominent for medical */}
          {data.certifications.length > 0 ? (
            <div style={{ background: `${color}08`, border: `1px solid ${color}20`, borderRadius: "14px", padding: "14px" }}>
              <SectionTitle title="Diplômes & Certifications" color={color} />
              <CertificationsList items={data.certifications} color={color} />
            </div>
          ) : null}

          {data.education.length > 0 ? (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px" }}>
              <SectionTitle title="Formation" color={color} />
              <EducationList items={data.education} />
            </div>
          ) : null}

          {data.skillCategories.some((c) => c.skills.length > 0) ? (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px" }}>
              <SectionTitle title="Compétences cliniques" color={color} />
              <SkillBlocks categories={data.skillCategories} color={color} mode="chips" />
            </div>
          ) : null}

          {data.languages.length > 0 ? <CompactList title="Langues" items={data.languages.map((l) => `${l.name} (${l.level})`)} /> : null}
        </div>
      </div>
    </BaseShell>
  );
}

// ─── Technique (NEW) ───
function TechniqueLayout({ data, customization, color, fullName, spacing }: LayoutProps) {
  const photo = getPhoto(data.personalInfo, customization);

  return (
    <BaseShell background="#fefefe" border="1px solid #d5dce3" fontFamily="'Inter', system-ui, sans-serif">
      <div style={{ background: `linear-gradient(135deg, ${color}12, ${color}05)`, margin: "-26px -26px 0", padding: "22px 26px 18px", borderBottom: `3px solid ${color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 900, letterSpacing: "-0.02em" }}>{fullName || "Votre Nom"}</h1>
            <p style={{ margin: "6px 0 0", fontSize: "12px", fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {data.jobTitle || "Profil technique"}
            </p>
          </div>
          {photo ? <img src={photo} alt="" style={{ width: "68px", height: "68px", borderRadius: "10px", objectFit: "cover" }} /> : null}
        </div>
        <div style={{ marginTop: "10px" }}>
          <ContactRow info={data.personalInfo} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: spacing, marginTop: "18px" }}>
        <SummaryBlock text={data.summary} color={color} variant="plain" />

        {/* Certifications/Permits first — critical for trades */}
        {data.certifications.length > 0 ? (
          <div style={{ background: `${color}08`, border: `1px solid ${color}20`, borderRadius: "12px", padding: "14px" }}>
            <SectionTitle title="Permis, Licences & Certifications" color={color} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {data.certifications.map((item) => (
                <div key={item.id} style={{ padding: "8px 12px", border: `1px solid ${color}30`, borderRadius: "10px", background: "#fff" }}>
                  <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>{item.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#64748b" }}>
                    {[item.issuer, item.date].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {data.experience.length > 0 ? (
          <div>
            <SectionTitle title="Expérience terrain" color={color} />
            <ExperienceList items={data.experience} color={color} bulletStyle="dot" />
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          {data.skillCategories.some((c) => c.skills.length > 0) ? (
            <div>
              <SectionTitle title="Compétences techniques" color={color} />
              <SkillBlocks categories={data.skillCategories} color={color} mode="chips" />
            </div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.education.length > 0 ? (
              <div>
                <SectionTitle title="Formation" color={color} />
                <EducationList items={data.education} />
              </div>
            ) : null}
            {data.languages.length > 0 ? <CompactList title="Langues" items={data.languages.map((l) => `${l.name} (${l.level})`)} /> : null}
            {data.interests.length > 0 ? <CompactList title="Centres d'intérêt" items={data.interests} /> : null}
          </div>
        </div>
      </div>
    </BaseShell>
  );
}

export default ResumePreview;
