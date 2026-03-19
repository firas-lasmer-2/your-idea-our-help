import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Briefcase, Code, Globe2, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import TemplateGallery from "./TemplateGallery";
import {
  CATEGORY_WIZARD_FIELDS,
  CV_IMPORT_CATEGORIES,
  createDefaultSections,
  type WebsiteCandidateProfile,
  type WebsiteGlobalSettings,
  type WebsiteMode,
} from "@/types/website";
import { COUNTRY_STANDARDS, JOB_CATEGORIES, type ExperienceLevel, type JobField, type TargetCountry } from "@/lib/country-standards";
import { buildSectionsFromTemplate, getTemplatesForCategory, type WebsiteTemplate } from "@/data/website-templates";
import {
  buildWebsiteProfileFromResume,
  getContactPreferenceForTrack,
  getTrackPitch,
  getWebsiteModeSections,
} from "@/lib/website-system";
import { getRecommendedWebsiteTemplate } from "@/lib/template-recommendations";
import type { ResumeData } from "@/types/resume";
import { cn } from "@/lib/utils";

interface WizardResult {
  purpose: WebsiteMode;
  template: string;
  title: string;
  sections: ReturnType<typeof createDefaultSections>;
  globalSettings?: WebsiteGlobalSettings;
  profile: WebsiteCandidateProfile;
}

interface Props {
  onComplete: (result: WizardResult) => void;
  resumes: { id: string; title: string }[];
  preselectedResumeId?: string;
}

const TOTAL_STEPS = 4;

function mapExperienceItems(resumeData: ResumeData) {
  return resumeData.experience
    .filter((item) => item.position.trim() || item.company.trim())
    .map((item) => ({
      position: item.position,
      company: item.company,
      period: [item.startDate, item.current ? "Présent" : item.endDate].filter(Boolean).join(" — "),
      description: item.bullets.filter(Boolean).join(" • "),
    }));
}

function mapEducationItems(resumeData: ResumeData) {
  return resumeData.education
    .filter((item) => item.degree.trim() || item.institution.trim())
    .map((item) => ({
      degree: item.degree || item.field,
      institution: item.institution,
      period: [item.startDate, item.current ? "Présent" : item.endDate].filter(Boolean).join(" — "),
    }));
}

function mapSkillItems(resumeData: ResumeData) {
  return resumeData.skillCategories.flatMap((category) =>
    category.skills.filter(Boolean).map((skill) => ({ name: skill, level: 80 })),
  );
}

function mapCredentialItems(resumeData: ResumeData) {
  return resumeData.certifications
    .filter((item) => item.name.trim())
    .map((item) => ({
      name: item.name,
      issuer: item.issuer,
      detail: item.date,
    }));
}

function mapLanguageItems(resumeData: ResumeData) {
  return resumeData.languages
    .filter((language) => language.name.trim())
    .map((language) => ({
      name: language.name,
      level: language.level,
    }));
}

function mapProjectItems(resumeData: ResumeData) {
  return resumeData.projects
    .filter((project) => project.name.trim())
    .map((project) => ({
      name: project.name,
      description: project.description,
      tags: project.technologies,
    }));
}

const WebsiteWizard = ({ onComplete, resumes }: Props) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState<WebsiteMode | "">("");
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate | null>(null);
  const [siteName, setSiteName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [candidateTrack, setCandidateTrack] = useState<JobField>("other");
  const [targetCountry, setTargetCountry] = useState<TargetCountry>("canada");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("none");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [categoryFields, setCategoryFields] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const WEBSITE_MODE_CARDS: Array<{
    value: WebsiteMode;
    label: string;
    description: string;
    icon: typeof Briefcase;
  }> = [
    {
      value: "profile",
      label: t("websiteWizard.modeProfile", "Profil Pro"),
      description: t("websiteWizard.modeProfileDesc", "Une page simple, claire et partageable pour convaincre vite un recruteur."),
      icon: Briefcase,
    },
    {
      value: "portfolio",
      label: t("websiteWizard.modePortfolio", "Portfolio Pro"),
      description: t("websiteWizard.modePortfolioDesc", "Pour montrer projets, realisations et preuves de travail avec plus de personnalite."),
      icon: Code,
    },
  ];

  const EXPERIENCE_OPTIONS: Array<{ value: ExperienceLevel; label: string }> = [
    { value: "none", label: t("websiteWizard.expNone", "Pas d'expérience") },
    { value: "1-3", label: t("websiteWizard.exp1to3", "1 à 3 ans") },
    { value: "3-10", label: t("websiteWizard.exp3to10", "3 à 10 ans") },
    { value: "10+", label: t("websiteWizard.exp10plus", "Plus de 10 ans") },
  ];

  const selectedPurpose = WEBSITE_MODE_CARDS.find((mode) => mode.value === purpose);
  const wizardFields = CATEGORY_WIZARD_FIELDS[purpose || "profile"] || [];
  const templates = purpose ? getTemplatesForCategory(purpose) : [];
  const trackPitch = useMemo(() => getTrackPitch(candidateTrack), [candidateTrack]);
  const recommendedWebsiteTemplate = useMemo(() => {
    if (!purpose) return null;
    return getRecommendedWebsiteTemplate({
      purpose,
      candidateTrack,
      experienceLevel,
    });
  }, [purpose, candidateTrack, experienceLevel]);

  useEffect(() => {
    if (!purpose || templates.length === 0) return;
    const fallbackId = recommendedWebsiteTemplate?.id;
    const nextTemplate = templates.find((template) => template.id === fallbackId) || templates[0];
    if (!selectedTemplate || selectedTemplate.category !== purpose) {
      setSelectedTemplate(nextTemplate);
    }
  }, [purpose, templates, recommendedWebsiteTemplate, selectedTemplate]);

  const updateCategoryField = (key: string, value: string) => {
    setCategoryFields((prev) => ({ ...prev, [key]: value }));
  };

  const canContinueCandidateStep = Boolean(siteName.trim() && jobTitle.trim() && candidateTrack && targetCountry && experienceLevel);
  const canContinueDetailsStep = wizardFields.every((field) => !field.required || categoryFields[field.key]?.trim());

  const buildCandidateProfile = (resumeData?: ResumeData): WebsiteCandidateProfile => {
    const importedProfile = resumeData ? buildWebsiteProfileFromResume(resumeData) : null;
    const finalTrack = importedProfile?.candidateTrack || candidateTrack;

    return {
      mode: (purpose || "profile") as WebsiteMode,
      candidateTrack: finalTrack,
      targetCountry: importedProfile?.targetCountry || targetCountry,
      experienceLevel: importedProfile?.experienceLevel || experienceLevel,
      jobTitle: jobTitle.trim() || importedProfile?.jobTitle || "",
      summary: categoryFields.profile_pitch?.trim() || importedProfile?.summary || "",
      availabilityNote: categoryFields.availability_note?.trim() || importedProfile?.availabilityNote || "",
      portfolioFocus: categoryFields.portfolio_focus?.trim() || importedProfile?.portfolioFocus || "",
      highlightedWork: categoryFields.highlighted_work?.trim() || importedProfile?.highlightedWork || "",
      contactPreference: importedProfile?.contactPreference || getContactPreferenceForTrack(finalTrack),
    };
  };

  const handleGenerate = async () => {
    if (!purpose) return;
    setGenerating(true);

    try {
      let importedResume: ResumeData | null = null;
      if (CV_IMPORT_CATEGORIES.includes(purpose) && selectedResumeId && selectedResumeId !== "none") {
        const { data: resume } = await (supabase as any)
          .from("resumes")
          .select("data")
          .eq("id", selectedResumeId)
          .single();
        if (resume?.data) {
          importedResume = resume.data as ResumeData;
        }
      }

      const profile = buildCandidateProfile(importedResume || undefined);
      const sectionTypes = selectedTemplate
        ? selectedTemplate.sectionTypes
        : getWebsiteModeSections(profile.mode, profile.candidateTrack);

      const resumeContext = importedResume
        ? [
            importedResume.summary ? `Résumé: ${importedResume.summary}` : "",
            importedResume.experience.length ? `Expérience: ${importedResume.experience.map((item) => `${item.position} chez ${item.company}`).join(", ")}` : "",
            importedResume.education.length ? `Formation: ${importedResume.education.map((item) => `${item.degree} - ${item.institution}`).join(", ")}` : "",
            importedResume.languages.length ? `Langues: ${importedResume.languages.map((language) => `${language.name} (${language.level})`).join(", ")}` : "",
          ].filter(Boolean).join("\n")
        : "";

      const fullDescription = [
        profile.summary,
        profile.portfolioFocus,
        profile.availabilityNote,
        resumeContext ? `Données du CV:\n${resumeContext}` : "",
      ].filter(Boolean).join("\n");

      const { data: result, error } = await supabase.functions.invoke("website-ai", {
        body: {
          purpose: profile.mode,
          mode: "generate",
          siteName,
          description: fullDescription,
          goal: profile.jobTitle,
          sections: sectionTypes.filter((type) => type !== "navbar"),
          categoryContext: {
            ...categoryFields,
            candidateTrack: profile.candidateTrack,
            targetCountry: profile.targetCountry,
            experienceLevel: profile.experienceLevel,
            jobTitle: profile.jobTitle,
          },
          candidateTrack: profile.candidateTrack,
          targetCountry: profile.targetCountry,
          experienceLevel: profile.experienceLevel,
        },
      });

      if (error || result?.error) {
        toast({ title: t("website.aiError"), description: result?.error || t("website.generateError"), variant: "destructive" });
        setGenerating(false);
        return;
      }

      const aiSections = result?.result?.sections || {};
      const sections = selectedTemplate ? buildSectionsFromTemplate(selectedTemplate) : createDefaultSections(sectionTypes);

      const heroSection = sections.find((section) => section.type === "hero");
      if (heroSection) {
        heroSection.content.title = heroSection.content.title || siteName;
        heroSection.content.subtitle = heroSection.content.subtitle || `${profile.jobTitle} • ${trackPitch.label}`;
        heroSection.content.cta = heroSection.content.cta || t("websiteWizard.contactMe", "Me contacter");
      }

      const navbarSection = sections.find((section) => section.type === "navbar");
      if (navbarSection) {
        navbarSection.content.logoText = siteName;
      }

      if (importedResume) {
        const socialSection = sections.find((section) => section.type === "social-links");
        if (socialSection) {
          socialSection.content.linkedin = importedResume.personalInfo.linkedIn || "";
          socialSection.content.github = importedResume.personalInfo.github || "";
        }
      }

      for (const section of sections) {
        if (aiSections[section.type]) {
          section.content = { ...section.content, ...aiSections[section.type] };
        }
      }

      const contactSection = sections.find((section) => section.type === "contact");
      if (contactSection && importedResume) {
        contactSection.content.email = importedResume.personalInfo.email || contactSection.content.email || "";
        contactSection.content.phone = importedResume.personalInfo.phone || contactSection.content.phone || "";
      }

      const credentialsSection = sections.find((section) => section.type === "credentials");
      if (credentialsSection) {
        const importedCredentials = importedResume ? mapCredentialItems(importedResume) : [];
        credentialsSection.content.items = importedCredentials.length > 0 ? importedCredentials : credentialsSection.content.items || [];
      }

      const availabilitySection = sections.find((section) => section.type === "availability");
      if (availabilitySection) {
        availabilitySection.content.items = [
          { label: t("websiteWizard.availabilityLabel", "Disponibilité"), value: profile.availabilityNote || t("websiteWizard.tbd", "À préciser") },
          { label: t("websiteWizard.targetCountryLabel", "Pays cible"), value: COUNTRY_STANDARDS[profile.targetCountry].label },
        ];
      }

      const languagesSection = sections.find((section) => section.type === "languages");
      if (languagesSection) {
        const importedLanguages = importedResume ? mapLanguageItems(importedResume) : [];
        languagesSection.content.items = importedLanguages.length > 0 ? importedLanguages : languagesSection.content.items || [];
      }

      const skillsSection = sections.find((section) => section.type === "skills");
      if (skillsSection && importedResume) {
        const importedSkills = mapSkillItems(importedResume).slice(0, 8);
        if (importedSkills.length > 0) {
          skillsSection.content.items = importedSkills;
        }
      }

      const experienceSection = sections.find((section) => section.type === "experience");
      if (experienceSection && importedResume) {
        const importedExperience = mapExperienceItems(importedResume);
        if (importedExperience.length > 0) {
          experienceSection.content.items = importedExperience;
        }
      }

      const educationSection = sections.find((section) => section.type === "education");
      if (educationSection && importedResume) {
        const importedEducation = mapEducationItems(importedResume);
        if (importedEducation.length > 0) {
          educationSection.content.items = importedEducation;
        }
      }

      const projectsSection = sections.find((section) => section.type === "projects");
      if (projectsSection && importedResume) {
        const importedProjects = mapProjectItems(importedResume);
        if (importedProjects.length > 0) {
          projectsSection.content.items = importedProjects;
        }
      }

      onComplete({
        purpose: profile.mode,
        template: selectedTemplate?.id || (profile.mode === "portfolio" ? "casefile" : "profile-clean"),
        title: siteName,
        sections,
        globalSettings: selectedTemplate?.globalSettings,
        profile,
      });
    } catch (error) {
      toast({ title: t("common.error"), description: t("website.generateFailed"), variant: "destructive" });
    }

    setGenerating(false);
  };

  const stepLabels = [
    t("websiteWizard.stepMode", "Mode"),
    t("websiteWizard.stepCandidate", "Candidature"),
    t("websiteWizard.stepTemplate", "Template"),
    t("websiteWizard.stepGenerate", "Génération"),
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Step indicators with labels */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map((index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  index === step ? "bg-primary text-primary-foreground" : index < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {index}
              </div>
              <span className={cn("text-[10px] font-medium", index === step ? "text-primary" : "text-muted-foreground")}>
                {stepLabels[index - 1]}
              </span>
            </div>
            {index < TOTAL_STEPS && <div className={cn("h-px w-8 self-start mt-4", index < step ? "bg-primary" : "bg-border")} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{t("websiteWizard.step1Title")}</h2>
            <p className="mt-1 text-muted-foreground">{t("websiteWizard.step1Subtitle")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {WEBSITE_MODE_CARDS.map((modeCard) => {
              const Icon = modeCard.icon;
              return (
                <Card
                  key={modeCard.value}
                  className={cn(
                    "cursor-pointer border-2 transition-all hover:shadow-md",
                    purpose === modeCard.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                  )}
                  onClick={() => {
                    setPurpose(modeCard.value);
                    setSelectedTemplate(null);
                    setCategoryFields({});
                  }}
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", purpose === modeCard.value ? "bg-primary/10" : "bg-muted")}>
                      <Icon className={cn("h-6 w-6", purpose === modeCard.value ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">{modeCard.label}</h3>
                      <p className="text-sm text-muted-foreground">{modeCard.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!purpose} className="gap-2">
              {t("websiteWizard.next")} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{t("websiteWizard.step2Title")}</h2>
            <p className="mt-1 text-muted-foreground">{t("websiteWizard.step2Subtitle")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("websiteWizard.profileName")}</Label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder={t("websiteWizard.profileNamePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("websiteWizard.targetJob")}</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder={t("websiteWizard.targetJobPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("websiteWizard.sector")}</Label>
              <Select value={candidateTrack} onValueChange={(v) => setCandidateTrack(v as JobField)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("websiteWizard.targetCountry")}</Label>
              <Select value={targetCountry} onValueChange={(v) => setTargetCountry(v as TargetCountry)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(COUNTRY_STANDARDS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("websiteWizard.experienceLevel")}</Label>
              <Select value={experienceLevel} onValueChange={(v) => setExperienceLevel(v as ExperienceLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {CV_IMPORT_CATEGORIES.includes(purpose as WebsiteMode) && resumes.length > 0 && (
            <Card className="border-dashed">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{t("websiteWizard.importFromCv")}</p>
                </div>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger><SelectValue placeholder={t("websiteWizard.optionalCv")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("websiteWizard.noCv")}</SelectItem>
                    {resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t("websiteWizard.importRecommended")}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {t("common.back", "Retour")}
            </Button>
            <Button onClick={() => setStep(3)} disabled={!canContinueCandidateStep} className="gap-2">
              {t("websiteWizard.next")} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{t("websiteWizard.step3Title")}</h2>
            <p className="mt-1 text-muted-foreground">{t("websiteWizard.step3Subtitle")}</p>
          </div>

          {templates.length > 0 && purpose && (
            <TemplateGallery
              category={purpose}
              selectedTemplateId={selectedTemplate?.id || null}
              onSelect={(tpl) => setSelectedTemplate(tpl)}
              recommendedTemplateId={recommendedWebsiteTemplate?.id}
            />
          )}

          {wizardFields.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {wizardFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={categoryFields[field.key] || ""}
                      onChange={(e) => updateCategoryField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={categoryFields[field.key] || ""}
                      onChange={(e) => updateCategoryField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> {t("common.back", "Retour")}
            </Button>
            <Button onClick={() => setStep(4)} disabled={!canContinueDetailsStep} className="gap-2">
              {t("websiteWizard.next")} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{t("websiteWizard.step4Title")}</h2>
            <p className="mt-1 text-muted-foreground">{t("websiteWizard.step4Subtitle")}</p>
          </div>

          <Card>
            <CardContent className="space-y-3 p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t("websiteWizard.mode")}</span>
                  <p className="font-semibold text-foreground">{selectedPurpose?.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("websiteWizard.position")}</span>
                  <p className="font-semibold text-foreground">{jobTitle}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("websiteWizard.sector")}</span>
                  <p className="font-semibold text-foreground">{JOB_CATEGORIES.find((c) => c.id === candidateTrack)?.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("websiteWizard.targetCountry")}</span>
                  <p className="font-semibold text-foreground">{COUNTRY_STANDARDS[targetCountry].label}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {generating && (
            <div className="flex items-center justify-center gap-3 py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div>
                <p className="font-semibold text-foreground">{t("websiteWizard.aiPreparing")}</p>
                <p className="text-sm text-muted-foreground">{t("websiteWizard.generating")}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} className="gap-2" disabled={generating}>
              <ArrowLeft className="h-4 w-4" /> {t("common.back", "Retour")}
            </Button>
            <Button onClick={handleGenerate} disabled={generating} className="gap-2">
              <Sparkles className="h-4 w-4" />
              {generating ? t("websiteWizard.generating") : t("websiteWizard.generateProfile")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteWizard;
