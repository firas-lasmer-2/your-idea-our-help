import ResumePreview from "@/components/resume/ResumePreview";
import WebsitePreview from "@/components/website/WebsitePreview";
import { buildSectionsFromTemplate, getTemplateById } from "@/data/website-templates";
import { defaultCustomization, type ResumeCustomization, type ResumeData } from "@/types/resume";
import { defaultGlobalSettings, type WebsiteGlobalSettings } from "@/types/website";
import type { ResumeTemplateId, WebsiteTemplateId } from "@/lib/template-recommendations";

export const RESUME_TEMPLATE_IDS: ResumeTemplateId[] = ["essentiel", "horizon", "trajectoire", "direction", "signature", "academique", "medical", "technique", "impact", "minimal", "mosaic", "prestige", "atlas", "studio"];
export const WEBSITE_TEMPLATE_IDS: WebsiteTemplateId[] = ["profile-clean", "route-pro", "executive-profile", "casefile", "showcase", "spotlight", "dossier", "signal"];

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
  academique: {
    title: "Resume Académique",
    data: {
      jobTarget: "job",
      targetCountry: "tunisia",
      jobField: "education",
      jobTitle: "Enseignant-Chercheur en Informatique",
      experienceLevel: "3-10",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Sami",
        lastName: "Trabelsi",
        email: "sami.trabelsi@univ.tn",
        phone: "+216 71 123 456",
        city: "Tunis",
        linkedIn: "linkedin.com/in/samitrabelsi",
        github: "",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "Université de Tunis El Manar", degree: "Doctorat", field: "Informatique", startDate: "2015", endDate: "2019", current: false, description: "These sur l'apprentissage profond applique a la vision par ordinateur." },
        { id: "edu-2", institution: "ENIT", degree: "Ingénieur", field: "Informatique", startDate: "2010", endDate: "2013", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "Université de Carthage", position: "Maitre assistant", startDate: "2019", endDate: "", current: true, bullets: ["Enseignement IA et Machine Learning", "Encadrement de 8 PFE et 2 theses de mastere"] },
      ],
      skillCategories: [
        { id: "tech", name: "Recherche", skills: ["Deep Learning", "Computer Vision", "NLP", "Python", "PyTorch"] },
      ],
      projects: [
        { id: "proj-1", name: "Detection d'anomalies par CNN", description: "Publication acceptee a ICPR 2023.", url: "", technologies: ["Deep Learning", "CNN", "Medical Imaging"] },
      ],
      certifications: [{ id: "cert-1", name: "HDR en preparation", issuer: "Univ. Tunis El Manar", date: "2025", url: "" }],
      languages: [{ name: "Français", level: "Courant" }, { name: "Anglais", level: "Professionnel" }, { name: "Arabe", level: "Natif" }],
      interests: ["Recherche", "Conferences"],
      summary: "Enseignant-chercheur en informatique specialise en IA et vision par ordinateur, avec des publications internationales et une experience d'encadrement academique.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#1e40af", fontPair: "inter", spacing: "normal" },
  },
  medical: {
    title: "Resume Médical",
    data: {
      jobTarget: "job",
      targetCountry: "tunisia",
      jobField: "healthcare",
      jobTitle: "Infirmier diplômé d'État",
      experienceLevel: "3-10",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Fatma",
        lastName: "Bouazizi",
        email: "fatma.b@email.com",
        phone: "+216 98 765 432",
        city: "Sfax",
        linkedIn: "",
        github: "",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "ESSTHS", degree: "Licence appliquée", field: "Sciences Infirmières", startDate: "2016", endDate: "2019", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "CHU Habib Bourguiba", position: "Infirmière en réanimation", startDate: "2020", endDate: "", current: true, bullets: ["Soins intensifs et surveillance post-operatoire", "Gestion des urgences et protocoles de reanimation"] },
        { id: "exp-2", company: "Clinique Les Oliviers", position: "Infirmière polyvalente", startDate: "2019", endDate: "2020", current: false, bullets: ["Soins pre et post-operatoires", "Administration des traitements"] },
      ],
      skillCategories: [
        { id: "clin", name: "Compétences cliniques", skills: ["Réanimation", "Soins intensifs", "Urgences", "Perfusion", "Pansements"] },
      ],
      projects: [],
      certifications: [
        { id: "cert-1", name: "BLS/ACLS", issuer: "AHA", date: "2023", url: "" },
        { id: "cert-2", name: "Diplôme d'État Infirmier", issuer: "Ministère de la Santé", date: "2019", url: "" },
      ],
      languages: [{ name: "Arabe", level: "Natif" }, { name: "Français", level: "Courant" }],
      interests: ["Volontariat médical"],
      summary: "Infirmière diplômée avec 5 ans d'expérience en réanimation et soins intensifs, rigoureuse et réactive.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#0891b2", fontPair: "inter", spacing: "normal" },
  },
  technique: {
    title: "Resume Technique",
    data: {
      jobTarget: "job",
      targetCountry: "tunisia",
      jobField: "construction",
      jobTitle: "Électricien industriel",
      experienceLevel: "3-10",
      simplifiedMode: true,
      personalInfo: {
        firstName: "Mohamed",
        lastName: "Chaabane",
        email: "med.chaabane@email.com",
        phone: "+216 55 111 222",
        city: "Sousse",
        linkedIn: "",
        github: "",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "Centre ATFP Sousse", degree: "BTP (Brevet de Technicien Professionnel)", field: "Électricité industrielle", startDate: "2016", endDate: "2018", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "Leoni Tunisie", position: "Électricien industriel", startDate: "2020", endDate: "", current: true, bullets: ["Installation et maintenance électrique industrielle", "Lecture de schemas et diagnostic de pannes", "Respect strict des normes de securite"] },
        { id: "exp-2", company: "STEG Sous-traitance", position: "Aide-électricien", startDate: "2018", endDate: "2020", current: false, bullets: ["Tirage de cables et raccordements", "Travail en equipe sur chantiers"] },
      ],
      skillCategories: [
        { id: "tech", name: "Compétences techniques", skills: ["Câblage industriel", "Lecture de schémas", "Automates", "Sécurité électrique", "Soudure"] },
      ],
      projects: [],
      certifications: [
        { id: "cert-1", name: "Habilitation électrique B2V", issuer: "Formation continue", date: "2022", url: "" },
        { id: "cert-2", name: "Permis B", issuer: "Tunisie", date: "2017", url: "" },
      ],
      languages: [{ name: "Arabe", level: "Natif" }, { name: "Français", level: "Professionnel" }],
      interests: ["Bricolage", "Électronique"],
      summary: "Électricien industriel expérimenté, spécialisé en installation et maintenance, avec habilitation B2V et respect des normes de sécurité.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#d97706", fontPair: "inter", spacing: "normal" },
  },
  impact: {
    title: "Resume Impact",
    data: {
      jobTarget: "job",
      targetCountry: "france",
      jobField: "tech",
      jobTitle: "Lead Product Manager",
      experienceLevel: "3-10",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Amine",
        lastName: "Khelifi",
        email: "amine.khelifi@email.com",
        phone: "+216 22 100 200",
        city: "Tunis",
        linkedIn: "linkedin.com/in/aminekhelifi",
        github: "github.com/aminekhelifi",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "ESPRIT", degree: "Ingénieur", field: "Informatique", startDate: "2015", endDate: "2018", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "Medtech SaaS", position: "Lead Product Manager", startDate: "2022", endDate: "", current: true, bullets: ["Lancement de 3 fonctionnalités majeures avec +40% d'adoption", "Pilotage d'une roadmap sur 6 mois avec 12 parties prenantes", "Réduction du taux de churn de 18% via itérations UX rapides"] },
        { id: "exp-2", company: "Fintech Lab", position: "Product Manager", startDate: "2019", endDate: "2022", current: false, bullets: ["Delivery de 2 produits B2B de A à Z", "Coordination design, dev et ops sur sprints bi-hebdomadaires"] },
      ],
      skillCategories: [
        { id: "tech", name: "Product & Strategy", skills: ["Roadmap", "OKRs", "Agile", "A/B testing", "Metrics"] },
        { id: "soft", name: "Outils", skills: ["Figma", "Jira", "Mixpanel", "Notion", "SQL"] },
        { id: "tools", name: "Langues tech", skills: ["Python", "APIs REST"] },
      ],
      projects: [
        { id: "proj-1", name: "Refonte onboarding mobile", description: "Réduction du temps d'activation de 7j à 2j sur 50k utilisateurs.", url: "", technologies: ["UX", "Analytics", "Mobile"] },
        { id: "proj-2", name: "Dashboard décisionnel", description: "Produit interne utilisé par les équipes ops pour piloter la performance.", url: "", technologies: ["Data", "SQL", "Notion"] },
      ],
      certifications: [{ id: "cert-1", name: "Professional Scrum Master I", issuer: "Scrum.org", date: "2021", url: "" }],
      languages: [{ name: "Français", level: "Courant" }, { name: "Anglais", level: "Professionnel" }],
      interests: ["Produit", "Startups", "Data"],
      summary: "Product Manager orienté impact, spécialisé dans la croissance B2B SaaS et le delivery rapide de fonctionnalités critiques.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#0ea5e9", fontPair: "inter", spacing: "normal" },
  },
  minimal: {
    title: "Resume Minimal",
    data: {
      jobTarget: "job",
      targetCountry: "france",
      jobField: "tech",
      jobTitle: "Directrice Artistique",
      experienceLevel: "10+",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Sarra",
        lastName: "Kammoun",
        email: "sarra@kammoun.studio",
        phone: "+216 55 200 300",
        city: "Sfax",
        linkedIn: "linkedin.com/in/sarrakammoun",
        github: "",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "ESSTED", degree: "Master", field: "Design graphique", startDate: "2011", endDate: "2013", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "Agence Latitude", position: "Directrice Artistique", startDate: "2018", endDate: "", current: true, bullets: ["Direction créative de campagnes pour 20+ marques", "Management d'une équipe de 5 designers et motion designers", "Mise en place d'un design system multimarque"] },
        { id: "exp-2", company: "Studio Bloom", position: "Designer Senior", startDate: "2014", endDate: "2018", current: false, bullets: ["Branding complet pour 30+ clients PME", "Direction de shootings et productions visuelles"] },
      ],
      skillCategories: [
        { id: "craft", name: "Discipline", skills: ["Direction artistique", "Branding", "Typographie", "Illustration", "Motion"] },
        { id: "tools", name: "Outils", skills: ["Adobe Suite", "Figma", "Cinema 4D"] },
      ],
      projects: [
        { id: "proj-1", name: "Identité Banque Verte", description: "Refonte complète de l'identité visuelle d'une banque régionale — logo, charte, signalétique.", url: "", technologies: ["Branding", "Print", "Digital"] },
      ],
      certifications: [],
      languages: [{ name: "Arabe", level: "Natif" }, { name: "Français", level: "Courant" }, { name: "Anglais", level: "Professionnel" }],
      interests: ["Photographie argentique", "Typographie expérimentale"],
      summary: "Directrice artistique avec 12 ans d'expérience en branding, identité visuelle et direction créative pour des marques ambitieuses.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#7c3aed", fontPair: "inter", spacing: "spacious" },
  },
  mosaic: {
    title: "Resume Mosaic",
    data: {
      jobTarget: "job",
      targetCountry: "france",
      jobField: "business",
      jobTitle: "Consultant Digital & Transformation",
      experienceLevel: "3-10",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Nour",
        lastName: "Ben Said",
        email: "nour.bensaid@email.com",
        phone: "+216 98 300 400",
        city: "Tunis",
        linkedIn: "linkedin.com/in/nourbensaid",
        github: "",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "IHEC Carthage", degree: "Mastère", field: "Management digital", startDate: "2018", endDate: "2020", current: false, description: "" },
        { id: "edu-2", institution: "ISCAE", degree: "Licence", field: "Gestion", startDate: "2015", endDate: "2018", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "Innov Conseil", position: "Consultant Digital Senior", startDate: "2021", endDate: "", current: true, bullets: ["Accompagnement de 15 PME dans leur transition numérique", "Animation d'ateliers de design thinking et stratégie digitale", "Déploiement de solutions CRM et automatisation marketing"] },
        { id: "exp-2", company: "Agence Web360", position: "Chef de Projet Digital", startDate: "2019", endDate: "2021", current: false, bullets: ["Coordination projets web et mobile", "Suivi budgets et planning sur 10+ projets simultanés"] },
      ],
      skillCategories: [
        { id: "strategy", name: "Stratégie", skills: ["Transformation digitale", "Design thinking", "CRM", "SEO/SEA"] },
        { id: "tools", name: "Outils & Tech", skills: ["HubSpot", "Salesforce", "WordPress", "Notion", "Power BI"] },
        { id: "soft", name: "Soft skills", skills: ["Leadership", "Facilitation", "Communication", "Adaptabilité"] },
      ],
      projects: [
        { id: "proj-1", name: "Digitalisation PME Textile", description: "Migration vers un CRM + ecommerce B2B pour 3 entreprises du secteur.", url: "", technologies: ["CRM", "E-commerce", "Formation"] },
        { id: "proj-2", name: "Audit digital 360°", description: "Framework d'audit utilisé par 5 consultants junior.", url: "", technologies: ["Analyse", "Reporting", "Stratégie"] },
      ],
      certifications: [
        { id: "cert-1", name: "Google Analytics Certified", issuer: "Google", date: "2022", url: "" },
        { id: "cert-2", name: "HubSpot Marketing Certification", issuer: "HubSpot", date: "2023", url: "" },
      ],
      languages: [{ name: "Arabe", level: "Natif" }, { name: "Français", level: "Courant" }, { name: "Anglais", level: "B2" }],
      interests: ["Innovation sociale", "Veille techno", "Mentorat"],
      summary: "Consultant digital polyvalent, à l'aise aussi bien sur la stratégie que l'exécution, avec une expertise en transformation des organisations.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#0d9488", fontPair: "inter", spacing: "normal" },
  },
  prestige: {
    title: "Resume Prestige",
    data: {
      jobTarget: "job",
      targetCountry: "germany",
      jobField: "business",
      jobTitle: "Directeur Financier",
      experienceLevel: "10+",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Rami",
        lastName: "Bouslama",
        email: "rami.bouslama@email.com",
        phone: "+216 71 500 600",
        city: "Tunis",
        linkedIn: "linkedin.com/in/ramibouslama",
        github: "",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "IHEC Carthage", degree: "MBA", field: "Finance & Stratégie", startDate: "2009", endDate: "2011", current: false, description: "" },
        { id: "edu-2", institution: "ESSECT", degree: "Mastère", field: "Comptabilité & Finance", startDate: "2007", endDate: "2009", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "Groupe Poulina", position: "Directeur Financier", startDate: "2018", endDate: "", current: true, bullets: ["Supervision d'un budget annuel de 80 M€ sur 4 filiales", "Réduction des coûts opérationnels de 11% en 2 exercices", "Mise en conformité IFRS et relation avec les auditeurs externes"] },
        { id: "exp-2", company: "Banque de Tunisie", position: "Responsable Contrôle de Gestion", startDate: "2013", endDate: "2018", current: false, bullets: ["Pilotage du reporting mensuel Groupe (15 entités)", "Déploiement d'un ERP Oracle Financials"] },
        { id: "exp-3", company: "PwC Tunisie", position: "Auditeur Senior", startDate: "2011", endDate: "2013", current: false, bullets: ["Missions d'audit légal et contractuel secteur bancaire"] },
      ],
      skillCategories: [
        { id: "finance", name: "Finance & Contrôle", skills: ["IFRS", "Reporting Groupe", "Audit", "Trésorerie", "M&A"] },
        { id: "tools", name: "Outils", skills: ["Oracle Financials", "SAP", "Excel avancé", "Power BI"] },
      ],
      projects: [
        { id: "proj-1", name: "Programme de conformité IFRS", description: "Déploiement sur 4 filiales — accompagnement équipes et relation commissaires.", url: "", technologies: ["IFRS", "Formation", "Audit"] },
      ],
      certifications: [
        { id: "cert-1", name: "CPA (Expertise Comptable)", issuer: "OECT Tunisie", date: "2014", url: "" },
        { id: "cert-2", name: "CFA Level 2", issuer: "CFA Institute", date: "2016", url: "" },
      ],
      languages: [{ name: "Arabe", level: "Natif" }, { name: "Français", level: "Courant" }, { name: "Anglais", level: "Professionnel" }, { name: "Allemand", level: "A2" }],
      interests: ["Gouvernance d'entreprise", "Conférences finance"],
      summary: "Dirigeant financier avec 14 ans d'expérience en finance d'entreprise, audit et contrôle de gestion, alliant rigueur technique et vision stratégique.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#b8860b", fontPair: "inter", spacing: "spacious" },
  },
  atlas: {
    title: "Resume Atlas",
    data: {
      jobTarget: "job",
      targetCountry: "canada",
      jobField: "tech",
      jobTitle: "Ingénieur DevOps",
      experienceLevel: "3-10",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Yassine",
        lastName: "Dridi",
        email: "yassine.dridi@email.com",
        phone: "+216 26 700 800",
        city: "Tunis",
        linkedIn: "linkedin.com/in/yassinedridi",
        github: "github.com/yassinedridi",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "INSAT", degree: "Ingénieur", field: "Réseaux et Télécommunications", startDate: "2015", endDate: "2018", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "CloudScale (Montréal, remote)", position: "Ingénieur DevOps Senior", startDate: "2022", endDate: "", current: true, bullets: ["Infrastructure as Code avec Terraform sur AWS et GCP", "Réduction du temps de déploiement de 35% via CI/CD optimisé", "Supervision d'une équipe de 4 ingénieurs infra"] },
        { id: "exp-2", company: "Telnet Tunisie", position: "Ingénieur Systèmes & Cloud", startDate: "2018", endDate: "2022", current: false, bullets: ["Migration on-premise vers AWS (150+ VMs)", "Mise en place monitoring Prometheus/Grafana"] },
      ],
      skillCategories: [
        { id: "infra", name: "Cloud & Infrastructure", skills: ["AWS", "GCP", "Terraform", "Kubernetes", "Docker"] },
        { id: "devops", name: "DevOps & CI/CD", skills: ["GitHub Actions", "Jenkins", "ArgoCD", "Helm", "Ansible"] },
        { id: "lang", name: "Langages", skills: ["Python", "Bash", "Go"] },
      ],
      projects: [
        { id: "proj-1", name: "Migration multi-cloud", description: "Architecture hybride AWS/GCP pour haute disponibilité et réduction des coûts de 22%.", url: "", technologies: ["AWS", "GCP", "Terraform"] },
      ],
      certifications: [
        { id: "cert-1", name: "AWS Solutions Architect", issuer: "Amazon", date: "2022", url: "" },
        { id: "cert-2", name: "Certified Kubernetes Administrator", issuer: "CNCF", date: "2023", url: "" },
      ],
      languages: [
        { name: "Arabe", level: "Natif" },
        { name: "Français", level: "Courant" },
        { name: "Anglais", level: "C1" },
        { name: "Allemand", level: "A2" },
      ],
      interests: ["Open source", "Infrastructure distribuée"],
      summary: "Ingénieur DevOps certifié AWS et CKA, spécialisé en cloud infrastructure et automatisation, en mobilité vers le Canada.",
      additionalSections: [],
    },
    customization: { ...defaultCustomization, accentColor: "#0369a1", fontPair: "inter", spacing: "normal" },
  },
  studio: {
    title: "Resume Studio",
    data: {
      jobTarget: "job",
      targetCountry: "france",
      jobField: "tech",
      jobTitle: "Développeuse Full Stack Freelance",
      experienceLevel: "3-10",
      simplifiedMode: false,
      personalInfo: {
        firstName: "Ines",
        lastName: "Abidi",
        email: "ines@abidi.dev",
        phone: "+216 50 900 100",
        city: "Sousse",
        linkedIn: "linkedin.com/in/inesabidi",
        github: "github.com/inesabidi",
        photoUrl: "",
      },
      education: [
        { id: "edu-1", institution: "ESPRIT", degree: "Ingénieur", field: "Génie Logiciel", startDate: "2016", endDate: "2019", current: false, description: "" },
      ],
      experience: [
        { id: "exp-1", company: "Freelance — 12 clients", position: "Développeuse Full Stack", startDate: "2020", endDate: "", current: true, bullets: ["Applications web et mobile pour startups et PME", "Architecture backend Node.js + React frontend", "Livraison en autonomie totale de la spec au déploiement"] },
        { id: "exp-2", company: "Vermeg", position: "Développeuse Junior", startDate: "2019", endDate: "2020", current: false, bullets: ["Développement backend Java Spring", "Tests unitaires et documentation technique"] },
      ],
      skillCategories: [
        { id: "frontend", name: "Frontend", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Figma-to-code"] },
        { id: "backend", name: "Backend", skills: ["Node.js", "Express", "PostgreSQL", "Redis", "REST APIs"] },
        { id: "devops", name: "DevOps & Outils", skills: ["Docker", "Vercel", "GitHub Actions", "Supabase"] },
      ],
      projects: [
        { id: "proj-1", name: "Plateforme RH SaaS", description: "Application de gestion des absences et congés pour une PME de 200 employés — de zéro à production en 3 mois.", url: "hrplatform.demo.com", technologies: ["React", "Node.js", "PostgreSQL", "Docker"] },
        { id: "proj-2", name: "Marketplace Artisanat Tunisien", description: "E-commerce B2C avec paiement, gestion vendeurs et tableau de bord analytics.", url: "artisanat.tn", technologies: ["Next.js", "Stripe", "Supabase"] },
        { id: "proj-3", name: "App Mobile Coaching Sportif", description: "Application React Native pour coach personnel — suivi séances, nutrition, objectifs.", url: "", technologies: ["React Native", "Firebase", "Expo"] },
      ],
      certifications: [
        { id: "cert-1", name: "AWS Cloud Practitioner", issuer: "Amazon", date: "2023", url: "" },
      ],
      languages: [{ name: "Arabe", level: "Natif" }, { name: "Français", level: "Courant" }, { name: "Anglais", level: "Professionnel" }],
      interests: ["Open source", "Side projects", "UI design"],
      summary: "Développeuse full stack freelance, spécialisée en React/Node.js, qui livre des produits complets de bout en bout avec rigueur et autonomie.",
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
