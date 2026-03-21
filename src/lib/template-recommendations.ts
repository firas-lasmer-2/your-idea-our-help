import type { ExperienceLevel, JobField, TargetCountry } from "@/lib/country-standards";
import type { WebsiteMode } from "@/types/website";

export type ResumeTemplateId =
  | "essentiel"
  | "horizon"
  | "trajectoire"
  | "direction"
  | "signature"
  | "academique"
  | "medical"
  | "technique"
  | "impact"
  | "minimal"
  | "mosaic"
  | "prestige"
  | "atlas"
  | "studio";

export type WebsiteTemplateId =
  | "profile-clean"
  | "route-pro"
  | "executive-profile"
  | "casefile"
  | "showcase"
  | "spotlight"
  | "dossier"
  | "signal";

export interface ResumeTemplateMeta {
  id: ResumeTemplateId;
  label: string;
  styleLabel: string;
  bestFor: string;
  emphasis: string;
  atsLabel: string;
  density: string;
  photoLabel: string;
}

export interface WebsiteTemplateMeta {
  id: WebsiteTemplateId;
  label: string;
  styleLabel: string;
  bestFor: string;
  emphasis: string;
  motionLabel: string;
}

const LEGACY_RESUME_TEMPLATE_MAP: Record<string, ResumeTemplateId> = {
  classic: "essentiel",
  modern: "horizon",
  creative: "signature",
  executive: "direction",
  minimal: "essentiel",
  timeline: "trajectoire",
  bold: "signature",
  elegant: "direction",
};

const LEGACY_WEBSITE_TEMPLATE_MAP: Record<string, WebsiteTemplateId> = {
  "professional-profile": "profile-clean",
  "field-ready-profile": "route-pro",
  "portfolio-minimal": "casefile",
  "portfolio-bold": "showcase",
};

const RESUME_TEMPLATE_META: Record<ResumeTemplateId, ResumeTemplateMeta> = {
  essentiel: {
    id: "essentiel",
    label: "Essentiel",
    styleLabel: "ATS simple et net",
    bestFor: "transport, sante, hotellerie, profils terrain, premier emploi",
    emphasis: "experience, lisibilite, certifications, lecture rapide",
    atsLabel: "ATS maximal",
    density: "compact",
    photoLabel: "photo optionnelle",
  },
  horizon: {
    id: "horizon",
    label: "Horizon",
    styleLabel: "Moderne equilibre",
    bestFor: "la majorite des candidatures, profils internationaux, business, support",
    emphasis: "clarte, competences, structure moderne sans risque",
    atsLabel: "ATS fort",
    density: "equilibre",
    photoLabel: "photo optionnelle",
  },
  trajectoire: {
    id: "trajectoire",
    label: "Trajectoire",
    styleLabel: "Progression visible",
    bestFor: "tech confirme, ingenierie, profils avec evolution de carriere",
    emphasis: "chronologie, promotions, responsabilites",
    atsLabel: "ATS fort",
    density: "equilibre",
    photoLabel: "sans photo par defaut",
  },
  direction: {
    id: "direction",
    label: "Direction",
    styleLabel: "Premium et senior",
    bestFor: "cadres, finance, juridique, management, direction",
    emphasis: "posture, resultats, credibilite executive",
    atsLabel: "ATS bon",
    density: "aere",
    photoLabel: "photo optionnelle",
  },
  signature: {
    id: "signature",
    label: "Signature",
    styleLabel: "Personnalite maitrisee",
    bestFor: "marketing, produit, design, communication, roles creatifs",
    emphasis: "identite, projets, impact visuel controle",
    atsLabel: "ATS moyen",
    density: "equilibre",
    photoLabel: "photo recommandee si le marche l'accepte",
  },
  academique: {
    id: "academique",
    label: "Académique",
    styleLabel: "Universitaire et recherche",
    bestFor: "enseignants, chercheurs, doctorants, candidatures universitaires",
    emphasis: "formation, publications, recherche, diplomes",
    atsLabel: "ATS fort",
    density: "equilibre",
    photoLabel: "photo optionnelle",
  },
  medical: {
    id: "medical",
    label: "Médical",
    styleLabel: "Santé et clinique",
    bestFor: "medecins, infirmiers, pharmaciens, profils de sante",
    emphasis: "certifications, experience clinique, diplomes medicaux",
    atsLabel: "ATS fort",
    density: "equilibre",
    photoLabel: "photo optionnelle",
  },
  technique: {
    id: "technique",
    label: "Technique",
    styleLabel: "Métiers terrain et manuels",
    bestFor: "batiment, electricite, mecanique, metiers avec permis et licences",
    emphasis: "permis, certifications, experience terrain, competences pratiques",
    atsLabel: "ATS maximal",
    density: "compact",
    photoLabel: "photo optionnelle",
  },
  impact: {
    id: "impact",
    label: "Impact",
    styleLabel: "Tech audacieux, barres de compétences",
    bestFor: "tech, product, ingenierie, startups, profils digitaux",
    emphasis: "competences visuelles, projets quantifies, header couleur fort",
    atsLabel: "ATS bon",
    density: "equilibre",
    photoLabel: "photo optionnelle",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    styleLabel: "Typographie pure, ultra-aere",
    bestFor: "designers, directeurs artistiques, profils seniors creatifs",
    emphasis: "lisibilite, gout, identite forte sans decoration",
    atsLabel: "ATS bon",
    density: "aere",
    photoLabel: "sans photo par defaut",
  },
  mosaic: {
    id: "mosaic",
    label: "Mosaic",
    styleLabel: "Grille bento, vue d'ensemble",
    bestFor: "profils polyvalents, reconversions, consultants, chefs de projet",
    emphasis: "polyvalence, competences larges, projets multiples",
    atsLabel: "ATS bon",
    density: "equilibre",
    photoLabel: "photo optionnelle",
  },
  prestige: {
    id: "prestige",
    label: "Prestige",
    styleLabel: "Premium sombre, gold accent",
    bestFor: "finance, juridique, conseil, audit, banque, direction generale",
    emphasis: "credibilite executive, formation premium, certifications",
    atsLabel: "ATS fort",
    density: "aere",
    photoLabel: "photo optionnelle",
  },
  atlas: {
    id: "atlas",
    label: "Atlas",
    styleLabel: "International, langues en avant",
    bestFor: "candidats bilingues, profils internationaux, mobilite Canada USA Europe",
    emphasis: "langues, mobilite, parcours international, adaptabilite",
    atsLabel: "ATS fort",
    density: "equilibre",
    photoLabel: "photo recommandee",
  },
  studio: {
    id: "studio",
    label: "Studio",
    styleLabel: "Portfolio-first, réalisations en vedette",
    bestFor: "freelances, developpeurs independants, designers, profils projet-forts",
    emphasis: "projets, realisations, competences visuelles, liens portfolio",
    atsLabel: "ATS bon",
    density: "equilibre",
    photoLabel: "photo optionnelle",
  },
};

const WEBSITE_TEMPLATE_META: Record<WebsiteTemplateId, WebsiteTemplateMeta> = {
  "profile-clean": {
    id: "profile-clean",
    label: "Profile Clean",
    styleLabel: "Recruteur-ready",
    bestFor: "la majorite des candidats et candidatures generalistes",
    emphasis: "presentation claire, experience, contact immediat",
    motionLabel: "calme",
  },
  "route-pro": {
    id: "route-pro",
    label: "Route Pro",
    styleLabel: "Contact et disponibilite d'abord",
    bestFor: "transport, sante, batiment, hotellerie, metiers terrain",
    emphasis: "permis, disponibilite, confiance, appel rapide",
    motionLabel: "quasi statique",
  },
  "executive-profile": {
    id: "executive-profile",
    label: "Executive Profile",
    styleLabel: "Premium discret",
    bestFor: "managers, consultants, profils corporate seniors",
    emphasis: "positionnement, leadership, credibilite",
    motionLabel: "calme",
  },
  casefile: {
    id: "casefile",
    label: "Casefile",
    styleLabel: "Case studies sobres",
    bestFor: "product, design, data, portfolio professionnel",
    emphasis: "projets, resultats, narration propre",
    motionLabel: "leger",
  },
  showcase: {
    id: "showcase",
    label: "Showcase",
    styleLabel: "Impact visuel controle",
    bestFor: "frontend, design, branding, profils projet forts",
    emphasis: "hero, projets, preuve visuelle, personnalite",
    motionLabel: "dynamique",
  },
  spotlight: {
    id: "spotlight",
    label: "Spotlight",
    styleLabel: "Dark portfolio dramatique",
    bestFor: "tech senior, frontend, fullstack, profils creatifs confirmes",
    emphasis: "projets, performance, presence forte, tech stack",
    motionLabel: "dynamique",
  },
  dossier: {
    id: "dossier",
    label: "Dossier",
    styleLabel: "Profil structuré avec données",
    bestFor: "profils experimentes, RH, management, finance, conseil",
    emphasis: "statistiques, credibilite, timeline, lisibilite maximale",
    motionLabel: "calme",
  },
  signal: {
    id: "signal",
    label: "Signal",
    styleLabel: "Page lien minimaliste",
    bestFor: "freelances, createurs de contenu, profils en mobilite",
    emphasis: "photo, bio courte, liens, contact rapide",
    motionLabel: "quasi statique",
  },
};

export function normalizeResumeTemplateId(templateId?: string | null): ResumeTemplateId {
  if (!templateId) return "horizon";
  if (templateId in RESUME_TEMPLATE_META) {
    return templateId as ResumeTemplateId;
  }
  return LEGACY_RESUME_TEMPLATE_MAP[templateId] || "horizon";
}

export function normalizeWebsiteTemplateId(templateId?: string | null, mode?: WebsiteMode | null): WebsiteTemplateId {
  if (templateId && templateId in WEBSITE_TEMPLATE_META) {
    return templateId as WebsiteTemplateId;
  }
  if (templateId && templateId in LEGACY_WEBSITE_TEMPLATE_MAP) {
    return LEGACY_WEBSITE_TEMPLATE_MAP[templateId];
  }
  return mode === "portfolio" ? "casefile" : "profile-clean";
}

export function getResumeTemplateMeta(templateId: string) {
  return RESUME_TEMPLATE_META[normalizeResumeTemplateId(templateId)] || null;
}

export function getWebsiteTemplateMeta(templateId: string, mode?: WebsiteMode) {
  return WEBSITE_TEMPLATE_META[normalizeWebsiteTemplateId(templateId, mode)] || null;
}

export function getRecommendedResumeTemplate(input: {
  targetCountry?: TargetCountry | "";
  jobField?: JobField | "";
  experienceLevel?: ExperienceLevel | "";
  jobTitle?: string;
}) {
  const title = (input.jobTitle || "").toLowerCase();
  const country = input.targetCountry || "other";
  const field = input.jobField || "other";
  const level = input.experienceLevel || "none";

  const isCreativeRole = /design|designer|graph|ux|ui|brand|contenu|content|social/i.test(title);
  const isSalesOrMarketing = /marketing|commercial|sales|vente|communication/i.test(title);
  const isExecutiveRole = /director|directeur|manager|head|lead|responsable|chef/i.test(title);
  const isAcademicRole = /professeur|chercheur|enseignant|doctorant|research|university|universite|teacher|lecturer/i.test(title);
  const isMedicalRole = /medecin|docteur|infirmier|pharmacien|dentiste|kinesitherapeut|sage.femme|nurse|physician|doctor/i.test(title);
  const isTradeRole = /electricien|plombier|mecanicien|soudeur|charpentier|macon|technicien|ouvrier|installateur/i.test(title);
  const isFinanceOrLaw = /financ|banqu|audit|consult|juridique|avocat|comptabl|notaire|assur|tresor|conform/i.test(title);
  const isFreelance = /freelance|independant|auto-entr|entrepreneur|fondateur|founder/i.test(title);
  const isInternational = country === "canada" || country === "usa" || country === "germany";

  let id: ResumeTemplateId = "horizon";
  let reason = "Le meilleur equilibre entre lisibilite, professionnalisme et modernite.";

  if (isAcademicRole || field === "education") {
    id = "academique";
    reason = "Recommande pour un profil academique qui met en avant formation, publications et recherche.";
  } else if (isMedicalRole || field === "healthcare") {
    id = "medical";
    reason = "Recommande pour un professionnel de sante avec certifications et experience clinique en priorite.";
  } else if (isTradeRole || field === "construction") {
    id = "technique";
    reason = "Recommande pour un metier technique ou les permis, licences et competences terrain sont prioritaires.";
  } else if (isFinanceOrLaw && (level === "3-10" || level === "10+")) {
    id = "prestige";
    reason = "Recommande pour un profil finance ou juridique qui doit inspirer confiance et credibilite immediate.";
  } else if (isFreelance) {
    id = "studio";
    reason = "Recommande pour un freelance ou independant qui veut mettre ses realisations et projets en avant.";
  } else if (isInternational && level !== "none" && field !== "transport" && field !== "hospitality" && field !== "construction") {
    id = "atlas";
    reason = "Recommande pour une candidature internationale avec competences linguistiques et mobilite a valoriser.";
  } else if (level === "10+" || isExecutiveRole) {
    id = "direction";
    reason = "Recommande pour une posture senior, plus premium et plus strategique.";
  } else if (isCreativeRole && (level === "3-10" || level === "10+")) {
    id = "minimal";
    reason = "Recommande pour un profil creatif senior qui valorise le gout et la lisibilite plutot que la decoration.";
  } else if (isCreativeRole || isSalesOrMarketing) {
    id = "signature";
    reason = "Recommande pour mieux differencier un profil creatif, produit ou marketing.";
  } else if (field === "tech" && level === "1-3") {
    id = "impact";
    reason = "Recommande pour un profil tech debut de carriere qui veut montrer ses competences avec impact visuel.";
  } else if (field === "tech" && (level === "3-10" || /architect|senior|engineer/i.test(title))) {
    id = "trajectoire";
    reason = "Recommande pour montrer clairement la progression, les promotions et les projets.";
  } else if (field === "transport" || field === "hospitality") {
    id = "essentiel";
    reason = "Recommande pour un metier terrain ou les recruteurs veulent surtout une lecture rapide et fiable.";
  } else if (field === "business" && (country === "germany" || country === "tunisia")) {
    id = "direction";
    reason = "Recommande pour un profil business ou corporate qui demande plus de credibilite visuelle.";
  } else if (country === "canada" || country === "usa") {
    id = "horizon";
    reason = "Recommande pour une candidature internationale simple et ATS-friendly.";
  }

  return { id, reason, meta: RESUME_TEMPLATE_META[id] };
}

export function getRecommendedWebsiteTemplate(input: {
  purpose: WebsiteMode;
  candidateTrack?: JobField | "";
  experienceLevel?: ExperienceLevel | "";
  jobTitle?: string;
}) {
  const track = input.candidateTrack || "other";
  const experienceLevel = input.experienceLevel || "none";
  const title = (input.jobTitle || "").toLowerCase();
  const isExecutiveRole = /director|directeur|manager|head|lead|responsable|chef/i.test(title);

  if (input.purpose === "profile") {
    if (track === "transport" || track === "healthcare" || track === "construction" || track === "hospitality") {
      return {
        id: "route-pro" as WebsiteTemplateId,
        reason: "Recommande pour un profil terrain: contact rapide, disponibilite et certifications visibles.",
        meta: WEBSITE_TEMPLATE_META["route-pro"],
      };
    }
    if (isExecutiveRole || experienceLevel === "10+") {
      return {
        id: "executive-profile" as WebsiteTemplateId,
        reason: "Recommande pour un profil senior qui doit inspirer confiance immediatement.",
        meta: WEBSITE_TEMPLATE_META["executive-profile"],
      };
    }
    if (experienceLevel === "3-10" && track !== "transport" && track !== "healthcare" && track !== "construction" && track !== "hospitality") {
      return {
        id: "dossier" as WebsiteTemplateId,
        reason: "Recommande pour un profil experimente qui veut presenter son parcours de facon structuree et credible.",
        meta: WEBSITE_TEMPLATE_META["dossier"],
      };
    }
    return {
      id: "profile-clean" as WebsiteTemplateId,
      reason: "Recommande pour un profil professionnel simple, clair et partageable.",
      meta: WEBSITE_TEMPLATE_META["profile-clean"],
    };
  }

  const isCreativeTechSenior = (track === "tech" || /designer|frontend|brand|creative/i.test(title)) && (experienceLevel === "3-10" || experienceLevel === "10+");

  const portfolioId: WebsiteTemplateId =
    isCreativeTechSenior ? "spotlight" :
    track === "tech" || /designer|frontend|brand|creative|product/i.test(title) || experienceLevel === "3-10" || experienceLevel === "10+"
      ? "showcase"
      : "casefile";

  return {
    id: portfolioId,
    reason: portfolioId === "showcase"
      ? "Recommande pour mettre en scene projets et expertise avec plus de presence visuelle."
      : "Recommande pour un portfolio propre, sobre et credible.",
    meta: WEBSITE_TEMPLATE_META[portfolioId],
  };
}
