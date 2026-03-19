import ResumePreview from "@/components/resume/ResumePreview";
import WebsitePreview from "@/components/website/WebsitePreview";
import { buildSectionsFromTemplate, getTemplateById } from "@/data/website-templates";
import { defaultCustomization, type ResumeCustomization, type ResumeData } from "@/types/resume";
import { defaultGlobalSettings, type WebsiteGlobalSettings } from "@/types/website";
import type { ResumeTemplateId, WebsiteTemplateId } from "@/lib/template-recommendations";

export const RESUME_TEMPLATE_IDS: ResumeTemplateId[] = ["essentiel", "horizon", "trajectoire", "direction", "signature"];
export const WEBSITE_TEMPLATE_IDS: WebsiteTemplateId[] = ["profile-clean", "route-pro", "executive-profile", "casefile", "showcase"];

const resumeFixtures: Record<ResumeTemplateId, { title: string; data: ResumeData; customization: ResumeCustomization }> = {
  essentiel: {
    title: "Resume Essentiel",
    data: {
      jobTarget: "job",
      targetCountry: "canada",
      jobField: "transport",
      jobTitle: "Chauffeur poids lourd",
      experienceLevel: "3-10",
      simplifiedMode: true,
      personalInfo: {
        firstName: "Ahmed",
        lastName: "Ben Ali",
        email: "ahmed@email.com",
        phone: "+216 12 345 678",
        city: "Tunis",
        linkedIn: "",
        github: "",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "Centre ATFP Tunis", degree: "Formation professionnelle", field: "Logistique", startDate: "2018", endDate: "2019", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "Transit Maghreb", position: "Chauffeur poids lourd", startDate: "2021", endDate: "", current: true, bullets: ["Livraisons longue distance Tunisie - Algerie", "Controle des documents et respect strict des delais", "Verification quotidienne securite vehicule et cargaison"] },
        { id: "exp-2", company: "Sotral", position: "Chauffeur livreur", startDate: "2019", endDate: "2021", current: false, bullets: ["Preparation des tournees et chargement", "Communication avec exploitants et clients"] },
      ],
      skillCategories: [
        { id: "core", name: "Competences terrain", skills: ["Conduite longue distance", "Securite", "Documents de transport", "Gestion du temps"] },
      ],
      projects: [],
      certifications: [
        { id: "cert-1", name: "Permis CE", issuer: "Tunisie", date: "2020", url: "" },
        { id: "cert-2", name: "Carte conducteur", issuer: "Transport", date: "2025", url: "" },
      ],
      languages: [{ name: "Français", level: "Professionnel" }, { name: "Anglais", level: "Operationnel" }],
      interests: ["Voyage", "Maintenance de vehicules"],
      summary: "Chauffeur poids lourd fiable, ponctuel et oriente securite, avec experience sur trajets longue distance et transport reglemente.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#0f766e", fontPair: "inter", showPhoto: false, spacing: "normal" },
  },
  horizon: {
    title: "Resume Horizon",
    data: {
      jobTarget: "job",
      targetCountry: "france",
      jobField: "business",
      jobTitle: "Chargee de recrutement",
      experienceLevel: "1-3",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Amel",
        lastName: "Mansouri",
        email: "amel@email.com",
        phone: "+216 55 555 555",
        city: "Tunis",
        linkedIn: "linkedin.com/in/amelmansouri",
        github: "",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "IHEC Carthage", degree: "Master", field: "Ressources humaines", startDate: "2020", endDate: "2022", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "Talent Bridge", position: "Chargee de recrutement", startDate: "2023", endDate: "", current: true, bullets: ["Gestion de 20+ recrutements simultanes", "Entretiens et coordination managers", "Suivi candidats et experience candidat"] },
      ],
      skillCategories: [
        { id: "skills", name: "Competences", skills: ["Sourcing", "Entretiens", "Organisation", "Communication"] },
      ],
      projects: [
        { id: "proj-1", name: "Refonte parcours candidat", description: "Simplification des communications et meilleure conversion candidats.", url: "", technologies: ["Process", "HR", "Ops"] },
      ],
      certifications: [],
      languages: [{ name: "Français", level: "Courant" }, { name: "Anglais", level: "Courant" }],
      interests: ["Lecture", "Mentorat"],
      summary: "Profil RH organise et orienté execution, a l'aise avec le suivi candidat, la coordination et la qualite d'experience.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#2563eb", fontPair: "inter", spacing: "normal" },
  },
  trajectoire: {
    title: "Resume Trajectoire",
    data: {
      jobTarget: "job",
      targetCountry: "canada",
      jobField: "tech",
      jobTitle: "Senior Frontend Engineer",
      experienceLevel: "3-10",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Khalil",
        lastName: "Gharbi",
        email: "khalil@email.com",
        phone: "+216 22 222 222",
        city: "Sousse",
        linkedIn: "linkedin.com/in/khalil",
        github: "github.com/khalil",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "ESPRIT", degree: "Ingenieur", field: "Informatique", startDate: "2014", endDate: "2017", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "SaaS Core", position: "Senior Frontend Engineer", startDate: "2022", endDate: "", current: true, bullets: ["Pilotage d'un design system transverse", "Amelioration du temps de chargement de 28%", "Mentorat de 3 developpeurs"] },
        { id: "exp-2", company: "Product Lab", position: "Frontend Engineer", startDate: "2019", endDate: "2022", current: false, bullets: ["Refonte interfaces B2B", "Migration TypeScript", "Tests component-level"] },
      ],
      skillCategories: [
        { id: "tech", name: "Stack", skills: ["React", "TypeScript", "Next.js", "Design systems", "Testing"] },
      ],
      projects: [
        { id: "proj-1", name: "SaaS Analytics Dashboard", description: "Refonte d'un dashboard analytique critique pour les equipes sales.", url: "", technologies: ["React", "Charts", "Performance"] },
      ],
      certifications: [],
      languages: [{ name: "Anglais", level: "Professionnel" }, { name: "Français", level: "Courant" }],
      interests: ["Open source", "Course a pied"],
      summary: "Ingenieur frontend oriente produit, specialise dans les interfaces complexes, la performance et la qualite des composants.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#2563eb", fontPair: "inter", spacing: "normal" },
  },
  direction: {
    title: "Resume Direction",
    data: {
      jobTarget: "job",
      targetCountry: "germany",
      jobField: "business",
      jobTitle: "Operations Director",
      experienceLevel: "10+",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Amel",
        lastName: "Cherif",
        email: "amel.cherif@email.com",
        phone: "+216 33 333 333",
        city: "Tunis",
        linkedIn: "linkedin.com/in/amelcherif",
        github: "",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "IHEC Carthage", degree: "MBA", field: "Management", startDate: "2010", endDate: "2012", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "North Africa Logistics", position: "Operations Director", startDate: "2019", endDate: "", current: true, bullets: ["Pilotage de 4 sites operationnels", "Reduction des couts de 12%", "Mise en place d'indicateurs de performance communs"] },
        { id: "exp-2", company: "Global Freight", position: "Operations Manager", startDate: "2014", endDate: "2019", current: false, bullets: ["Management d'equipes pluridisciplinaires", "Optimisation process et compliance"] },
      ],
      skillCategories: [
        { id: "leadership", name: "Leadership", skills: ["Operations", "Change management", "Budget", "Execution"] },
      ],
      projects: [
        { id: "proj-1", name: "Programme de standardisation", description: "Refonte des standards d'exploitation sur plusieurs pays.", url: "", technologies: ["Operations", "KPI"] },
      ],
      certifications: [{ id: "cert-1", name: "Lean Six Sigma", issuer: "PMI", date: "2018", url: "" }],
      languages: [{ name: "Français", level: "Courant" }, { name: "Anglais", level: "Professionnel" }, { name: "Allemand", level: "Intermediaire" }],
      interests: ["Mentorat", "Conference ops"],
      summary: "Dirigeante operations avec forte culture d'execution, specialisee dans la standardisation, la performance et le pilotage multi-sites.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#7c2d12", fontPair: "inter", spacing: "spacious" },
  },
  signature: {
    title: "Resume Signature",
    data: {
      jobTarget: "job",
      targetCountry: "france",
      jobField: "tech",
      jobTitle: "Product Designer",
      experienceLevel: "3-10",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Yasmine",
        lastName: "Ben Salem",
        email: "yasmine@email.com",
        phone: "+216 44 444 444",
        city: "Sfax",
        linkedIn: "linkedin.com/in/yasmine",
        github: "",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "ESSTED", degree: "Master", field: "Design", startDate: "2017", endDate: "2019", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "Fintech Lab", position: "Product Designer", startDate: "2021", endDate: "", current: true, bullets: ["Refonte complete onboarding mobile", "Co-construction avec produit et engineering", "Design system pour flux critiques"] },
      ],
      skillCategories: [
        { id: "craft", name: "Craft", skills: ["Figma", "UX", "UI", "Prototyping", "Research"] },
      ],
      projects: [
        { id: "proj-1", name: "Onboarding bancaire mobile", description: "Simplification d'un parcours d'ouverture de compte et meilleure conversion.", url: "", technologies: ["UX", "Flows", "Mobile"] },
      ],
      certifications: [],
      languages: [{ name: "Français", level: "Courant" }, { name: "Anglais", level: "Professionnel" }],
      interests: ["Illustration", "Photographie"],
      summary: "Designer produit orientee clarte, contenu et conversion, avec une forte sensibilite aux parcours utiles et lisibles.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#7c3aed", fontPair: "inter", spacing: "normal" },
  },
};

export function getResumeFixture(template: ResumeTemplateId) {
  return resumeFixtures[template];
}

export function getWebsiteFixture(template: WebsiteTemplateId) {
  const tpl = getTemplateById(template);
  if (!tpl) throw new Error(`Unknown website template fixture: ${template}`);
  return {
    title: tpl.sampleContent.navbar?.logoText || tpl.name,
    sections: buildSectionsFromTemplate(tpl),
    globalSettings: { ...defaultGlobalSettings, ...tpl.globalSettings } as WebsiteGlobalSettings,
  };
}

export { ResumePreview, WebsitePreview };
