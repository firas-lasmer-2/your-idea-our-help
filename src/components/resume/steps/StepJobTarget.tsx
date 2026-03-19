import { Card, CardContent } from "@/components/ui/card";
import { ResumeData } from "@/types/resume";
import { Briefcase, GraduationCap, Rocket, User } from "lucide-react";
import { cn } from "@/lib/utils";

const targets = [
  { value: "internship", label: "Stage / PFE", description: "Recherche de stage de fin d'études", icon: GraduationCap },
  { value: "first-job", label: "Premier emploi", description: "Nouveau diplômé cherchant un premier poste", icon: Rocket },
  { value: "experienced", label: "Professionnel", description: "Professionnel avec de l'expérience", icon: Briefcase },
  { value: "freelance", label: "Freelance", description: "Travailleur indépendant / consultant", icon: User },
];

interface Props {
  data: ResumeData;
  updateData: (updates: Partial<ResumeData>) => void;
}

const StepJobTarget = ({ data, updateData }: Props) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Quel est votre objectif ?</h2>
        <p className="mt-1 text-muted-foreground">
          Cela nous aide à adapter votre CV à votre situation.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {targets.map((target) => (
          <Card
            key={target.value}
            className={cn(
              "cursor-pointer border-2 transition-all hover:shadow-md",
              data.jobTarget === target.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/30"
            )}
            onClick={() => updateData({ jobTarget: target.value })}
          >
            <CardContent className="flex items-start gap-4 p-5">
              <div className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                data.jobTarget === target.value ? "bg-primary/10" : "bg-muted"
              )}>
                <target.icon className={cn("h-5 w-5", data.jobTarget === target.value ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{target.label}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{target.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StepJobTarget;
