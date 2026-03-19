import { AlertCircle, Check } from "lucide-react";
import { RESUME_STEPS } from "@/types/resume";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { ResumeStepStatus } from "@/lib/resume-readiness";

interface StepProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  visibleSteps?: number[];
  stepStatus?: Record<number, ResumeStepStatus>;
}

const StepProgress = ({ currentStep, onStepClick, visibleSteps, stepStatus }: StepProgressProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const steps = visibleSteps
    ? RESUME_STEPS.filter(s => visibleSteps.includes(s.id))
    : RESUME_STEPS;

  const currentStepData = steps.find(s => s.id === currentStep);
  const currentIdx = steps.findIndex(s => s.id === currentStep);

  // Mobile: compact stepper with bottom sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2 h-10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {currentIdx + 1}
              </span>
              <span className="text-sm font-medium">{currentStepData ? t(currentStepData.label) : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {t("steps.stepOf", { current: currentIdx + 1, total: steps.length })}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{t("steps.allSteps", "Toutes les étapes")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-1 pb-4">
            {steps.map((step, idx) => {
              const isActive = step.id === currentStep;
              const isCompleted = stepStatus?.[step.id]?.complete;
              const hasBlockers = Boolean(stepStatus?.[step.id] && !stepStatus[step.id].complete && stepStatus[step.id].blockers.length > 0);
              return (
                <button
                  key={step.id}
                  onClick={() => { onStepClick(step.id); setMobileOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                    isActive && "bg-primary/10",
                    !isActive && "hover:bg-muted"
                  )}
                >
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && !isActive && "bg-primary/10 text-primary",
                    hasBlockers && !isActive && "bg-destructive/10 text-destructive",
                    !isActive && !isCompleted && !hasBlockers && "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : hasBlockers ? <AlertCircle className="h-3.5 w-3.5" /> : idx + 1}
                  </span>
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {t(step.label)}
                  </span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: horizontal step bar
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex min-w-max items-center gap-1">
        {steps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const hasBlockers = Boolean(stepStatus?.[step.id] && !stepStatus[step.id].complete && stepStatus[step.id].blockers.length > 0);
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => onStepClick(step.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive && "bg-primary text-primary-foreground shadow-sm",
                  isCompleted && "text-primary hover:bg-primary/10",
                  hasBlockers && !isActive && !isCompleted && "text-destructive hover:bg-destructive/10",
                  !isActive && !isCompleted && !hasBlockers && "text-muted-foreground hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isActive && "bg-primary-foreground/20 text-primary-foreground",
                    isCompleted && "bg-primary/10 text-primary",
                    hasBlockers && !isActive && !isCompleted && "bg-destructive/10 text-destructive",
                    !isActive && !isCompleted && !hasBlockers && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : hasBlockers ? <AlertCircle className="h-3.5 w-3.5" /> : idx + 1}
                </span>
                <span className="hidden sm:inline">{t(step.label)}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className={cn("mx-1 h-px w-4", isCompleted ? "bg-primary" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
