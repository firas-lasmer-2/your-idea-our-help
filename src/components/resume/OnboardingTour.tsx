import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, Target, Palette, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const TOUR_KEY = "resume-onboarding-done";

const OnboardingTour = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Target,
      title: t("onboarding.step1Title", "Commencez par votre objectif"),
      description: t("onboarding.step1Desc", "Choisissez votre type de recherche et collez une offre d'emploi pour un matching IA automatique."),
    },
    {
      icon: Sparkles,
      title: t("onboarding.step2Title", "L'IA vous accompagne"),
      description: t("onboarding.step2Desc", "À chaque étape, utilisez les boutons ✨ pour améliorer vos bullet points, générer un résumé, et suggérer des compétences."),
    },
    {
      icon: Palette,
      title: t("onboarding.step3Title", "Personnalisez votre design"),
      description: t("onboarding.step3Desc", "Choisissez parmi nos modèles (Essentiel, Horizon, Signature) et ajustez couleurs et typographie."),
    },
    {
      icon: BarChart3,
      title: t("onboarding.step4Title", "Score ATS & téléchargement"),
      description: t("onboarding.step4Desc", "Vérifiez votre score de compatibilité ATS, générez une lettre de motivation, et téléchargez en PDF."),
    },
  ];

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(TOUR_KEY, "true");
  };

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      dismiss();
    }
  };

  if (!show) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative mx-4 w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl"
        >
          <button onClick={dismiss} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>

            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/20"}`} />
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={dismiss} className="text-muted-foreground">
                {t("onboarding.skip", "Passer")}
              </Button>
              <Button size="sm" onClick={next} className="gap-1.5">
                {currentStep < steps.length - 1 ? t("onboarding.next", "Suivant") : t("onboarding.letsGo", "C'est parti !")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
