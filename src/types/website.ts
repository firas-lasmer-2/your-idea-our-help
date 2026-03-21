import type { ExperienceLevel, JobField, TargetCountry } from "@/lib/country-standards";

export interface WebsiteSectionStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  paddingY?: "sm" | "md" | "lg" | "xl";
  textAlign?: "left" | "center";
  animation?: "none" | "fade-in" | "slide-up" | "slide-left" | "scale-in";
  animationDelay?: number;
  customClass?: string;
}

export type SectionType =
  | "navbar"
  | "hero"
  | "about"
  | "skills"
  | "credentials"
  | "availability"
  | "languages"
  | "projects"
  | "experience"
  | "education"
  | "contact"
  | "social-links"
  | "stats"
  | "testimonials";

export interface WebsiteSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  content: Record<string, any>;
  style?: WebsiteSectionStyle;
}

export type WebsiteMode = "profile" | "portfolio";
export type WebsiteCandidateTrack = JobField;

export interface WebsiteCandidateProfile {
  mode: WebsiteMode;
  candidateTrack: WebsiteCandidateTrack;
  targetCountry: TargetCountry;
  experienceLevel: ExperienceLevel;
  jobTitle: string;
  summary: string;
  availabilityNote?: string;
  portfolioFocus?: string;
  highlightedWork?: string;
  contactPreference?: "phone_whatsapp" | "phone" | "email" | "links";
}

export interface WebsiteData {
  sections: WebsiteSection[];
  profile?: WebsiteCandidateProfile;
}

export interface WebsiteGlobalSettings {
  primaryColor: string;
  fontPair: string;
  layout: string;
  metaDescription?: string;
  ogImage?: string;
}

export const CV_IMPORT_CATEGORIES: WebsiteMode[] = ["profile", "portfolio"];

export const WEBSITE_PURPOSES = [
  {
    value: "profile",
    label: "Profil Pro",
    description: "Une page simple et professionnelle pour aider un recruteur a comprendre votre profil en quelques secondes.",
    template: "profile-clean",
    icon: "FileText",
    sections: ["navbar", "hero", "about", "experience", "credentials", "availability", "languages", "contact"] as SectionType[],
    wizardFields: ["target_role", "profile_pitch", "availability_note"],
  },
  {
    value: "portfolio",
    label: "Portfolio Pro",
    description: "Un site de candidature qui met en avant vos projets, preuves de travail et resultats.",
    template: "casefile",
    icon: "Code",
    sections: ["navbar", "hero", "about", "projects", "skills", "experience", "education", "social-links", "contact"] as SectionType[],
    wizardFields: ["target_role", "portfolio_focus", "highlighted_work"],
  },
] as const;

export const ACTIVE_SECTION_TYPES: SectionType[] = [
  "navbar",
  "hero",
  "about",
  "skills",
  "credentials",
  "availability",
  "languages",
  "projects",
  "experience",
  "education",
  "social-links",
  "contact",
  "stats",
  "testimonials",
];

export const SECTION_LABELS: Record<SectionType, string> = {
  navbar: "Barre de navigation",
  hero: "Hero / accroche",
  about: "Presentation",
  skills: "Competences",
  credentials: "Permis & certifications",
  availability: "Disponibilite",
  languages: "Langues",
  projects: "Projets",
  experience: "Experience",
  education: "Formation",
  contact: "Contact",
  "social-links": "Liens publics",
  stats: "Points forts",
  testimonials: "Temoignages",
};

export const ALL_SECTION_TYPES: SectionType[] = Object.keys(SECTION_LABELS) as SectionType[];

export const defaultGlobalSettings: WebsiteGlobalSettings = {
  primaryColor: "#0f766e",
  fontPair: "manrope",
  layout: "clean",
};

export const FONT_OPTIONS = [
  { value: "manrope", label: "Manrope", family: "'Manrope', system-ui, sans-serif", category: "Sans-serif" },
  { value: "public-sans", label: "Public Sans", family: "'Public Sans', system-ui, sans-serif", category: "Sans-serif" },
  { value: "ibm-plex-sans", label: "IBM Plex Sans", family: "'IBM Plex Sans', system-ui, sans-serif", category: "Sans-serif" },
  { value: "space-grotesk", label: "Space Grotesk", family: "'Space Grotesk', system-ui, sans-serif", category: "Sans-serif" },
  { value: "dm-sans", label: "DM Sans", family: "'DM Sans', system-ui, sans-serif", category: "Sans-serif" },
  { value: "inter", label: "Inter", family: "'Inter', system-ui, sans-serif", category: "Sans-serif" },
  { value: "source-serif-4", label: "Source Serif 4", family: "'Source Serif 4', Georgia, serif", category: "Serif" },
  { value: "playfair", label: "Playfair Display", family: "'Playfair Display', Georgia, serif", category: "Serif" },
  { value: "lora", label: "Lora", family: "'Lora', Georgia, serif", category: "Serif" },
  { value: "merriweather", label: "Merriweather", family: "'Merriweather', Georgia, serif", category: "Serif" },
];

export function getFontFamily(fontPair: string): string {
  return FONT_OPTIONS.find((font) => font.value === fontPair)?.family || FONT_OPTIONS[0].family;
}

export function getGoogleFontsUrl(fontPair: string): string {
  const font = FONT_OPTIONS.find((entry) => entry.value === fontPair);
  if (!font) return "";
  const family = font.label.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;500;600;700;800&display=swap`;
}

export const ANIMATION_OPTIONS = [
  { value: "none", label: "Aucune" },
  { value: "fade-in", label: "Fondu" },
  { value: "slide-up", label: "Monter" },
  { value: "slide-left", label: "Glisser" },
  { value: "scale-in", label: "Zoom leger" },
];

export const PADDING_OPTIONS = [
  { value: "sm", label: "Petit", className: "py-8" },
  { value: "md", label: "Moyen", className: "py-16" },
  { value: "lg", label: "Grand", className: "py-24" },
  { value: "xl", label: "Tres grand", className: "py-32" },
];

export function createDefaultSections(sectionTypes: SectionType[]): WebsiteSection[] {
  return sectionTypes.map((type, index) => ({
    id: crypto.randomUUID(),
    type,
    enabled: true,
    order: index,
    content: getDefaultContent(type),
    style: { paddingY: "md" as const, animation: "none" as const },
  }));
}

function getDefaultContent(type: SectionType): Record<string, any> {
  switch (type) {
    case "navbar":
      return { logoText: "", style: "sticky", transparent: false };
    case "hero":
      return { title: "", subtitle: "", cta: "Me contacter", ctaLink: "#contact", backgroundImage: "" };
    case "about":
      return { title: "Presentation", text: "", image: "" };
    case "skills":
      return { title: "Competences", items: [] };
    case "credentials":
      return { title: "Permis & certifications", items: [] };
    case "availability":
      return {
        title: "Disponibilite",
        items: [
          { label: "Disponible", value: "Immediatement" },
          { label: "Mobilite", value: "A preciser" },
        ],
      };
    case "languages":
      return { title: "Langues", items: [] };
    case "projects":
      return { title: "Projets", items: [] };
    case "experience":
      return { title: "Experience", items: [] };
    case "education":
      return { title: "Formation", items: [] };
    case "contact":
      return {
        title: "Contact",
        email: "",
        phone: "",
        text: "N'hesitez pas a me contacter.",
        showForm: true,
        address: "",
        whatsapp: "",
      };
    case "social-links":
      return { linkedin: "", instagram: "", github: "", whatsapp: "" };
    case "stats":
      return {
        title: "Points forts",
        items: [
          { number: "5+", label: "Annees d'experience" },
          { number: "3", label: "Langues" },
          { number: "100%", label: "Pret a demarrer" },
        ],
      };
    case "testimonials":
      return {
        title: "Temoignages",
        items: [
          { name: "Sarah L.", role: "Directrice RH, Groupe Industriel", text: "Un profil remarquable, autonome et toujours force de proposition. Je recommande sans hesiter." },
          { name: "Mohamed K.", role: "Chef de projet, Startup SaaS", text: "Travail de qualite, livraisons dans les delais, communication exemplaire. Un vrai atout pour l'equipe." },
        ],
      };
    default:
      return {};
  }
}

export const TEMPLATE_STYLES = [
  { value: "clean", label: "Clean", description: "Sobre, clair et rassurant" },
  { value: "contrast", label: "Contrast", description: "Plus direct, plus visible, contact-first" },
  { value: "editorial", label: "Editorial", description: "Premium discret et plus corporate" },
  { value: "showcase", label: "Showcase", description: "Plus visuel, plus project-first" },
] as const;

export interface WizardFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "date";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export const CATEGORY_WIZARD_FIELDS: Record<string, WizardFieldDef[]> = {
  profile: [
    { key: "target_role", label: "Poste cible", type: "text", placeholder: "Chauffeur poids lourd, infirmier, comptable...", required: true },
    { key: "profile_pitch", label: "Presentation courte", type: "textarea", placeholder: "Decrivez votre profil en quelques phrases simples..." },
    { key: "availability_note", label: "Disponibilite", type: "text", placeholder: "Disponible immediatement, mobile, permis CE..." },
  ],
  portfolio: [
    { key: "target_role", label: "Poste cible", type: "text", placeholder: "Developpeur, designer, chef de projet...", required: true },
    { key: "portfolio_focus", label: "Ce que vous voulez montrer", type: "textarea", placeholder: "Vos projets, resultats, realisations ou specialites...", required: true },
    { key: "highlighted_work", label: "Realisation phare", type: "text", placeholder: "Ex: Refonte d'un produit, app mobile, systeme interne..." },
  ],
};
