import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, Target, Palette, BarChart3, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const TOUR_KEY = "resume-onboarding-done";

interface TourStep {
  icon: typeof Target;
  titleKey: string;
  descKey: string;
  defaultTitle: string;
  defaultDesc: string;
  anchorSelector?: string;
  position?: "bottom" | "top" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: Target,
    titleKey: "onboarding.step1Title",
    descKey: "onboarding.step1Desc",
    defaultTitle: "Commencez par votre objectif",
    defaultDesc: "Choisissez votre type de recherche et collez une offre d'emploi pour un matching IA automatique.",
    position: "bottom",
  },
  {
    icon: Sparkles,
    titleKey: "onboarding.step2Title",
    descKey: "onboarding.step2Desc",
    defaultTitle: "L'IA vous accompagne",
    defaultDesc: "À chaque étape, utilisez les boutons ✨ pour améliorer vos bullet points, générer un résumé, et suggérer des compétences.",
    position: "bottom",
  },
  {
    icon: Palette,
    titleKey: "onboarding.step3Title",
    descKey: "onboarding.step3Desc",
    defaultTitle: "Personnalisez votre design",
    defaultDesc: "Choisissez parmi nos modèles (Essentiel, Horizon, Signature) et ajustez couleurs et typographie.",
    position: "bottom",
  },
  {
    icon: BarChart3,
    titleKey: "onboarding.step4Title",
    descKey: "onboarding.step4Desc",
    defaultTitle: "Score ATS & téléchargement",
    defaultDesc: "Vérifiez votre score de compatibilité ATS, générez une lettre de motivation, et téléchargez en PDF.",
    position: "bottom",
  },
];

const OnboardingTour = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      const timer = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(TOUR_KEY, "true");
  }, []);

  const next = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [currentStep, dismiss]);

  const prev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [show, next, prev, dismiss]);

  if (!show) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Subtle backdrop - click to dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px]"
            onClick={dismiss}
          />

          {/* Tooltip card - contextual style */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-[101] w-[380px] max-w-[calc(100vw-2rem)]"
          >
            <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
              {/* Progress bar at top */}
              <div className="h-1 w-full bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: `${((currentStep) / TOUR_STEPS.length) * 100}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="p-5">
                {/* Header with icon and dismiss */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                      "bg-primary/10"
                    )}>
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {t("onboarding.stepOf", "Étape {{current}} / {{total}}", { current: currentStep + 1, total: TOUR_STEPS.length })}
                      </p>
                      <h3 className="text-sm font-bold text-foreground leading-tight mt-0.5">
                        {t(step.titleKey, step.defaultTitle)}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={dismiss}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(step.descKey, step.defaultDesc)}
                </p>

                {/* Navigation */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {currentStep > 0 ? (
                      <Button variant="ghost" size="sm" onClick={prev} className="gap-1 text-muted-foreground h-8 px-2">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={dismiss} className="text-muted-foreground h-8 px-3">
                        {t("onboarding.skip")}
                      </Button>
                    )}
                  </div>

                  {/* Step dots */}
                  <div className="flex gap-1.5">
                    {TOUR_STEPS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentStep(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          i === currentStep ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40",
                        )}
                      />
                    ))}
                  </div>

                  <Button size="sm" onClick={next} className="gap-1.5 h-8 px-3">
                    {isLast ? t("onboarding.letsGo") : t("onboarding.next")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
