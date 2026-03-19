import { useEffect, useRef, useState } from "react";
import { ExternalLink, Github, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackProductEvent } from "@/lib/product-events";
import { PADDING_OPTIONS, WebsiteGlobalSettings, WebsiteSection, WebsiteSectionStyle, getFontFamily, getGoogleFontsUrl } from "@/types/website";
import { normalizeWebsiteTemplateId } from "@/lib/template-recommendations";

interface Props {
  sections: WebsiteSection[];
  globalSettings: WebsiteGlobalSettings;
  title: string;
  template: string;
  websiteId?: string;
  isPublic?: boolean;
}

const WebsitePreview = ({ sections, globalSettings, title, template, websiteId, isPublic }: Props) => {
  const templateId = normalizeWebsiteTemplateId(template);
  const color = globalSettings.primaryColor;
  const font = getFontFamily(globalSettings.fontPair);
  const fontsUrl = getGoogleFontsUrl(globalSettings.fontPair);
  const enabledSections = sections.filter((section) => section.enabled).sort((a, b) => a.order - b.order);
  const palette = getPalette(templateId, color);

  return (
    <div style={{ fontFamily: font, backgroundColor: palette.page, color: palette.text, lineHeight: 1.6 }}>
      {fontsUrl ? <link rel="stylesheet" href={fontsUrl} /> : null}
      {enabledSections.map((section, index) => (
        <AnimatedSection key={section.id} style={section.style}>
          <SectionRenderer
            section={section}
            allSections={enabledSections}
            title={title}
            template={templateId}
            color={color}
            palette={palette}
            isAlt={index % 2 === 1}
            websiteId={websiteId}
            isPublic={isPublic}
          />
        </AnimatedSection>
      ))}
      <footer className="px-6 py-10" style={{ background: palette.footer, borderTop: `1px solid ${palette.border}` }}>
        <div className="mx-auto max-w-5xl">
          <p className="text-lg font-semibold">{title}</p>
          <p className="mt-2 text-sm" style={{ color: palette.muted }}>Profil public partageable pour recruteurs et employeurs.</p>
        </div>
      </footer>
    </div>
  );
};

function getPalette(template: string, color: string) {
  if (template === "showcase") return { page: "#0f172a", surface: "#111c33", alt: "#16223d", text: "#f8fafc", muted: "#b8c3d9", border: "#233252", footer: "#0b1222", card: "rgba(255,255,255,0.04)", accentSurface: `${color}14` };
  if (template === "executive-profile") return { page: "#f8f4ef", surface: "#fffdfa", alt: "#f4eee6", text: "#1f2937", muted: "#6b7280", border: "#e7ddd0", footer: "#efe7dc", card: "#fffaf4", accentSurface: `${color}10` };
  if (template === "route-pro") return { page: "#fffaf2", surface: "#ffffff", alt: "#fff3df", text: "#1f2937", muted: "#6b7280", border: "#f3dfbf", footer: "#fff1d6", card: "#ffffff", accentSurface: `${color}12` };
  return { page: "#f8fafc", surface: "#ffffff", alt: "#f1f5f9", text: "#0f172a", muted: "#64748b", border: "#e2e8f0", footer: "#eef2f7", card: "#ffffff", accentSurface: `${color}10` };
}

function SectionTitle({ title, color, muted, center = false }: { title: string; color: string; muted: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: muted }}>Section</p>
      <h2 style={{ margin: "6px 0 0", fontSize: "30px", lineHeight: 1.15, fontWeight: 800, color }}>{title}</h2>
      <div className={center ? "mx-auto" : ""} style={{ marginTop: "12px", width: "72px", height: "4px", borderRadius: "999px", background: color }} />
    </div>
  );
}

function AnimatedSection({ children, style }: { children: React.ReactNode; style?: WebsiteSectionStyle }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const animation = style?.animation || "none";

  useEffect(() => {
    if (animation === "none") return setVisible(true);
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [animation]);

  const paddingClass = style?.paddingY ? PADDING_OPTIONS.find((item) => item.value === style.paddingY)?.className : undefined;
  const animatedStyle: React.CSSProperties = animation === "none"
    ? {}
    : animation === "slide-up"
      ? { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: `all 0.7s ease ${style?.animationDelay || 0}ms` }
      : animation === "slide-left"
        ? { opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-28px)", transition: `all 0.7s ease ${style?.animationDelay || 0}ms` }
        : animation === "scale-in"
          ? { opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.96)", transition: `all 0.7s ease ${style?.animationDelay || 0}ms` }
          : { opacity: visible ? 1 : 0, transition: `opacity 0.7s ease ${style?.animationDelay || 0}ms` };

  return <div ref={ref} className={paddingClass} style={animatedStyle}>{children}</div>;
}

interface RendererProps {
  section: WebsiteSection;
  allSections: WebsiteSection[];
  title: string;
  template: string;
  color: string;
  palette: ReturnType<typeof getPalette>;
  isAlt: boolean;
  websiteId?: string;
  isPublic?: boolean;
}

function SectionRenderer({ section, allSections, title, template, color, palette, isAlt, websiteId, isPublic }: RendererProps) {
  const { type, content } = section;
  const sectionBg = section.style?.backgroundColor || (isAlt ? palette.alt : palette.surface);

  if (type === "navbar") {
    return (
      <section className="sticky top-0 z-20 px-6 py-4 backdrop-blur" style={{ background: palette.surface, borderBottom: `1px solid ${palette.border}` }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <a href="#hero" className="text-lg font-extrabold tracking-tight" style={{ color }}>{content.logoText || title}</a>
          <div className="hidden flex-wrap items-center gap-4 md:flex">
            {allSections.filter((item) => item.type !== "navbar").map((item) => (
              <a key={item.id} href={`#${item.type}`} className="text-sm font-medium hover:opacity-80" style={{ color: palette.muted }}>{getNavLabel(item.type)}</a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (type === "hero") return renderHero(content, title, template, color, palette);

  if (type === "contact") {
    return <ContactSection title={content.title || "Contact"} content={content} color={color} palette={palette} websiteId={websiteId} isPublic={isPublic} />;
  }

  if (type === "social-links") {
    const socialItems = [
      { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
      { key: "github", icon: Github, label: "GitHub" },
      { key: "instagram", icon: Instagram, label: "Instagram" },
      { key: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
    ].filter((item) => content[item.key]);
    if (socialItems.length === 0) return null;
    return (
      <section id="social-links" className="px-6 py-16" style={{ background: sectionBg }}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
          {socialItems.map(({ key, icon: Icon, label }) => (
            <a key={key} href={key === "whatsapp" ? `https://wa.me/${String(content[key]).replace(/[^0-9]/g, "")}` : content[key]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:-translate-y-0.5" style={{ borderColor: palette.border, color: palette.text, background: palette.card }}>
              <Icon className="h-4 w-4" style={{ color }} />
              {label}
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={type} className="px-6 py-20" style={{ background: sectionBg }}>
      <div className="mx-auto max-w-5xl">
        <SectionTitle title={content.title || getNavLabel(type)} color={color} muted={palette.muted} />
        <div className="mt-10">
          {type === "about" ? <p className="max-w-3xl text-base leading-8" style={{ color: palette.muted }}>{content.text}</p> : null}
          {type === "skills" ? <MeterCards items={content.items || []} palette={palette} color={color} /> : null}
          {type === "credentials" ? <SimpleCards items={content.items || []} palette={palette} color={color} fields={["name", "issuer", "detail"]} /> : null}
          {type === "availability" ? <SimpleCards items={content.items || []} palette={palette} color={color} fields={["label", "value"]} /> : null}
          {type === "languages" ? <Pills items={content.items || []} palette={palette} /> : null}
          {type === "projects" ? <ProjectCards items={content.items || []} palette={palette} color={color} template={template} /> : null}
          {type === "experience" ? <ExperienceCards items={content.items || []} palette={palette} color={color} /> : null}
          {type === "education" ? <SimpleCards items={content.items || []} palette={palette} color={color} fields={["degree", "institution", "period"]} /> : null}
          {type === "stats" ? <StatCards items={content.items || []} palette={palette} color={color} /> : null}
        </div>
      </div>
    </section>
  );
}

function renderHero(content: Record<string, any>, title: string, template: string, color: string, palette: ReturnType<typeof getPalette>) {
  if (template === "showcase") {
    return <section id="hero" className="relative overflow-hidden px-6 py-24 md:py-32" style={{ background: `linear-gradient(135deg, ${color}, #0f172a)` }}><div className="mx-auto grid max-w-5xl gap-10 text-white md:grid-cols-[1.15fr_0.85fr]"><div><p className="text-xs font-extrabold uppercase tracking-[0.28em] text-white/70">Portfolio</p><h1 className="mt-5 text-5xl font-black leading-none md:text-7xl">{content.title || title}</h1>{content.subtitle ? <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">{content.subtitle}</p> : null}{content.cta ? <a href={content.ctaLink || "#contact"} className="mt-10 inline-flex rounded-full bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.18em]" style={{ color }}>{content.cta}</a> : null}</div><div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur"><p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">Positionnement</p><p className="mt-5 text-lg leading-8 text-white/90">{content.subtitle || "Projets, execution et resultats visibles."}</p></div></div></section>;
  }
  if (template === "route-pro") {
    return <section id="hero" className="px-6 py-20 md:py-24" style={{ background: content.backgroundImage ? `linear-gradient(rgba(17,24,39,0.55), rgba(17,24,39,0.7)), url(${content.backgroundImage}) center/cover` : `linear-gradient(135deg, ${color}, #111827)` }}><div className="mx-auto max-w-5xl text-white"><p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">Disponible maintenant</p><h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">{content.title || title}</h1>{content.subtitle ? <p className="mt-5 max-w-3xl text-lg text-white/85">{content.subtitle}</p> : null}<div className="mt-8 flex flex-wrap gap-3">{content.cta ? <a href={content.ctaLink || "#contact"} className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-black" style={{ color }}>{content.cta}</a> : null}<a href="#availability" className="inline-flex rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white">Voir disponibilite</a></div></div></section>;
  }
  if (template === "executive-profile") {
    return <section id="hero" className="px-6 py-24 text-center md:py-28" style={{ background: palette.alt }}><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.26em]" style={{ color: palette.muted }}>Executive profile</p><h1 className="mt-5 text-5xl font-semibold tracking-wide md:text-6xl" style={{ color: palette.text }}>{content.title || title}</h1>{content.subtitle ? <p className="mx-auto mt-6 max-w-3xl text-lg leading-8" style={{ color: palette.muted }}>{content.subtitle}</p> : null}{content.cta ? <a href={content.ctaLink || "#contact"} className="mt-10 inline-flex rounded-full border px-7 py-3 text-sm font-bold" style={{ borderColor: `${color}55`, color }}>{content.cta}</a> : null}</div></section>;
  }
  if (template === "casefile") {
    return <section id="hero" className="px-6 py-24 md:py-28" style={{ background: palette.surface }}><div className="mx-auto max-w-5xl"><p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color }}>Case studies</p><div className="mt-6 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end"><div><h1 className="text-4xl font-black leading-tight md:text-6xl" style={{ color: palette.text }}>{content.title || title}</h1>{content.subtitle ? <p className="mt-6 max-w-2xl text-lg leading-8" style={{ color: palette.muted }}>{content.subtitle}</p> : null}{content.cta ? <a href={content.ctaLink || "#projects"} className="mt-10 inline-flex rounded-full border px-7 py-3 text-sm font-bold" style={{ borderColor: `${color}45`, color }}>{content.cta}</a> : null}</div><div className="rounded-[28px] border p-6 shadow-sm" style={{ borderColor: palette.border, background: palette.card }}><p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: palette.muted }}>Focus</p><p className="mt-4 text-base leading-8" style={{ color: palette.text }}>Une presentation claire des projets, du contexte et des resultats.</p></div></div></div></section>;
  }
  return <section id="hero" className="px-6 py-24 md:py-28" style={{ background: palette.surface }}><div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[0.24em]" style={{ color }}>Profil Pro</p><h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl" style={{ color: palette.text }}>{content.title || title}</h1>{content.subtitle ? <p className="mt-6 max-w-2xl text-lg leading-8" style={{ color: palette.muted }}>{content.subtitle}</p> : null}{content.cta ? <a href={content.ctaLink || "#contact"} className="mt-10 inline-flex rounded-full px-7 py-3 text-sm font-black text-white" style={{ background: color }}>{content.cta}</a> : null}</div><div className="rounded-[28px] border p-6 shadow-sm" style={{ borderColor: palette.border, background: palette.card }}><p className="text-xs font-extrabold uppercase tracking-[0.24em]" style={{ color: palette.muted }}>Pourquoi ce format</p><p className="mt-4 text-base leading-8" style={{ color: palette.text }}>Une page claire, partageable et facile a lire sur mobile.</p></div></div></section>;
}

function SimpleCards({ items, palette, color, fields }: { items: any[]; palette: ReturnType<typeof getPalette>; color: string; fields: string[] }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item, index) => <div key={index} className="rounded-[24px] border p-5 shadow-sm" style={{ borderColor: palette.border, background: palette.card }}><p className="text-sm font-extrabold uppercase tracking-[0.14em]" style={{ color }}>{item[fields[0]]}</p>{fields.slice(1).map((field) => item[field] ? <p key={field} className="mt-3 text-sm" style={{ color: field === fields[1] ? palette.text : palette.muted }}>{item[field]}</p> : null)}</div>)}</div>;
}

function MeterCards({ items, palette, color }: { items: any[]; palette: ReturnType<typeof getPalette>; color: string }) {
  return <div className="grid gap-4 md:grid-cols-2">{items.map((item, index) => <div key={index} className="rounded-3xl border p-5 shadow-sm" style={{ borderColor: palette.border, background: palette.card }}><div className="flex items-center justify-between gap-4"><p className="font-semibold" style={{ color: palette.text }}>{item.name}</p><span className="text-sm font-bold" style={{ color }}>{item.level || 80}%</span></div><div className="mt-4 h-2 rounded-full" style={{ background: `${color}12` }}><div className="h-full rounded-full" style={{ width: `${item.level || 80}%`, background: color }} /></div></div>)}</div>;
}

function Pills({ items, palette }: { items: any[]; palette: ReturnType<typeof getPalette> }) {
  return <div className="flex flex-wrap gap-4">{items.map((item, index) => <div key={index} className="rounded-full border px-5 py-3 text-sm font-semibold" style={{ borderColor: palette.border, background: palette.card, color: palette.text }}>{item.name} <span style={{ color: palette.muted }}>• {item.level}</span></div>)}</div>;
}

function ProjectCards({ items, palette, color, template }: { items: any[]; palette: ReturnType<typeof getPalette>; color: string; template: string }) {
  return <div className="grid gap-5">{items.map((item, index) => <div key={index} className="overflow-hidden rounded-[28px] border shadow-sm" style={{ borderColor: palette.border, background: palette.card }}><div className={`grid gap-0 ${template === "showcase" ? "md:grid-cols-[1.2fr_0.8fr]" : "md:grid-cols-[0.95fr_1.05fr]"}`}><div className="p-7"><p className="text-xs font-extrabold uppercase tracking-[0.24em]" style={{ color }}>{String(index + 1).padStart(2, "0")}</p><h3 className="mt-4 text-2xl font-extrabold" style={{ color: palette.text }}>{item.name}</h3>{item.description ? <p className="mt-4 text-base leading-8" style={{ color: palette.muted }}>{item.description}</p> : null}</div><div className="flex flex-col justify-between border-t p-7 md:border-l md:border-t-0" style={{ borderColor: palette.border, background: palette.accentSurface }}>{(item.tags || []).length > 0 ? <div className="flex flex-wrap gap-2">{item.tags.map((tag: string, tagIndex: number) => <span key={tagIndex} className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ background: palette.surface, color }}>{tag}</span>)}</div> : null}<a href="#contact" className="mt-6 inline-flex items-center gap-2 text-sm font-bold hover:opacity-80" style={{ color }}>Discuter de ce travail <ExternalLink className="h-4 w-4" /></a></div></div></div>)}</div>;
}

function ExperienceCards({ items, palette, color }: { items: any[]; palette: ReturnType<typeof getPalette>; color: string }) {
  return <div className="space-y-4">{items.map((item, index) => <div key={index} className="rounded-[28px] border p-6 shadow-sm" style={{ borderColor: palette.border, background: palette.card }}><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><h3 className="text-xl font-bold" style={{ color: palette.text }}>{item.position}</h3><p className="mt-1 text-sm font-semibold" style={{ color }}>{item.company}</p></div>{item.period ? <p className="text-sm font-medium" style={{ color: palette.muted }}>{item.period}</p> : null}</div>{item.description ? <p className="mt-4 text-base leading-8" style={{ color: palette.muted }}>{item.description}</p> : null}</div>)}</div>;
}

function StatCards({ items, palette, color }: { items: any[]; palette: ReturnType<typeof getPalette>; color: string }) {
  return <div className="grid gap-4 md:grid-cols-3">{items.map((item, index) => <div key={index} className="rounded-[28px] border p-6 text-center shadow-sm" style={{ borderColor: palette.border, background: palette.card }}><p className="text-4xl font-black" style={{ color }}>{item.number}</p><p className="mt-3 text-sm font-medium" style={{ color: palette.muted }}>{item.label}</p></div>)}</div>;
}

function ContactSection({ title, content, color, palette, websiteId, isPublic }: { title: string; content: Record<string, any>; color: string; palette: ReturnType<typeof getPalette>; websiteId?: string; isPublic?: boolean }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!websiteId || !form.name || !form.email || !form.message) return;
    setSending(true);
    setSubmitError(null);
    try {
      const { error } = await supabase.functions.invoke("website-contact", { body: { websiteId, ...form } });
      if (error) throw error;
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      await trackProductEvent("contact_submitted", { data: { websiteId, isPublic: Boolean(isPublic) } });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Impossible d'envoyer le message.");
    }
    setSending(false);
  };

  return <section id="contact" className="px-6 py-20" style={{ background: palette.alt }}><div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[0.9fr_1.1fr]"><div><SectionTitle title={title} color={color} muted={palette.muted} />{content.text ? <p className="mt-8 text-base leading-8" style={{ color: palette.muted }}>{content.text}</p> : null}<div className="mt-8 space-y-3">{content.email ? <a href={`mailto:${content.email}`} className="flex items-center gap-3 text-sm font-semibold hover:opacity-80" style={{ color: palette.text }}><Mail className="h-4 w-4" style={{ color }} /> {content.email}</a> : null}{content.phone ? <a href={`tel:${content.phone}`} className="flex items-center gap-3 text-sm font-semibold hover:opacity-80" style={{ color: palette.text }}><Phone className="h-4 w-4" style={{ color }} /> {content.phone}</a> : null}{content.whatsapp ? <a href={`https://wa.me/${String(content.whatsapp).replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-semibold hover:opacity-80" style={{ color: palette.text }}><MessageCircle className="h-4 w-4" style={{ color }} /> WhatsApp</a> : null}{content.address ? <p className="flex items-center gap-3 text-sm" style={{ color: palette.muted }}><MapPin className="h-4 w-4" style={{ color }} /> {content.address}</p> : null}</div></div>{content.showForm !== false ? sent ? <div className="rounded-[28px] border p-8 shadow-sm" style={{ borderColor: palette.border, background: palette.card }}><p className="text-lg font-black" style={{ color }}>Message envoye</p><p className="mt-3 text-sm" style={{ color: palette.muted }}>Merci, une reponse vous sera envoyee bientot.</p></div> : <form onSubmit={handleSubmit} className="rounded-[28px] border p-7 shadow-sm" style={{ borderColor: palette.border, background: palette.card }}><div className="space-y-4"><div><label className="text-sm font-semibold" style={{ color: palette.text }}>Nom</label><input className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm" style={{ borderColor: palette.border, background: "transparent", color: palette.text }} value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required /></div><div><label className="text-sm font-semibold" style={{ color: palette.text }}>Email</label><input type="email" className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm" style={{ borderColor: palette.border, background: "transparent", color: palette.text }} value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} required /></div><div><label className="text-sm font-semibold" style={{ color: palette.text }}>Message</label><textarea rows={4} className="mt-1.5 w-full rounded-xl border px-4 py-3 text-sm" style={{ borderColor: palette.border, background: "transparent", color: palette.text }} value={form.message} onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))} required /></div><button type="submit" disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white disabled:opacity-60" style={{ background: color }}>{sending ? "Envoi..." : <><Send className="h-4 w-4" /> Envoyer</>}</button>{submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}</div></form> : null}</div></section>;
}

function getNavLabel(type: string) {
  switch (type) {
    case "hero": return "Accueil";
    case "about": return "Presentation";
    case "experience": return "Experience";
    case "projects": return "Projets";
    case "skills": return "Competences";
    case "credentials": return "Certifications";
    case "availability": return "Disponibilite";
    case "languages": return "Langues";
    case "education": return "Formation";
    case "contact": return "Contact";
    case "social-links": return "Liens";
    case "stats": return "Points forts";
    default: return type;
  }
}

export default WebsitePreview;
