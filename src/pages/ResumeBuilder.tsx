import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useResume } from "@/hooks/use-resume";
import { getCountryStandard, getJobCategory, isSimplifiedMode, getVisibleSteps, type TargetCountry, type JobField, type ExperienceLevel } from "@/lib/country-standards";
import StepProgress from "@/components/resume/StepProgress";
import StepPersonalInfo from "@/components/resume/steps/StepPersonalInfo";
import StepEducation from "@/components/resume/steps/StepEducation";
import StepExperience from "@/components/resume/steps/StepExperience";
import StepSkills from "@/components/resume/steps/StepSkills";
import StepAdditionalSections from "@/components/resume/steps/StepAdditionalSections";
import StepTemplate from "@/components/resume/steps/StepTemplate";
import StepCustomization from "@/components/resume/steps/StepCustomization";
import StepPreview from "@/components/resume/steps/StepPreview";
import OnboardingTour from "@/components/resume/OnboardingTour";
import SmartWizard from "@/components/resume/SmartWizard";
import { trackProductEvent } from "@/lib/product-events";
import { getResumeReadiness } from "@/lib/resume-readiness";

const auth = supabase.auth as any;

const ResumeBuilder = () => {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("id") || undefined;
  const expressMode = searchParams.get("express") === "1";
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(!resumeId);
  const [prefilling, setPrefilling] = useState(false);
  const completionTrackedRef = useRef(false);

  const {
    data, updateData,
    customization, updateCustomization,
    currentStep, goToStep,
    template, setTemplate,
    saving, saveError, lastSavedAt, loading, save,
  } = useResume(resumeId);

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
  const currentStepStatus = readiness.stepStatus[currentStep];

  useEffect(() => {
    if (visibleSteps.includes(currentStep as never)) return;
    const fallbackStep = [...visibleSteps].reverse().find((step) => step < currentStep) ?? visibleSteps[0];
    goToStep(fallbackStep);
  }, [currentStep, goToStep, visibleSteps]);

  const handleWizardComplete = async (result: { targetCountry: TargetCountry; jobField: JobField; jobTitle: string; experienceLevel: ExperienceLevel }) => {
    const countryStd = getCountryStandard(result.targetCountry);
    const jobCat = getJobCategory(result.jobField);
    const isSimple = isSimplifiedMode(result.jobField);

    // Auto-configure based on wizard
    updateData({
      targetCountry: result.targetCountry,
      jobField: result.jobField,
      jobTitle: result.jobTitle,
      experienceLevel: result.experienceLevel,
      jobTarget: result.jobTitle,
      simplifiedMode: isSimple,
    });

    // Auto-select template & photo based on country
    setTemplate(countryStd.preferredTemplate);
    updateCustomization({ showPhoto: countryStd.showPhoto });

    setShowWizard(false);

    // AI pre-fill
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
                goToStep(9); // Jump directly to preview
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
        <p className="text-lg font-medium text-foreground">L'IA prépare votre CV...</p>
        <p className="text-sm text-muted-foreground">Génération du contenu adapté à votre profil</p>
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

  // Get current step index in visible steps for navigation
  const currentVisibleIndex = visibleSteps.indexOf(currentStep as any);
  const prevStep = currentVisibleIndex > 0 ? visibleSteps[currentVisibleIndex - 1] : null;
  const nextStep = currentVisibleIndex < visibleSteps.length - 1 ? visibleSteps[currentVisibleIndex + 1] : null;
  const isLastStep = currentStep === 9;
  const currentBlockers = currentStepStatus?.blockers || [];
  const currentStepBlocked = Boolean(currentStepStatus && !currentStepStatus.complete && !currentStepStatus.optional && currentBlockers.length > 0);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepPersonalInfo data={data} updateData={updateData} />;
      case 2: return <StepExperience data={data} updateData={updateData} />;
      case 3: return <StepEducation data={data} updateData={updateData} />;
      case 4: return <StepSkills data={data} updateData={updateData} />;
      case 5: return <StepAdditionalSections data={data} updateData={updateData} />;
      case 6: return <StepTemplate data={data} template={template} setTemplate={setTemplate} />;
      case 7: return <StepCustomization customization={customization} updateCustomization={updateCustomization} />;
      case 9: return <StepPreview data={data} customization={customization} template={template} saving={saving} completionPercent={readiness.completionPercent} exportBlockers={readiness.exportBlockers} onSave={() => save()} onUpdateData={updateData} />;
      default: return null;
    }
  };

  // Country tips banner
  const countryTip = data.targetCountry ? getCountryStandard(data.targetCountry as TargetCountry) : null;

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
              <span className="text-xs text-destructive">Erreur de sauvegarde</span>
            ) : saving ? (
              <span className="flex items-center gap-1.5 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" /> Sauvegarde...
              </span>
            ) : lastSavedAt ? (
              <span className="text-xs">Sauvegarde {new Date(lastSavedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
            ) : (
              <span className="text-xs">Pret a sauvegarder</span>
            )}
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b bg-background">
        <div className="container py-3">
          <StepProgress
            currentStep={currentStep}
            onStepClick={goToStep}
            visibleSteps={visibleSteps as unknown as number[]}
            stepStatus={readiness.stepStatus}
          />
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
      <main className="container max-w-3xl py-8">
        <div className="mb-6 rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Prêt pour l'export à {readiness.completionPercent}%</p>
              <p className="text-xs text-muted-foreground">
                {readiness.exportBlockers.length === 0
                  ? "Les étapes obligatoires sont complétées. Vérifiez l'aperçu puis exportez."
                  : `${readiness.exportBlockers.length} élément${readiness.exportBlockers.length > 1 ? "s restent" : " reste"} à finaliser avant l'export.`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {currentStepBlocked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Étape bloquée
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Étape prête
                </span>
              )}
            </div>
          </div>
          {currentBlockers.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {currentBlockers.map((blocker) => (
                <li key={blocker} className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>{blocker}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

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
              <ArrowLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button onClick={() => nextStep && goToStep(nextStep)} disabled={!nextStep || currentStepBlocked} className="gap-2">
              Suivant <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResumeBuilder;
