import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Briefcase, X, Sparkles, Loader2, Wand2 } from "lucide-react";
import { ResumeData, Experience } from "@/types/resume";
import { useResumeAi } from "@/hooks/use-resume-ai";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

interface Props {
  data: ResumeData;
  updateData: (updates: Partial<ResumeData>) => void;
}

const StepExperience = ({ data, updateData }: Props) => {
  const { t } = useTranslation();
  const { enhanceBullet, optimizeTitle, isLoading } = useResumeAi();
  const [enhancingBullet, setEnhancingBullet] = useState<string | null>(null);
  const [titleSuggestions, setTitleSuggestions] = useState<Record<string, string[]>>({});
  const [optimizingTitle, setOptimizingTitle] = useState<string | null>(null);

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""],
    };
    updateData({ experience: [...data.experience, newExp] });
  };

  const updateExp = (id: string, updates: Partial<Experience>) => {
    updateData({
      experience: data.experience.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const removeExp = (id: string) => {
    updateData({ experience: data.experience.filter((e) => e.id !== id) });
  };

  const updateBullet = (expId: string, bulletIdx: number, value: string) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    const bullets = [...exp.bullets];
    bullets[bulletIdx] = value;
    updateExp(expId, { bullets });
  };

  const addBullet = (expId: string) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    updateExp(expId, { bullets: [...exp.bullets, ""] });
  };

  const removeBullet = (expId: string, bulletIdx: number) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp || exp.bullets.length <= 1) return;
    updateExp(expId, { bullets: exp.bullets.filter((_, i) => i !== bulletIdx) });
  };

  const handleEnhanceBullet = async (expId: string, bulletIdx: number) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp || !exp.bullets[bulletIdx].trim()) return;
    
    const key = `${expId}-${bulletIdx}`;
    setEnhancingBullet(key);
    const enhanced = await enhanceBullet(exp.bullets[bulletIdx], exp.position, data.jobTarget);
    if (enhanced) {
      updateBullet(expId, bulletIdx, enhanced);
    }
    setEnhancingBullet(null);
  };

  const handleOptimizeTitle = async (expId: string) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp || !exp.position.trim()) return;

    setOptimizingTitle(expId);
    const suggestions = await optimizeTitle(exp.position, data.jobTarget);
    if (suggestions.length > 0) {
      setTitleSuggestions((prev) => ({ ...prev, [expId]: suggestions }));
    }
    setOptimizingTitle(null);
  };

  const applyTitle = (expId: string, title: string) => {
    updateExp(expId, { position: title });
    setTitleSuggestions((prev) => {
      const next = { ...prev };
      delete next[expId];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("experience.title", "Expérience professionnelle")}</h2>
        <p className="mt-1 text-muted-foreground">
          {t("experience.subtitle", "Ajoutez vos expériences, stages inclus. Utilisez l'IA pour améliorer vos descriptions ! ✨")}
        </p>
      </div>

      {data.experience.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">{t("experience.none", "Aucune expérience ajoutée")}</p>
            <p className="text-xs text-muted-foreground">{t("experience.hint", "Stages, emplois, bénévolat — tout compte !")}</p>
            <Button onClick={addExperience} className="mt-4 gap-2" size="sm">
              <Plus className="h-4 w-4" /> {t("experience.add", "Ajouter une expérience")}
            </Button>
          </CardContent>
        </Card>
      )}

      {data.experience.map((exp, idx) => (
        <Card key={exp.id} className="border">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t("experience.label", "Expérience")} {idx + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => removeExp(exp.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("experience.position", "Poste *")}</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={t("experience.positionPlaceholder", "Développeur web, Stagiaire marketing...")}
                    value={exp.position}
                    onChange={(e) => updateExp(exp.id, { position: e.target.value })}
                    className="flex-1"
                  />
                  <Popover open={!!titleSuggestions[exp.id]}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        disabled={!exp.position.trim() || optimizingTitle === exp.id}
                        onClick={() => handleOptimizeTitle(exp.id)}
                        title={t("experience.optimizeTitle", "Optimiser le titre avec l'IA")}
                      >
                        {optimizingTitle === exp.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Wand2 className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="end">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">{t("experience.titleSuggestions", "Suggestions de titre :")}</p>
                        {(titleSuggestions[exp.id] || []).map((title, i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            className="w-full justify-start text-sm h-auto py-2"
                            onClick={() => applyTitle(exp.id, title)}
                          >
                            {title}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("experience.company", "Entreprise *")}</Label>
                <Input placeholder={t("experience.companyPlaceholder", "Nom de l'entreprise")} value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("experience.startDate", "Date de début")}</Label>
                <Input type="month" value={exp.startDate} onChange={(e) => updateExp(exp.id, { startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("experience.endDate", "Date de fin")}</Label>
                <Input type="month" value={exp.endDate} disabled={exp.current} onChange={(e) => updateExp(exp.id, { endDate: e.target.value })} />
                <div className="flex items-center gap-2">
                  <Checkbox checked={exp.current} onCheckedChange={(c) => updateExp(exp.id, { current: !!c, endDate: "" })} />
                  <span className="text-sm text-muted-foreground">{t("experience.current", "En cours")}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("experience.tasks", "Description des tâches")}</Label>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" /> {t("experience.aiHint", "Cliquez ✨ pour améliorer avec l'IA")}
                </span>
              </div>
              {exp.bullets.map((bullet, bIdx) => {
                const bulletKey = `${exp.id}-${bIdx}`;
                const isEnhancing = enhancingBullet === bulletKey;
                return (
                  <div key={bIdx} className="flex items-center gap-2">
                    <span className="text-muted-foreground">•</span>
                    <Input
                      placeholder={t("experience.bulletPlaceholder", "Décrivez une tâche ou réalisation...")}
                      value={bullet}
                      onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                      className="flex-1"
                      disabled={isEnhancing}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-primary hover:text-primary hover:bg-primary/10"
                      disabled={!bullet.trim() || isEnhancing}
                      onClick={() => handleEnhanceBullet(exp.id, bIdx)}
                      title={t("experience.enhanceAi", "Améliorer avec l'IA")}
                    >
                      {isEnhancing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    {exp.bullets.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeBullet(exp.id, bIdx)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => addBullet(exp.id)}>
                <Plus className="h-3 w-3" /> {t("experience.addBullet", "Ajouter un point")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {data.experience.length > 0 && (
        <Button onClick={addExperience} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> {t("experience.addAnother", "Ajouter une autre expérience")}
        </Button>
      )}
    </div>
  );
};

export default StepExperience;
