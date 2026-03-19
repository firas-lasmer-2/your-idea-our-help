export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  linkedIn: string;
  github: string;
  photoUrl: string;
  militaryService?: string;
  cin?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  technologies: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface ResumeData {
  jobTarget: string;
  targetCountry: string;
  jobField: string;
  jobTitle: string;
  experienceLevel: string;
  simplifiedMode: boolean;
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skillCategories: SkillCategory[];
  projects: Project[];
  certifications: Certification[];
  languages: { name: string; level: string }[];
  interests: string[];
  summary: string;
  additionalSections: string[];
}

export interface ResumeCustomization {
  accentColor: string;
  fontPair: string;
  showPhoto: boolean;
  spacing: string;
  sectionOrder: string[];
}

export const defaultResumeData: ResumeData = {
  jobTarget: "",
  targetCountry: "",
  jobField: "",
  jobTitle: "",
  experienceLevel: "",
  simplifiedMode: false,
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    linkedIn: "",
    github: "",
    photoUrl: "",
  },
  education: [],
  experience: [],
  skillCategories: [
    { id: "tech", name: "Compétences techniques", skills: [] },
    { id: "soft", name: "Compétences personnelles", skills: [] },
    { id: "tools", name: "Outils & Logiciels", skills: [] },
  ],
  projects: [],
  certifications: [],
  languages: [],
  interests: [],
  summary: "",
  additionalSections: [],
};

export const defaultCustomization: ResumeCustomization = {
  accentColor: "#0d9488",
  fontPair: "inter",
  showPhoto: false,
  spacing: "normal",
  sectionOrder: ["summary", "education", "experience", "skills", "projects", "certifications", "languages", "interests"],
};

export const TUNISIAN_CITIES = [
  "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Gafsa",
  "Monastir", "Ben Arous", "Kasserine", "Médenine", "Nabeul", "Tataouine",
  "Béja", "Jendouba", "Mahdia", "Sidi Bouzid", "Tozeur", "Siliana",
  "Kébili", "Zaghouan", "Manouba", "La Manouba",
];

export const TUNISIAN_INSTITUTIONS = [
  // Universités
  "Université de Tunis",
  "Université de Tunis El Manar",
  "Université de Carthage",
  "Université de la Manouba",
  "Université de Sousse",
  "Université de Sfax",
  "Université de Monastir",
  "Université de Gabès",
  "Université de Gafsa",
  "Université de Jendouba",
  "Université de Kairouan",
  "Université Virtuelle de Tunis",
  // Écoles d'ingénieurs & privées
  "ESPRIT",
  "TEK-UP",
  "SESAME",
  "SUP'COM",
  "INSAT",
  "ENIT",
  "ENSI",
  "ISI",
  "FST",
  "IHEC Carthage",
  "ESSECT",
  "ISCAE",
  "ENIS",
  "ENIG",
  "ESSTHS",
  "ISGIS",
  "ISIMS",
  // ISET
  "ISET Tunis",
  "ISET Sousse",
  "ISET Sfax",
  "ISET Nabeul",
  "ISET Bizerte",
  "ISET Kairouan",
  "ISET Gabès",
  "ISET Tozeur",
  "ISET Jendouba",
  "ISET Kélibia",
  "ISET Charguia",
  "ISET Radès",
  "ISET Djerba",
  "ISET Kasserine",
  "ISET Siliana",
  "ISET Médenine",
  "ISET Kef",
  "ISET Zaghouan",
  // Centres de formation professionnelle (ATFP)
  "Centre ATFP Tunis",
  "Centre ATFP Sousse",
  "Centre ATFP Sfax",
  "Centre ATFP Bizerte",
  "Centre ATFP Nabeul",
  "Centre ATFP Gabès",
  "Centre ATFP Kairouan",
  "Centre ATFP Monastir",
  "Centre ATFP Médenine",
  "Centre ATFP Ben Arous",
  // CFPA
  "CFPA Tunis",
  "CFPA Sousse",
  "CFPA Sfax",
  "CFPA Bizerte",
  // Centres sectoriels de formation
  "CENAFFIF",
  "Centre Sectoriel de Formation en Informatique",
  "Centre Sectoriel de Formation en Tourisme",
  "Centre Sectoriel de Formation en Bâtiment",
  "Centre Sectoriel de Formation en Mécanique",
  "Centre Sectoriel de Formation en Électricité",
  // Lycées
  "Lycée Pilote (toutes villes)",
  "Lycée Secondaire",
  // Plateformes en ligne
  "Coursera",
  "Udemy",
  "OpenClassrooms",
  "Google Career Certificates",
  "LinkedIn Learning",
];

// Keep backward compat alias
export const TUNISIAN_UNIVERSITIES = TUNISIAN_INSTITUTIONS;

export const DEGREE_TYPES = [
  // Universitaire
  "Licence (LMD)",
  "Licence appliquée",
  "Licence fondamentale",
  "Mastère",
  "Mastère professionnel",
  "Mastère de recherche",
  "Ingénieur",
  "Doctorat",
  // Technique & professionnel
  "BTP (Brevet de Technicien Professionnel)",
  "BTS (Brevet de Technicien Supérieur)",
  "CAP (Certificat d'Aptitude Professionnelle)",
  "CC (Certificat de Compétence)",
  "CFC (Certificat de Formation Continue)",
  // Formation professionnelle
  "Attestation de formation",
  "Formation professionnelle",
  "Certificat de compétence",
  "Diplôme de formation professionnelle",
  "Qualification professionnelle",
  // Secondaire
  "Baccalauréat",
  "Baccalauréat Sciences",
  "Baccalauréat Lettres",
  "Baccalauréat Informatique",
  "Baccalauréat Économie & Gestion",
  "Baccalauréat Technique",
  "Baccalauréat Sport",
  // Certificats & autre
  "Certificat",
  "Certificat en ligne",
  "Diplôme universitaire (DU)",
  "Autre",
];

export const RESUME_STEPS = [
  { id: 1, label: "steps.personalInfo", icon: "User" },
  { id: 2, label: "steps.experience", icon: "Briefcase" },
  { id: 3, label: "steps.education", icon: "GraduationCap" },
  { id: 4, label: "steps.skills", icon: "Wrench" },
  { id: 5, label: "steps.design", icon: "Palette" },
  { id: 9, label: "steps.preview", icon: "Eye" },
] as const;
