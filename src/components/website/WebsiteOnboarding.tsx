import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { X, ArrowRight, Layers, Eye, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  target: string; // CSS selector
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  position: "right" | "bottom" | "left";
}

const STEPS: OnboardingStep[] = [
  {
    target: "[data-tour='sidebar']",
    icon: <Layers className="h-5 w-5" />,
    titleKey: "onboarding.sidebarTitle",
    descKey: "onboarding.sidebarDesc",
    position: "right",
  },
  {
    target: "[data-tour='preview']",
    icon: <Eye className="h-5 w-5" />,
    titleKey: "onboarding.previewTitle",
    descKey: "onboarding.previewDesc",
    position: "left",
  },
  {
    target: "[data-tour='publish']",
    icon: <Share2 className="h-5 w-5" />,
    titleKey: "onboarding.publishTitle",
    descKey: "onboarding.publishDesc",
    position: "bottom",
  },
];

const STORAGE_KEY = "website-onboarding-done";

export default function WebsiteOnboarding() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const current = STEPS[step];
    if (!current) return;

    const el = document.querySelector(current.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    const tw = tooltip?.offsetWidth || 320;
    const th = tooltip?.offsetHeight || 160;

    let top = 0;
    let left = 0;

    switch (current.position) {
      case "right":
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.right + 16;
        break;
      case "left":
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.left - tw - 16;
        break;
      case "bottom":
        top = rect.bottom + 12;
        left = rect.left + rect.width / 2 - tw / 2;
        break;
    }

    top = Math.max(8, Math.min(top, window.innerHeight - th - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));

    setTooltipPos({ top, left });

    // Highlight target
    el.classList.add("ring-2", "ring-primary", "ring-offset-2", "relative", "z-[60]");
    return () => {
      el.classList.remove("ring-2", "ring-primary", "ring-offset-2", "relative", "z-[60]");
    };
  }, [step, visible]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-[2px]" onClick={dismiss} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[65] w-80 rounded-xl border bg-background p-5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {current.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t(current.titleKey)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t("onboarding.stepOf", { current: step + 1, total: STEPS.length })}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {t(current.descKey)}
        </p>

        <div className="flex items-center justify-between">
          {/* Dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <Button size="sm" className="gap-1.5" onClick={next}>
            {step < STEPS.length - 1
              ? t("onboarding.next", "Suivant")
              : t("onboarding.done", "C'est parti !")}
            {step < STEPS.length - 1 && <ArrowRight className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </>
  );
}
