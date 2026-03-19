import {
  ChecklistItem,
  EntitlementRecord,
  ResumeActivityRecord,
  UsageCounterRecord,
  WebsiteActivityRecord,
} from "@/types/product";

const defaultEntitlement: EntitlementRecord = {
  plan_key: "free",
  billing_status: "manual",
  ai_daily_limit: 20,
  pdf_monthly_limit: 3,
  website_limit: 1,
  custom_domain_enabled: false,
  priority_support_enabled: false,
};

const defaultUsage: UsageCounterRecord = {
  ai_requests_count: 0,
  pdf_downloads_count: 0,
  websites_published_count: 0,
};

export function getResumeCompletionPercent(resume: ResumeActivityRecord): number {
  const data = resume.data || {};
  let score = 0;

  if (data.personalInfo?.firstName) score += 15;
  if (data.personalInfo?.email) score += 10;
  if (Array.isArray(data.education) && data.education.length > 0) score += 15;
  if (Array.isArray(data.experience) && data.experience.length > 0) score += 20;
  if (Array.isArray(data.skillCategories) && data.skillCategories.some((category: any) => category.skills?.length > 0)) score += 15;
  if (data.summary) score += 15;
  if (resume.template && resume.template !== "horizon") score += 5;
  if ((resume.current_step || 0) >= 9) score += 5;

  return Math.min(score, 100);
}

export function buildOnboardingChecklist(
  resumes: ResumeActivityRecord[],
  websites: WebsiteActivityRecord[],
): ChecklistItem[] {
  const firstResume = resumes[0];
  const previewResume = resumes.find((resume) => (resume.current_step || 0) >= 9 || resume.is_complete);
  const publishedWebsite = websites.find((website) => website.is_published);

  return [
    {
      key: "resume-create",
      title: "Créer votre premier CV",
      description: "Débloquez le principal moment de valeur du produit.",
      cta: firstResume ? "Continuer le CV" : "Créer un CV",
      href: firstResume ? `/resume/edit?id=${firstResume.id}` : "/resume/new?express=1",
      done: resumes.length > 0,
    },
    {
      key: "resume-preview",
      title: "Atteindre l'aperçu final",
      description: "Terminez le parcours jusqu'au score ATS et au PDF.",
      cta: previewResume ? "Voir l'aperçu" : "Terminer mon CV",
      href: previewResume ? `/resume/edit?id=${previewResume.id}` : firstResume ? `/resume/edit?id=${firstResume.id}` : "/resume/new",
      done: Boolean(previewResume),
    },
    {
      key: "website-publish",
      title: "Publier votre premier site",
      description: "Transformez votre CV en présence publique partageable.",
      cta: publishedWebsite ? "Voir le site" : websites[0] ? "Publier mon site" : "Créer un site",
      href: publishedWebsite ? `/site/${publishedWebsite.id}` : websites[0] ? `/website/edit?id=${websites[0].id}` : "/website/new",
      done: Boolean(publishedWebsite),
    },
  ];
}

export function getChecklistProgress(items: ChecklistItem[]) {
  const completed = items.filter((item) => item.done).length;

  return {
    completed,
    total: items.length,
    percent: items.length === 0 ? 0 : Math.round((completed / items.length) * 100),
    nextItem: items.find((item) => !item.done) || null,
  };
}

export function getPlanLabel(planKey?: string | null) {
  switch (planKey) {
    case "student":
      return "Etudiant";
    case "pro":
      return "Pro";
    default:
      return "Gratuit";
  }
}

export function getGrowthState(
  entitlement?: Partial<EntitlementRecord> | null,
  usage?: Partial<UsageCounterRecord> | null,
) {
  return {
    entitlement: { ...defaultEntitlement, ...entitlement },
    usage: { ...defaultUsage, ...usage },
  };
}

export function getUsageCards(
  entitlement?: Partial<EntitlementRecord> | null,
  usage?: Partial<UsageCounterRecord> | null,
) {
  const state = getGrowthState(entitlement, usage);

  return [
    {
      key: "pdf",
      title: "PDF ce mois",
      used: state.usage.pdf_downloads_count,
      limit: state.entitlement.pdf_monthly_limit,
    },
    {
      key: "sites",
      title: "Sites publies",
      used: state.usage.websites_published_count,
      limit: state.entitlement.website_limit,
    },
    {
      key: "ai",
      title: "Actions IA suivies",
      used: state.usage.ai_requests_count,
      limit: state.entitlement.ai_daily_limit,
    },
  ];
}

export function getRemainingAllowance(used: number, limit: number) {
  return Math.max(limit - used, 0);
}

export function getFunnelConversionRate(start: number, finish: number) {
  if (start <= 0) return 0;
  return Math.round((finish / start) * 100);
}
