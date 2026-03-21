import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { FileText, ArrowLeft, ArrowRight, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getResumeFixture } from "@/lib/template-preview-fixtures";
import { useResume } from "@/hooks/use-resume";
import { getCountryStandard, getJobCategory, isSimplifiedMode, getVisibleSteps, type TargetCountry, type JobField, type ExperienceLevel } from "@/lib/country-standards";
import StepProgress from "@/components/resume/StepProgress";
import StepPersonalInfo from "@/components/resume/steps/StepPersonalInfo";
import StepEducation from "@/components/resume/steps/StepEducation";
import StepExperience from "@/components/resume/steps/StepExperience";
import StepSkills from "@/components/resume/steps/StepSkills";
import StepDesign from "@/components/resume/steps/StepDesign";
import StepPreview from "@/components/resume/steps/StepPreview";
import OnboardingTour from "@/components/resume/OnboardingTour";
import SmartWizard from "@/components/resume/SmartWizard";
import ResumePreview from "@/components/resume/ResumePreview";
import AiChatAssistant from "@/components/resume/AiChatAssistant";
import SectionSuggestions from "@/components/resume/SectionSuggestions";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { trackProductEvent } from "@/lib/product-events";
import { getResumeReadiness } from "@/lib/resume-readiness";
import { useToast } from "@/hooks/use-toast";

const auth = supabase.auth as any;

const ResumeBuilder = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("id") || undefined;
  const expressMode = searchParams.get("express") === "1";
  const importedMode = searchParams.get("imported") === "1";
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [authLoading, setAuthLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(!resumeId);
  const [prefilling, setPrefilling] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [showSectionSuggestions, setShowSectionSuggestions] = useState(false);
  const completionTrackedRef = useRef(false);
  const importHandledRef = useRef(false);

  const {
    data, updateData,
    customization, updateCustomization,
    currentStep, goToStep,
    template, setTemplate,
    saving, saveError, lastSavedAt, loading, save,
  } = useResume(resumeId);

  // Handle imported resume data from sessionStorage
  useEffect(() => {
    if (!importedMode || importHandledRef.current) return;
    importHandledRef.current = true;
    const stored = sessionStorage.getItem("importedResumeData");
    if (stored) {
      try {
        const imported = JSON.parse(stored);
        updateData({
          personalInfo: { ...data.personalInfo, ...imported.personalInfo },
          education: imported.education?.length > 0 ? imported.education : data.education,
          experience: imported.experience?.length > 0 ? imported.experience : data.experience,
          summary: imported.summary || data.summary,
          languages: imported.languages?.length > 0 ? imported.languages : data.languages,
          interests: imported.interests?.length > 0 ? imported.interests : data.interests,
        });
        toast({ title: t("resume.importSuccess", "CV importé !"), description: t("resume.importSuccessDesc", "Vos informations ont été pré-remplies à partir du PDF.") });
      } catch {
        // Invalid JSON, ignore
      }
      sessionStorage.removeItem("importedResumeData");
    }
  }, [importedMode]);

  // If editing existing resume that already has wizard data, skip wizard
  useEffect(() => {
    if (resumeId && data.targetCountry) {
      setShowWizard(false);
    }
  }, [resumeId, data.targetCountry]);

  useEffect(() => {
    auth.getSession().then(({ data: { session } }: any) => {
      if (!session) navigate("/login");
      setAuthLoading(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (currentStep !== 9 || completionTrackedRef.current) return;
    completionTrackedRef.current = true;
    void trackProductEvent("resume_completed", {
      data: {
        resumeId,
        template,
        targetCountry: data.targetCountry,
        jobField: data.jobField,
      },
    });
  }, [currentStep, resumeId, template, data.targetCountry, data.jobField]);

  const simplified = data.simplifiedMode;
  const visibleSteps = getVisibleSteps(simplified);
  const readiness = getResumeReadiness(data, customization, template);

  useEffect(() => {
    if (visibleSteps.includes(currentStep as never)) return;
    const fallbackStep = [...visibleSteps].reverse().find((step) => step < currentStep) ?? visibleSteps[0];
    goToStep(fallbackStep);
  }, [currentStep, goToStep, visibleSteps]);

  const handleWizardComplete = async (result: { targetCountry: TargetCountry; jobField: JobField; jobTitle: string; experienceLevel: ExperienceLevel }) => {
    const countryStd = getCountryStandard(result.targetCountry);
    const jobCat = getJobCategory(result.jobField);
    const isSimple = isSimplifiedMode(result.jobField);

    updateData({
      targetCountry: result.targetCountry,
      jobField: result.jobField,
      jobTitle: result.jobTitle,
      experienceLevel: result.experienceLevel,
      jobTarget: result.jobTitle,
      simplifiedMode: isSimple,
    });

    setTemplate(countryStd.preferredTemplate);
    updateCustomization({ showPhoto: countryStd.showPhoto });

    setShowWizard(false);
    setShowSectionSuggestions(true);

    if (expressMode || result.jobTitle) {
      setPrefilling(true);
      try {
        const { data: aiResult, error } = await supabase.functions.invoke("resume-ai", {
          body: {
            action: "prefill-resume",
            data: {
              country: result.targetCountry,
              jobTitle: result.jobTitle,
              experienceLevel: result.experienceLevel,
              field: result.jobField,
            },
          },
        });

        if (!error && aiResult?.result) {
          try {
            const match = aiResult.result.match(/\{[\s\S]*\}/);
            if (match) {
              const prefilled = JSON.parse(match[0]);
              const updates: any = {};
              if (prefilled.summary) updates.summary = prefilled.summary;
              if (prefilled.skills?.length > 0) {
                updates.skillCategories = [
                  { id: "tech", name: jobCat.skillLabel, skills: prefilled.skills.slice(0, 8) },
                  { id: "soft", name: "Compétences personnelles", skills: prefilled.softSkills?.slice(0, 6) || [] },
                  { id: "tools", name: "Outils & Logiciels", skills: prefilled.tools?.slice(0, 6) || [] },
                ];
              }
              if (prefilled.experience?.length > 0) {
                updates.experience = prefilled.experience.map((exp: any, i: number) => ({
                  id: `prefill-${i}`,
                  company: exp.company || "",
                  position: exp.position || result.jobTitle,
                  startDate: exp.startDate || "",
                  endDate: exp.endDate || "",
                  current: false,
                  bullets: exp.bullets || [],
                }));
              }
              if (prefilled.languages?.length > 0) {
                updates.languages = prefilled.languages;
              }
              updateData(updates);

              if (expressMode) {
                goToStep(9);
              }
            }
          } catch {
            // Parse error, continue without prefill
          }
        }
      } catch {
        // AI error, continue without prefill
      }
      setPrefilling(false);
    }
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (prefilling) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">{t("resume.aiPreparing")}</p>
        <p className="text-sm text-muted-foreground">{t("resume.aiGenerating")}</p>
      </div>
    );
  }

  if (showWizard) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                  <FileText className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Resume</span>
              </Link>
            </div>
          </div>
        </header>
        <SmartWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} expressMode={expressMode} />
      </div>
    );
  }

  const currentVisibleIndex = visibleSteps.indexOf(currentStep as any);
  const prevStep = currentVisibleIndex > 0 ? visibleSteps[currentVisibleIndex - 1] : null;
  const nextStep = currentVisibleIndex < visibleSteps.length - 1 ? visibleSteps[currentVisibleIndex + 1] : null;
  const isLastStep = currentStep === 9;
  const currentStepStatus = readiness.stepStatus[currentStep];
  const currentBlockers = currentStepStatus?.blockers || [];
  const currentStepBlocked = Boolean(currentStepStatus && !currentStepStatus.complete && !currentStepStatus.optional && currentBlockers.length > 0);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepPersonalInfo data={data} updateData={updateData} />;
      case 2: return <StepExperience data={data} updateData={updateData} />;
      case 3: return <StepEducation data={data} updateData={updateData} />;
      case 4: return <StepSkills data={data} updateData={updateData} />;
      case 5: return <StepDesign data={data} updateData={updateData} template={template} setTemplate={setTemplate} customization={customization} updateCustomization={updateCustomization} />;
      case 9: return <StepPreview data={data} customization={customization} template={template} saving={saving} completionPercent={readiness.completionPercent} exportBlockers={readiness.exportBlockers} onSave={() => save()} onUpdateData={updateData} />;
      default: return null;
    }
  };

  const countryTip = data.targetCountry ? getCountryStandard(data.targetCountry as TargetCountry) : null;

  // Use fixture data as ghosted placeholder when resume is empty
  const hasContent = !!(data.personalInfo.firstName || data.personalInfo.lastName || data.summary || data.experience.length > 0);
  const placeholderFixture = !hasContent ? getResumeFixture("horizon") : null;
  const previewData = hasContent ? data : (placeholderFixture?.data ?? data);
  const previewCustomization = hasContent ? customization : (placeholderFixture?.customization ?? customization);

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Resume</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {data.targetCountry && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {countryTip?.flag} {countryTip?.label}
              </span>
            )}
            {saveError ? (
              <span className="text-xs text-destructive">{t("resume.savingError")}</span>
            ) : saving ? (
              <span className="flex items-center gap-1.5 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" /> {t("resume.saving")}
              </span>
            ) : lastSavedAt ? (
              <span className="text-xs">{t("resume.savedAt", { time: new Date(lastSavedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) })}</span>
            ) : (
              <span className="text-xs">{t("resume.readyToSave")}</span>
            )}
          </div>
        </div>
      </header>

      {/* Progress with integrated readiness */}
      <div className="border-b bg-background">
        <div className="container py-3 flex items-center gap-4">
          <div className="flex-1">
            <StepProgress
              currentStep={currentStep}
              onStepClick={goToStep}
              visibleSteps={visibleSteps as unknown as number[]}
              stepStatus={readiness.stepStatus}
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-muted-foreground">{readiness.completionPercent}%</span>
            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${readiness.completionPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Country tip banner */}
      {countryTip && currentStep <= 4 && (
        <div className="border-b bg-muted/30">
          <div className="container py-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>💡</span>
            <span>{countryTip.tips[Math.min(currentStep - 1, countryTip.tips.length - 1)]}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <main className={`container py-8 ${!isMobile && currentStep !== 9 ? "max-w-7xl" : "max-w-3xl"}`}>
        {/* Section Suggestions (after wizard) - compact banner */}
        {showSectionSuggestions && (
          <div className="mb-6">
            <SectionSuggestions
              data={data}
              visible={showSectionSuggestions}
              onDismiss={() => setShowSectionSuggestions(false)}
              onEnableSections={(sections) => {
                updateData({ additionalSections: sections });
              }}
            />
          </div>
        )}

        {/* Split-screen layout for desktop */}
        <div className={`${!isMobile && currentStep !== 9 ? "grid grid-cols-2 gap-6" : ""}`}>
          <div>
            {renderStep()}

            {/* Navigation */}
            {!isLastStep && (
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => prevStep && goToStep(prevStep)}
                  disabled={!prevStep}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> {t("resume.previous")}
                </Button>
                <Button onClick={() => nextStep && goToStep(nextStep)} disabled={!nextStep || currentStepBlocked} className="gap-2">
                  {t("resume.next")} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Live Preview Panel — always visible on desktop */}
          {!isMobile && currentStep !== 9 && (
            <div className="sticky top-32 h-fit">
              <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                <div className="border-b px-4 py-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{t("resume.livePreview")}</span>
                  {!hasContent && (
                    <span className="ml-auto text-[10px] text-muted-foreground italic">{t("resume.previewPlaceholder", "Aperçu exemple")}</span>
                  )}
                </div>
                <div className="overflow-hidden" style={{ aspectRatio: "210/297", maxHeight: "calc(100vh - 220px)" }}>
                  <div style={{ transform: "scale(0.48)", width: "208.33%", transformOrigin: "top left", opacity: hasContent ? 1 : 0.45 }}>
                    <div className="bg-white p-8">
                      <ResumePreview data={previewData} customization={previewCustomization} template={template} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile floating preview button */}
      {isMobile && currentStep !== 9 && (
        <Button
          onClick={() => setMobilePreviewOpen(true)}
          className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg p-0"
        >
          <Eye className="h-5 w-5" />
        </Button>
      )}

      {/* Mobile preview drawer */}
      <Drawer open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
        <DrawerContent className="h-[88vh]">
          <DrawerHeader className="border-b pb-3">
            <DrawerTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              {t("resume.livePreview")}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-auto p-4 bg-muted/30">
            {!hasContent && (
              <p className="mb-3 text-center text-xs text-muted-foreground italic">{t("resume.previewPlaceholder", "Aperçu exemple")}</p>
            )}
            <div className="mx-auto overflow-hidden rounded-lg border bg-white shadow" style={{ maxWidth: "360px" }}>
              <div style={{ transform: "scale(0.38)", width: "263%", transformOrigin: "top left", opacity: hasContent ? 1 : 0.45 }}>
                <div className="p-8">
                  <ResumePreview data={previewData} customization={previewCustomization} template={template} />
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* AI Chat Assistant */}
      <AiChatAssistant data={data} currentStep={currentStep} template={template} />
    </div>
  );
};

export default ResumeBuilder;
