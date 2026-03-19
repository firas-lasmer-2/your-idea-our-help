import { ResumeCustomization, ResumeData } from "@/types/resume";

export interface ResumeStepStatus {
  complete: boolean;
  blockers: string[];
  optional?: boolean;
}

export interface ResumeReadiness {
  stepStatus: Record<number, ResumeStepStatus>;
  exportBlockers: string[];
  completionPercent: number;
}

function getSkillCount(data: ResumeData) {
  return (data.skillCategories || []).reduce((count, category) => {
    return count + (category.skills || []).filter(Boolean).length;
  }, 0);
}

function hasMeaningfulExperience(data: ResumeData) {
  return data.experience.some((experience) => experience.position.trim() && experience.company.trim());
}

function hasMeaningfulEducation(data: ResumeData) {
  return data.education.some((education) => education.institution.trim() && education.degree.trim());
}

export function getResumeReadiness(
  data: ResumeData,
  customization?: ResumeCustomization,
  template?: string,
): ResumeReadiness {
  const skillCount = getSkillCount(data);
  const hasExperience = hasMeaningfulExperience(data);
  const hasEducation = hasMeaningfulEducation(data);

  const stepStatus: Record<number, ResumeStepStatus> = {
    1: {
      complete: Boolean(data.personalInfo.firstName.trim() && data.personalInfo.lastName.trim() && data.personalInfo.email.trim()),
      blockers: [
        !data.personalInfo.firstName.trim() ? "Ajoutez votre prénom." : "",
        !data.personalInfo.lastName.trim() ? "Ajoutez votre nom." : "",
        !data.personalInfo.email.trim() ? "Ajoutez un email de contact." : "",
      ].filter(Boolean),
    },
    2: {
      complete: data.experienceLevel === "none" || hasExperience,
      blockers: data.experienceLevel === "none" ? [] : ["Ajoutez au moins une expérience avec poste et entreprise."],
    },
    3: {
      complete: hasEducation || hasExperience,
      blockers: ["Ajoutez au moins une formation ou une expérience complète."],
    },
    4: {
      complete: skillCount >= 3,
      blockers: ["Ajoutez au moins 3 compétences pertinentes."],
    },
    5: {
      complete: true,
      blockers: [],
      optional: true,
    },
    6: {
      complete: Boolean(template),
      blockers: ["Choisissez un modèle."],
    },
    7: {
      complete: Boolean(customization?.accentColor && customization?.fontPair && customization?.spacing),
      blockers: ["Vérifiez la personnalisation avant l'aperçu final."],
      optional: true,
    },
    9: {
      complete: false,
      blockers: [],
    },
  };

  const exportBlockers = [
    ...stepStatus[1].blockers,
    ...(stepStatus[2].complete ? [] : stepStatus[2].blockers),
    ...(stepStatus[3].complete ? [] : stepStatus[3].blockers),
    ...(stepStatus[4].complete ? [] : stepStatus[4].blockers),
    ...(stepStatus[6].complete ? [] : stepStatus[6].blockers),
    !data.jobTitle.trim() ? "Renseignez le poste ciblé dans l'assistant initial." : "",
  ].filter(Boolean);

  stepStatus[9] = {
    complete: exportBlockers.length === 0,
    blockers: exportBlockers,
  };

  const requiredSteps = [1, 2, 3, 4, 6];
  const completedRequiredSteps = requiredSteps.filter((stepId) => stepStatus[stepId].complete).length;
  const completionPercent = Math.round((completedRequiredSteps / requiredSteps.length) * 100);

  return {
    stepStatus,
    exportBlockers,
    completionPercent,
  };
}
