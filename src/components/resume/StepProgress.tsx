import { AlertCircle, Check } from "lucide-react";
import { RESUME_STEPS } from "@/types/resume";
import { cn } from "@/lib/utils";
import type { ResumeStepStatus } from "@/lib/resume-readiness";

interface StepProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  visibleSteps?: number[];
  stepStatus?: Record<number, ResumeStepStatus>;
}

const StepProgress = ({ currentStep, onStepClick, visibleSteps, stepStatus }: StepProgressProps) => {
  const steps = visibleSteps
    ? RESUME_STEPS.filter(s => visibleSteps.includes(s.id))
    : RESUME_STEPS;

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
                <span className="hidden sm:inline">{step.label}</span>
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
