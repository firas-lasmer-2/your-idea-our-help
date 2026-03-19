export type TargetCountry = "tunisia" | "france" | "canada" | "usa" | "gulf" | "germany" | "other";
export type ExperienceLevel = "none" | "1-3" | "3-10" | "10+";
export type JobField = "tech" | "healthcare" | "construction" | "hospitality" | "education" | "business" | "transport" | "other";

export interface CountryStandard {
  id: TargetCountry;
  label: string;
  flag: string;
  showPhoto: boolean;
  maxPages: number;
  dateFormat: string;
  mustInclude: string[];
  mustExclude: string[];
  preferredTemplate: string;
  tips: string[];
}

export const COUNTRY_STANDARDS: Record<TargetCountry, CountryStandard> = {
  tunisia: {
    id: "tunisia",
    label: "Tunisie",
    flag: "🇹🇳",
    showPhoto: true,
    maxPages: 2,
    dateFormat: "MM/YYYY",
    mustInclude: ["photo", "languages"],
    mustExclude: [],
    preferredTemplate: "essentiel",
    tips: [
      "Ajoutez une photo professionnelle",
      "Mentionnez vos langues (Arabe, Français, Anglais)",
      "Incluez votre situation militaire si applicable",
    ],
  },
  france: {
    id: "france",
    label: "France",
    flag: "🇫🇷",
    showPhoto: true,
    maxPages: 1,
    dateFormat: "MM/YYYY",
    mustInclude: ["photo", "languages"],
    mustExclude: ["age", "maritalStatus"],
    preferredTemplate: "horizon",
    tips: [
      "CV d'une seule page obligatoire",
      "Photo professionnelle recommandée",
      "Ne mentionnez pas votre âge ni situation familiale",
      "Compétences linguistiques très importantes",
    ],
  },
  canada: {
    id: "canada",
    label: "Canada",
    flag: "🇨🇦",
    showPhoto: false,
    maxPages: 2,
    dateFormat: "MM/YYYY",
    mustInclude: [],
    mustExclude: ["photo", "age", "maritalStatus", "nationality"],
    preferredTemplate: "horizon",
    tips: [
      "PAS de photo sur le CV (discrimination)",
      "Ne mentionnez JAMAIS âge, sexe, religion, nationalité",
      "Format 2 pages maximum",
      "Mettez en avant les résultats chiffrés",
      "Mentionnez vos permis de travail si applicable",
    ],
  },
  usa: {
    id: "usa",
    label: "USA",
    flag: "🇺🇸",
    showPhoto: false,
    maxPages: 1,
    dateFormat: "MM/YYYY",
    mustInclude: [],
    mustExclude: ["photo", "age", "maritalStatus", "nationality"],
    preferredTemplate: "horizon",
    tips: [
      "PAS de photo (illégal dans certains états)",
      "Resume d'une seule page pour < 10 ans d'expérience",
      "Utilisez des verbes d'action forts",
      "Quantifiez tout : %, $, chiffres",
    ],
  },
  gulf: {
    id: "gulf",
    label: "Golfe (UAE/Qatar/Arabie)",
    flag: "🇦🇪",
    showPhoto: true,
    maxPages: 3,
    dateFormat: "MM/YYYY",
    mustInclude: ["photo", "nationality", "languages"],
    mustExclude: [],
    preferredTemplate: "essentiel",
    tips: [
      "Photo professionnelle obligatoire",
      "Mentionnez votre nationalité",
      "CV de 2-3 pages accepté",
      "Certifications professionnelles très valorisées",
      "Mentionnez votre visa/permis de travail",
    ],
  },
  germany: {
    id: "germany",
    label: "Allemagne",
    flag: "🇩🇪",
    showPhoto: true,
    maxPages: 2,
    dateFormat: "MM/YYYY",
    mustInclude: ["photo", "languages"],
    mustExclude: [],
    preferredTemplate: "direction",
    tips: [
      "Photo professionnelle en haut à droite",
      "Compétences linguistiques essentielles (Allemand important)",
      "CV structuré et chronologique",
      "Mentionnez vos certifications et formations",
    ],
  },
  other: {
    id: "other",
    label: "Autre",
    flag: "🌍",
    showPhoto: false,
    maxPages: 2,
    dateFormat: "MM/YYYY",
    mustInclude: [],
    mustExclude: [],
    preferredTemplate: "horizon",
    tips: [
      "Adaptez votre CV au pays cible",
      "Renseignez-vous sur les conventions locales",
    ],
  },
};

export interface JobCategory {
  id: JobField;
  label: string;
  icon: string;
  jobs: string[];
  isSimplified: boolean;
  hiddenSections: string[];
  skillLabel: string;
}

export const JOB_CATEGORIES: JobCategory[] = [
  {
    id: "tech",
    label: "Informatique & Tech",
    icon: "💻",
    jobs: [
      "Développeur Web", "Développeur Mobile", "Développeur Full Stack",
      "Data Analyst", "Data Scientist", "DevOps", "Administrateur Système",
      "Designer UI/UX", "Chef de projet IT", "Ingénieur Logiciel",
      "Technicien Informatique", "Développeur Frontend", "Développeur Backend",
    ],
    isSimplified: false,
    hiddenSections: [],
    skillLabel: "Compétences techniques",
  },
  {
    id: "healthcare",
    label: "Santé & Médical",
    icon: "🏥",
    jobs: [
      "Infirmier(e)", "Médecin", "Pharmacien(ne)", "Sage-femme",
      "Aide-soignant(e)", "Kinésithérapeute", "Dentiste",
      "Technicien de laboratoire", "Ambulancier",
    ],
    isSimplified: true,
    hiddenSections: ["projects", "github"],
    skillLabel: "Compétences professionnelles",
  },
  {
    id: "construction",
    label: "Bâtiment & Métiers manuels",
    icon: "🔧",
    jobs: [
      "Maçon", "Plombier", "Électricien", "Menuisier", "Peintre en bâtiment",
      "Soudeur", "Carreleur", "Climaticien", "Mécanicien",
      "Technicien de maintenance", "Ouvrier polyvalent",
    ],
    isSimplified: true,
    hiddenSections: ["projects", "github", "linkedin"],
    skillLabel: "Compétences professionnelles",
  },
  {
    id: "hospitality",
    label: "Hôtellerie & Restauration",
    icon: "🍽️",
    jobs: [
      "Serveur/Serveuse", "Cuisinier(e)", "Chef cuisinier", "Réceptionniste",
      "Barman/Barmaid", "Femme de chambre", "Gouvernant(e)",
      "Directeur d'hôtel", "Pâtissier(e)",
    ],
    isSimplified: true,
    hiddenSections: ["projects", "github"],
    skillLabel: "Compétences professionnelles",
  },
  {
    id: "education",
    label: "Éducation & Formation",
    icon: "📚",
    jobs: [
      "Enseignant(e)", "Professeur universitaire", "Formateur",
      "Éducateur", "Directeur d'école", "Conseiller pédagogique",
      "Animateur", "Moniteur",
    ],
    isSimplified: false,
    hiddenSections: ["github"],
    skillLabel: "Compétences pédagogiques",
  },
  {
    id: "business",
    label: "Commerce & Gestion",
    icon: "💼",
    jobs: [
      "Comptable", "Gestionnaire", "Commercial(e)", "Responsable RH",
      "Assistant(e) de direction", "Responsable marketing",
      "Chargé(e) de communication", "Agent immobilier",
      "Banquier", "Auditeur", "Contrôleur de gestion",
    ],
    isSimplified: false,
    hiddenSections: ["github"],
    skillLabel: "Compétences techniques",
  },
  {
    id: "transport",
    label: "Transport & Logistique",
    icon: "🚛",
    jobs: [
      "Chauffeur poids lourd", "Chauffeur livreur", "Chauffeur VTC/Taxi",
      "Magasinier", "Logisticien", "Agent de transit",
      "Responsable logistique", "Cariste", "Coursier",
    ],
    isSimplified: true,
    hiddenSections: ["projects", "github", "linkedin"],
    skillLabel: "Compétences professionnelles",
  },
  {
    id: "other",
    label: "Autre métier",
    icon: "🌟",
    jobs: [],
    isSimplified: false,
    hiddenSections: [],
    skillLabel: "Compétences",
  },
];

export function getCountryStandard(country: TargetCountry): CountryStandard {
  return COUNTRY_STANDARDS[country] || COUNTRY_STANDARDS.other;
}

export function getJobCategory(field: JobField): JobCategory {
  return JOB_CATEGORIES.find(c => c.id === field) || JOB_CATEGORIES[JOB_CATEGORIES.length - 1];
}

export function isSimplifiedMode(field: JobField): boolean {
  return getJobCategory(field).isSimplified;
}

export function getVisibleSteps(simplifiedMode: boolean) {
  if (simplifiedMode) {
    return [1, 2, 3, 4, 6, 9] as const;
  }
  return [1, 2, 3, 4, 5, 6, 7, 9] as const;
}

export function getAllJobs(): { label: string; category: string; field: JobField }[] {
  const jobs: { label: string; category: string; field: JobField }[] = [];
  for (const cat of JOB_CATEGORIES) {
    for (const job of cat.jobs) {
      jobs.push({ label: job, category: cat.label, field: cat.id });
    }
  }
  return jobs;
}
