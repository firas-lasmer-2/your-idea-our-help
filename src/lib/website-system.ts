import { getJobCategory, type ExperienceLevel, type JobField, type TargetCountry } from "@/lib/country-standards";
import type { ResumeData } from "@/types/resume";
import { ACTIVE_SECTION_TYPES, createDefaultSections, type SectionType, type WebsiteCandidateProfile, type WebsiteCandidateTrack, type WebsiteData, type WebsiteMode } from "@/types/website";

const simplifiedTracks: WebsiteCandidateTrack[] = ["healthcare", "construction", "hospitality", "transport"];

export function isSimplifiedTrack(track: WebsiteCandidateTrack) {
  return simplifiedTracks.includes(track);
}

export function getWebsiteModeSections(mode: WebsiteMode, track: WebsiteCandidateTrack): SectionType[] {
  if (mode === "portfolio") {
    return ["navbar", "hero", "about", "projects", "skills", "experience", "education", "social-links", "contact", "stats"];
  }

  if (isSimplifiedTrack(track)) {
    return ["navbar", "hero", "about", "experience", "credentials", "availability", "languages", "contact"];
  }

  return ["navbar", "hero", "about", "experience", "education", "skills", "credentials", "languages", "social-links", "contact", "stats"];
}

export function getWebsiteModeLabel(mode: WebsiteMode) {
  return mode === "portfolio" ? "Portfolio Pro" : "Profil Pro";
}

export function getContactPreferenceForTrack(track: WebsiteCandidateTrack): WebsiteCandidateProfile["contactPreference"] {
  return isSimplifiedTrack(track) ? "phone_whatsapp" : "links";
}

export function getTrackPitch(track: WebsiteCandidateTrack) {
  const category = getJobCategory(track);
  return {
    label: category.label,
    description: isSimplifiedTrack(track)
      ? "Structure simple, orientée expérience, permis, langues et disponibilité."
      : "Structure plus riche, orientée expertise, réalisations et présence professionnelle.",
  };
}

export function normalizeWebsiteMode(value?: string | null): WebsiteMode {
  if (value === "portfolio") return "portfolio";
  return "profile";
}

export function normalizeWebsiteTrack(value?: string | null): WebsiteCandidateTrack {
  const tracks: WebsiteCandidateTrack[] = ["tech", "healthcare", "construction", "hospitality", "education", "business", "transport", "other"];
  return tracks.includes(value as WebsiteCandidateTrack) ? (value as WebsiteCandidateTrack) : "other";
}

export function buildWebsiteProfileFromResume(resume: ResumeData): WebsiteCandidateProfile {
  const candidateTrack = normalizeWebsiteTrack(resume.jobField);
  const mode: WebsiteMode = isSimplifiedTrack(candidateTrack) ? "profile" : "portfolio";

  return {
    mode,
    candidateTrack,
    targetCountry: (resume.targetCountry as TargetCountry) || "other",
    experienceLevel: (resume.experienceLevel as ExperienceLevel) || "none",
    jobTitle: resume.jobTitle || resume.jobTarget || "",
    summary: resume.summary || "",
    availabilityNote: resume.experienceLevel === "none" ? "Disponible pour une première opportunité" : "Disponible pour de nouvelles opportunités",
    portfolioFocus: resume.summary || "",
    highlightedWork: resume.projects[0]?.name || resume.experience[0]?.position || "",
    contactPreference: getContactPreferenceForTrack(candidateTrack),
  };
}

export function getProfileProofRequirement(mode: WebsiteMode, sections: SectionType[]) {
  if (mode === "portfolio") {
    return sections.includes("projects") ? "projects" : "experience";
  }

  return sections.includes("credentials") ? "credentials" : "experience";
}

export function normalizeWebsiteData(data: WebsiteData | null | undefined, purpose?: string | null): WebsiteData {
  const mode = normalizeWebsiteMode(data?.profile?.mode || purpose);
  const candidateTrack = normalizeWebsiteTrack(data?.profile?.candidateTrack);
  const allowedSections = new Set(ACTIVE_SECTION_TYPES);
  const sourceSections = Array.isArray(data?.sections) ? data!.sections : [];
  const filteredSections = sourceSections
    .filter((section) => allowedSections.has(section.type))
    .map((section, index) => ({
      ...section,
      enabled: section.enabled !== false,
      order: index,
    }));

  return {
    sections: filteredSections.length > 0 ? filteredSections : createDefaultSections(getWebsiteModeSections(mode, candidateTrack)),
    profile: data?.profile ? {
      ...data.profile,
      mode,
      candidateTrack,
    } : undefined,
  };
}
