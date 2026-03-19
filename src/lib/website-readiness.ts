import { WebsiteData, WebsiteGlobalSettings, WebsiteSection } from "@/types/website";
import { getProfileProofRequirement, normalizeWebsiteMode } from "@/lib/website-system";

export interface WebsitePublishReadiness {
  blockers: string[];
  warnings: string[];
  enabledSectionCount: number;
  ready: boolean;
}

function getSection(sections: WebsiteSection[], type: string) {
  return sections.find((section) => section.type === type && section.enabled);
}

function getContactChannels(contactSection?: WebsiteSection, socialSection?: WebsiteSection) {
  const contactContent = contactSection?.content || {};
  const socialContent = socialSection?.content || {};

  return [
    contactContent.email,
    contactContent.phone,
    contactContent.whatsapp,
    socialContent.linkedin,
    socialContent.instagram,
    socialContent.facebook,
    socialContent.github,
  ].filter(Boolean);
}

export function getWebsitePublishReadiness(input: {
  title: string;
  slug?: string | null;
  data: WebsiteData;
  globalSettings: WebsiteGlobalSettings;
}) {
  const enabledSections = input.data.sections.filter((section) => section.enabled);
  const heroSection = getSection(enabledSections, "hero");
  const contactSection = getSection(enabledSections, "contact");
  const socialSection = getSection(enabledSections, "social-links");
  const profileMode = normalizeWebsiteMode(input.data.profile?.mode);
  const credentialsSection = getSection(enabledSections, "credentials");
  const experienceSection = getSection(enabledSections, "experience");
  const projectsSection = getSection(enabledSections, "projects");
  const contactChannels = getContactChannels(contactSection, socialSection);
  const proofRequirement = getProfileProofRequirement(profileMode, enabledSections.map((section) => section.type));
  const hasProof = proofRequirement === "projects"
    ? Boolean(projectsSection?.content?.items?.length || experienceSection?.content?.items?.length)
    : Boolean(credentialsSection?.content?.items?.length || experienceSection?.content?.items?.length);

  const blockers = [
    !input.title.trim() ? "Ajoutez un nom clair pour le site." : "",
    enabledSections.length < 3 ? "Activez au moins 3 sections utiles avant publication." : "",
    !heroSection?.content?.title?.trim() ? "Renseignez un titre principal dans la section hero." : "",
    !heroSection?.content?.cta?.trim() ? "Ajoutez un bouton d'action principal dans le hero." : "",
    !input.data.profile?.jobTitle?.trim() ? "Renseignez le poste ciblé du candidat." : "",
    !hasProof ? (proofRequirement === "projects"
      ? "Ajoutez au moins une réalisation ou une expérience crédible."
      : "Ajoutez au moins une expérience ou un permis/certificat.") : "",
    contactChannels.length === 0 ? "Ajoutez au moins un canal de contact ou un réseau social." : "",
    !input.globalSettings.metaDescription?.trim() ? "Ajoutez une meta description pour le SEO." : "",
    input.slug !== undefined && input.slug !== null && input.slug.trim().length > 0 && input.slug.trim().length < 2
      ? "Le slug doit contenir au moins 2 caractères."
      : "",
  ].filter(Boolean);

  const warnings = [
    !contactSection ? "Aucune section contact active : la conversion risque d'être faible." : "",
    profileMode === "portfolio" && !socialSection ? "Ajoutez des liens publics pour renforcer la crédibilité." : "",
    !input.slug ? "Ajoutez un slug personnalisé pour une URL plus propre." : "",
  ].filter(Boolean);

  return {
    blockers,
    warnings,
    enabledSectionCount: enabledSections.length,
    ready: blockers.length === 0,
  } satisfies WebsitePublishReadiness;
}
