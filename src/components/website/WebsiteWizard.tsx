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
}

const WEBSITE_MODE_CARDS: Array<{
  value: WebsiteMode;
  label: string;
  description: string;
  icon: typeof Briefcase;
}> = [
  {
    value: "profile",
    label: "Profil Pro",
    description: "Une page simple, claire et partageable pour convaincre vite un recruteur.",
    icon: Briefcase,
  },
  {
    value: "portfolio",
    label: "Portfolio Pro",
    description: "Pour montrer projets, realisations et preuves de travail avec plus de personnalite.",
    icon: Code,
  },
];

const EXPERIENCE_OPTIONS: Array<{ value: ExperienceLevel; label: string }> = [
  { value: "none", label: "Pas d'expérience" },
  { value: "1-3", label: "1 à 3 ans" },
  { value: "3-10", label: "3 à 10 ans" },
  { value: "10+", label: "Plus de 10 ans" },
];

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
        toast({ title: t("website.aiError", "Erreur IA"), description: result?.error || t("website.generateError", "Impossible de générer le contenu."), variant: "destructive" });
        setGenerating(false);
        return;
      }

      const aiSections = result?.result?.sections || {};
      const sections = selectedTemplate ? buildSectionsFromTemplate(selectedTemplate) : createDefaultSections(sectionTypes);

      const heroSection = sections.find((section) => section.type === "hero");
      if (heroSection) {
        heroSection.content.title = heroSection.content.title || siteName;
        heroSection.content.subtitle = heroSection.content.subtitle || `${profile.jobTitle} • ${trackPitch.label}`;
        heroSection.content.cta = heroSection.content.cta || "Me contacter";
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
          { label: "Disponibilité", value: profile.availabilityNote || "À préciser" },
          { label: "Pays cible", value: COUNTRY_STANDARDS[profile.targetCountry].label },
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
      toast({ title: t("common.error"), description: t("website.generateFailed", "Échec de la génération du profil public."), variant: "destructive" });
    }

    setGenerating(false);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1).map((index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                index === step ? "bg-primary text-primary-foreground" : index < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {index}
            </div>
            {index < TOTAL_STEPS && <div className={cn("h-px w-8", index < step ? "bg-primary" : "bg-border")} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{t("websiteWizard.step1Title", "Quel profil public souhaitez-vous créer ?")}</h2>
            <p className="mt-1 text-muted-foreground">{t("websiteWizard.step1Subtitle", "Choisissez le format qui aide le mieux votre candidature.")}</p>
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
              {t("websiteWizard.next", "Suivant")} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">{t("websiteWizard.step2Title", "Parlez-nous de votre candidature")}</h2>
            <p className="mt-1 text-muted-foreground">{t("websiteWizard.step2Subtitle", "Le système adaptera la structure à votre métier et à votre pays cible.")}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>{t("websiteWizard.profileName", "Nom du profil public")}</Label>
              <Input value={siteName} onChange={(event) => setSiteName(event.target.value)} placeholder={t("websiteWizard.profileNamePlaceholder", "Ahmed Ben Ali, Profil Chauffeur, Mon Portfolio...")} />
            </div>
            <div className="space-y-2">
              <Label>{t("websiteWizard.targetJob", "Poste ciblé")}</Label>
              <Input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder={t("websiteWizard.targetJobPlaceholder", "Chauffeur poids lourd, Développeur frontend...")} />
            </div>
            <div className="space-y-2">
              <Label>{t("websiteWizard.sector", "Secteur")}</Label>
              <Select value={candidateTrack} onValueChange={(value) => setCandidateTrack(value as JobField)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("websiteWizard.targetCountry", "Pays cible")}</Label>
              <Select value={targetCountry} onValueChange={(value) => setTargetCountry(value as TargetCountry)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(COUNTRY_STANDARDS).map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flag} {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("websiteWizard.experienceLevel", "Niveau d'expérience")}</Label>
              <Select value={experienceLevel} onValueChange={(value) => setExperienceLevel(value as ExperienceLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {resumes.length > 0 && (
              <div className="space-y-2 md:col-span-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
                <Label className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-primary" />
                  {t("websiteWizard.importFromCv", "Importer les données d'un CV existant")}
                </Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("websiteWizard.optionalCv", "Optionnel : choisissez un CV...")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("websiteWizard.noCv", "Aucun CV")}</SelectItem>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>{resume.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("websiteWizard.importRecommended", "Recommandé pour préremplir expériences, compétences, langues et coordonnées.")}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">{trackPitch.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{trackPitch.description}</p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Button onClick={() => setStep(3)} disabled={!canContinueCandidateStep} className="gap-2">
              Suivant <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && purpose && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Choisissez un template et ajoutez vos repères</h2>
            <p className="mt-1 text-muted-foreground">Le contenu sera généré selon votre métier, votre pays cible et votre niveau.</p>
          </div>

          <TemplateGallery
            category={purpose}
            selectedTemplateId={selectedTemplate?.id || null}
            recommendedTemplateId={recommendedWebsiteTemplate?.id || null}
            recommendedReason={recommendedWebsiteTemplate?.reason}
            onSelect={setSelectedTemplate}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {wizardFields.map((field) => (
              <div key={field.key} className={cn("space-y-2", field.type === "textarea" && "md:col-span-2")}>
                <Label>
                  {field.label}
                  {field.required && <span className="text-destructive"> *</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    value={categoryFields[field.key] || ""}
                    onChange={(event) => updateCategoryField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={categoryFields[field.key] || ""}
                    onChange={(event) => updateCategoryField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Button onClick={() => setStep(4)} disabled={!selectedTemplate || !canContinueDetailsStep} className="gap-2">
              Suivant <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && purpose && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Prêt à générer votre profil public ?</h2>
            <p className="mt-1 text-muted-foreground">Le site sera adapté à votre métier et facile à éditer ensuite.</p>
          </div>

          <Card className="border">
            <CardContent className="space-y-3 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-medium text-foreground">{selectedPurpose?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Secteur</span>
                <span className="font-medium text-foreground">{trackPitch.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pays cible</span>
                <span className="font-medium text-foreground">{COUNTRY_STANDARDS[targetCountry].label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Poste</span>
                <span className="font-medium text-foreground">{jobTitle}</span>
              </div>
              {selectedTemplate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium text-foreground">{selectedTemplate.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {generating && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">L'IA prépare votre profil public...</p>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} disabled={generating} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Button onClick={handleGenerate} disabled={generating || !selectedTemplate} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Génération..." : "Générer mon profil"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteWizard;
