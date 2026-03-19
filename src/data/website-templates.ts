import { SectionType, WebsiteGlobalSettings, WebsiteSection } from "@/types/website";

export interface WebsiteTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  globalSettings: WebsiteGlobalSettings;
  sectionTypes: SectionType[];
  sampleContent: Record<string, Record<string, any>>;
}

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "profile-clean",
    name: "Profile Clean",
    category: "profile",
    description: "Le template le plus sur pour les candidatures generalistes et internationales.",
    globalSettings: { primaryColor: "#0f766e", fontPair: "manrope", layout: "clean" },
    sectionTypes: ["navbar", "hero", "about", "experience", "skills", "languages", "contact"],
    sampleContent: {
      navbar: { logoText: "Profil Pro", style: "sticky", transparent: false },
      hero: { title: "Ahmed Ben Ali", subtitle: "Chauffeur poids lourd disponible pour le Canada", cta: "Me contacter", ctaLink: "#contact", backgroundImage: "" },
      about: { title: "Presentation", text: "Professionnel fiable, ponctuel et oriente securite, avec une experience concrete sur route et en livraisons longues distances.", image: "" },
      experience: { title: "Experience", items: [{ position: "Chauffeur poids lourd", company: "Transit Maghreb", period: "2021 - Present", description: "Livraisons longue distance, respect des delais et controle des documents de transport." }] },
      skills: { title: "Competences", items: [{ name: "Conduite longue distance", level: 95 }, { name: "Respect des consignes", level: 92 }, { name: "Gestion des documents", level: 85 }] },
      languages: { title: "Langues", items: [{ name: "Français", level: "Professionnel" }, { name: "Arabe", level: "Courant" }, { name: "Anglais", level: "Operationnel" }] },
      contact: { title: "Contact", text: "Disponible pour un entretien ou un appel rapide.", phone: "+216 XX XXX XXX", whatsapp: "+216XXXXXXXX", email: "contact@profil.com", showForm: true },
    },
  },
  {
    id: "route-pro",
    name: "Route Pro",
    category: "profile",
    description: "Contact-first, tres lisible sur mobile, parfait pour les metiers terrain.",
    globalSettings: { primaryColor: "#b45309", fontPair: "public-sans", layout: "contrast" },
    sectionTypes: ["navbar", "hero", "credentials", "availability", "experience", "languages", "contact"],
    sampleContent: {
      navbar: { logoText: "Route Pro", style: "sticky", transparent: false },
      hero: { title: "Sarra Trabelsi", subtitle: "Receptionniste multilingue • Disponible immediatement", cta: "Appeler maintenant", ctaLink: "#contact", backgroundImage: "" },
      credentials: { title: "Permis & certifications", items: [{ name: "Formation hoteliere", issuer: "Centre local", detail: "Terminee" }, { name: "Permis B", issuer: "Tunisie", detail: "Valide" }] },
      availability: { title: "Disponibilite", items: [{ label: "Disponibilite", value: "Immediatement" }, { label: "Horaires", value: "Flexible" }, { label: "Mobilite", value: "Ouverte a l'international" }] },
      experience: { title: "Experience", items: [{ position: "Receptionniste", company: "Hotel Medina", period: "2022 - Present", description: "Accueil des clients, gestion des reservations et coordination quotidienne avec les equipes." }] },
      languages: { title: "Langues", items: [{ name: "Français", level: "Courant" }, { name: "Arabe", level: "Courant" }, { name: "Anglais", level: "Professionnel" }] },
      contact: { title: "Contact", text: "Le moyen le plus rapide est l'appel ou WhatsApp.", phone: "+216 XX XXX XXX", whatsapp: "+216XXXXXXXX", email: "sarra@profil.com", showForm: false },
    },
  },
  {
    id: "executive-profile",
    name: "Executive Profile",
    category: "profile",
    description: "Plus editorial, plus premium, pour des profils seniors ou de direction.",
    globalSettings: { primaryColor: "#7c2d12", fontPair: "source-serif-4", layout: "editorial" },
    sectionTypes: ["navbar", "hero", "about", "stats", "experience", "education", "contact", "social-links"],
    sampleContent: {
      navbar: { logoText: "Executive Profile", style: "sticky", transparent: false },
      hero: { title: "Amel Mansour", subtitle: "Operations Director • Structuration, performance et execution", cta: "Planifier un echange", ctaLink: "#contact", backgroundImage: "" },
      about: { title: "Positionnement", text: "Directrice operations avec plus de 10 ans d'experience dans l'optimisation des processus, la gestion d'equipes et la conduite du changement.", image: "" },
      stats: { title: "Points forts", items: [{ number: "10+", label: "Annees de leadership" }, { number: "3", label: "Pays de coordination" }, { number: "25%", label: "Gain d'efficacite atteint" }] },
      experience: { title: "Experience", items: [{ position: "Operations Director", company: "North Africa Logistics", period: "2019 - Present", description: "Pilotage des operations, standardisation et amelioration continue sur plusieurs sites." }] },
      education: { title: "Formation", items: [{ degree: "MBA", institution: "IHEC Carthage", period: "2016 - 2018" }] },
      contact: { title: "Contact", text: "Disponible pour des echanges leadership, operations et transformation.", email: "amel@profile.com", phone: "+216 XX XXX XXX", showForm: true },
      "social-links": { linkedin: "https://linkedin.com", instagram: "", github: "", whatsapp: "" },
    },
  },
  {
    id: "casefile",
    name: "Casefile",
    category: "portfolio",
    description: "Portfolio propre et structure autour des cas concrets.",
    globalSettings: { primaryColor: "#2563eb", fontPair: "ibm-plex-sans", layout: "clean" },
    sectionTypes: ["navbar", "hero", "about", "projects", "experience", "skills", "education", "social-links", "contact"],
    sampleContent: {
      navbar: { logoText: "Casefile", style: "sticky", transparent: false },
      hero: { title: "Yasmine Ben Salem", subtitle: "Product Designer • Interfaces utiles et simples", cta: "Voir mes projets", ctaLink: "#projects", backgroundImage: "" },
      about: { title: "Approche", text: "Je conçois des experiences digitales lisibles, utiles et orientees resultats, avec une forte attention au contenu et au parcours utilisateur.", image: "" },
      projects: { title: "Realisations", items: [{ name: "App bancaire mobile", description: "Refonte du parcours d'ouverture de compte avec meilleure conversion et moins de friction.", tags: ["UX", "UI", "Mobile"] }] },
      experience: { title: "Experience", items: [{ position: "Product Designer", company: "Fintech Lab", period: "2021 - Present", description: "Conception de parcours mobile et dashboard web pour produits financiers." }] },
      skills: { title: "Competences", items: [{ name: "Design UI/UX", level: 95 }, { name: "Figma", level: 92 }, { name: "Recherche utilisateur", level: 84 }] },
      education: { title: "Formation", items: [{ degree: "Master Design", institution: "ESSTED", period: "2018 - 2020" }] },
      "social-links": { linkedin: "https://linkedin.com", instagram: "", github: "", whatsapp: "" },
      contact: { title: "Contact", text: "Disponible pour des opportunites produit, UX et interface.", email: "hello@casefile.com", showForm: true },
    },
  },
  {
    id: "showcase",
    name: "Showcase",
    category: "portfolio",
    description: "Plus visuel, plus present, mais toujours credible pour une candidature.",
    globalSettings: { primaryColor: "#7c3aed", fontPair: "space-grotesk", layout: "showcase" },
    sectionTypes: ["navbar", "hero", "projects", "about", "skills", "experience", "social-links", "contact"],
    sampleContent: {
      navbar: { logoText: "Showcase", style: "sticky", transparent: false },
      hero: { title: "Khalil Gharbi", subtitle: "Frontend Engineer • React, TypeScript, Performance", cta: "Explorer mes projets", ctaLink: "#projects", backgroundImage: "" },
      projects: { title: "Projets", items: [{ name: "Design System SaaS", description: "Bibliotheque de composants utilisee par plusieurs equipes produit.", tags: ["React", "TypeScript", "DX"] }] },
      about: { title: "Positionnement", text: "Je construis des interfaces rapides, accessibles et maintenables pour des produits a forte exigence.", image: "" },
      skills: { title: "Competences", items: [{ name: "React / TypeScript", level: 95 }, { name: "Performance web", level: 88 }, { name: "Design systems", level: 90 }] },
      experience: { title: "Experience", items: [{ position: "Frontend Engineer", company: "SaaS Core", period: "2020 - Present", description: "Developpement d'interfaces critiques et amelioration du temps de chargement." }] },
      "social-links": { linkedin: "https://linkedin.com", github: "https://github.com", whatsapp: "" },
      contact: { title: "Contact", text: "Ouvert aux roles frontend, design system et product engineering.", email: "khalil@showcase.dev", showForm: true },
    },
  },
];

export function getTemplatesForCategory(category: string): WebsiteTemplate[] {
  return WEBSITE_TEMPLATES.filter((template) => template.category === category);
}

export function getTemplateById(id: string): WebsiteTemplate | undefined {
  return WEBSITE_TEMPLATES.find((template) => template.id === id);
}

export function buildSectionsFromTemplate(template: WebsiteTemplate): WebsiteSection[] {
  return template.sectionTypes.map((type, index) => ({
    id: crypto.randomUUID(),
    type,
    enabled: true,
    order: index,
    content: template.sampleContent[type] ? { ...template.sampleContent[type] } : {},
    style: { paddingY: "md" as const, animation: "none" as const },
  }));
}
