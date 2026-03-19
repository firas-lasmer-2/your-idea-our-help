import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ResumeData } from "@/types/resume";
import { FolderOpen, Award, Heart, Star, Globe, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  data: ResumeData;
  updateData: (updates: Partial<ResumeData>) => void;
}

const StepAdditionalSections = ({ data, updateData }: Props) => {
  const { t } = useTranslation();

  const sections = [
    { value: "projects", label: t("additional.projects", "Projets"), description: t("additional.projectsDesc", "Projets personnels ou académiques"), icon: FolderOpen },
    { value: "certifications", label: t("additional.certifications", "Certifications"), description: t("additional.certificationsDesc", "Certifications et formations en ligne"), icon: Award },
    { value: "languages", label: t("additional.languages", "Langues"), description: t("additional.languagesDesc", "Langues parlées et niveaux"), icon: Globe },
    { value: "interests", label: t("additional.interests", "Centres d'intérêt"), description: t("additional.interestsDesc", "Loisirs et activités extra-professionnelles"), icon: Heart },
    { value: "volunteer", label: t("additional.volunteer", "Bénévolat"), description: t("additional.volunteerDesc", "Engagement associatif et communautaire"), icon: Users },
    { value: "awards", label: t("additional.awards", "Prix & Distinctions"), description: t("additional.awardsDesc", "Prix, bourses, reconnaissances"), icon: Star },
  ];

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
        <h2 className="text-2xl font-bold text-foreground">{t("additional.title", "Sections supplémentaires")}</h2>
        <p className="mt-1 text-muted-foreground">
          {t("additional.subtitle", "Activez les sections que vous souhaitez inclure dans votre CV.")}
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
