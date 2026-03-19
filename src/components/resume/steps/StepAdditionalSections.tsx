import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ResumeData } from "@/types/resume";
import { FolderOpen, Award, Heart, Star, Globe, Users } from "lucide-react";

const sections = [
  { value: "projects", label: "Projets", description: "Projets personnels ou académiques", icon: FolderOpen },
  { value: "certifications", label: "Certifications", description: "Certifications et formations en ligne", icon: Award },
  { value: "languages", label: "Langues", description: "Langues parlées et niveaux", icon: Globe },
  { value: "interests", label: "Centres d'intérêt", description: "Loisirs et activités extra-professionnelles", icon: Heart },
  { value: "volunteer", label: "Bénévolat", description: "Engagement associatif et communautaire", icon: Users },
  { value: "awards", label: "Prix & Distinctions", description: "Prix, bourses, reconnaissances", icon: Star },
];

interface Props {
  data: ResumeData;
  updateData: (updates: Partial<ResumeData>) => void;
}

const StepAdditionalSections = ({ data, updateData }: Props) => {
  const toggle = (value: string) => {
    const current = data.additionalSections || [];
    updateData({
      additionalSections: current.includes(value)
        ? current.filter((s) => s !== value)
        : [...current, value],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sections supplémentaires</h2>
        <p className="mt-1 text-muted-foreground">
          Activez les sections que vous souhaitez inclure dans votre CV.
        </p>
      </div>

      <div className="grid gap-3">
        {sections.map((section) => {
          const active = (data.additionalSections || []).includes(section.value);
          return (
            <Card key={section.value} className={`border transition-colors ${active ? "border-primary/30 bg-primary/5" : ""}`}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary/10" : "bg-muted"}`}>
                  <section.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-semibold cursor-pointer">{section.label}</Label>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
                <Switch checked={active} onCheckedChange={() => toggle(section.value)} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StepAdditionalSections;
