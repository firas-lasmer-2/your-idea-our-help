import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { useResumeAi } from "@/hooks/use-resume-ai";
import { useTranslation } from "react-i18next";

interface Props {
  data: ResumeData;
  updateData: (updates: Partial<ResumeData>) => void;
}

const StepSkills = ({ data, updateData }: Props) => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const { suggestSkills, isLoading } = useResumeAi();
  const [suggestingCat, setSuggestingCat] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [showLevels, setShowLevels] = useState<Record<string, boolean>>({});

  const addSkill = (catId: string) => {
    const value = (inputs[catId] || "").trim();
    if (!value) return;
    updateData({
      skillCategories: data.skillCategories.map((cat) =>
        cat.id === catId && !cat.skills.includes(value)
          ? { ...cat, skills: [...cat.skills, value] }
          : cat
      ),
    });
    setInputs((prev) => ({ ...prev, [catId]: "" }));
  };

  const removeSkill = (catId: string, skill: string) => {
    updateData({
      skillCategories: data.skillCategories.map((cat) => {
        if (cat.id !== catId) return cat;
        const newLevels = { ...cat.skillLevels };
        delete newLevels[skill];
        return { ...cat, skills: cat.skills.filter((s) => s !== skill), skillLevels: newLevels };
      }),
    });
  };

  const setSkillLevel = (catId: string, skill: string, level: number) => {
    updateData({
      skillCategories: data.skillCategories.map((cat) =>
        cat.id === catId
          ? { ...cat, skillLevels: { ...cat.skillLevels, [skill]: level } }
          : cat
      ),
    });
  };

  const toggleLevels = (catId: string, enabled: boolean) => {
    setShowLevels((prev) => ({ ...prev, [catId]: enabled }));
    if (!enabled) {
      // Remove all levels for this category
      updateData({
        skillCategories: data.skillCategories.map((cat) =>
          cat.id === catId ? { ...cat, skillLevels: {} } : cat
        ),
      });
    } else {
      // Initialize levels at 80 for all existing skills
      const cat = data.skillCategories.find((c) => c.id === catId);
      if (cat) {
        const levels: Record<string, number> = {};
        cat.skills.forEach((s) => { levels[s] = cat.skillLevels?.[s] ?? 80; });
        updateData({
          skillCategories: data.skillCategories.map((c) =>
            c.id === catId ? { ...c, skillLevels: levels } : c
          ),
        });
      }
    }
  };

  const addSuggestedSkill = (catId: string, skill: string) => {
    updateData({
      skillCategories: data.skillCategories.map((cat) =>
        cat.id === catId && !cat.skills.includes(skill)
          ? { ...cat, skills: [...cat.skills, skill] }
          : cat
      ),
    });
    setSuggestions((prev) => ({
      ...prev,
      [catId]: (prev[catId] || []).filter((s) => s !== skill),
    }));
  };

  const handleSuggestSkills = async (catId: string, catName: string) => {
    setSuggestingCat(catId);
    const cat = data.skillCategories.find((c) => c.id === catId);
    const field = data.education?.[0]?.field || "";
    const result = await suggestSkills(data.jobTarget, field, cat?.skills || [], catName);
    if (result.length > 0) {
      setSuggestions((prev) => ({ ...prev, [catId]: result }));
    }
    setSuggestingCat(null);
  };

  const handleKeyDown = (catId: string, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(catId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("skills.title", "Compétences")}</h2>
        <p className="mt-1 text-muted-foreground">
          {t("skills.subtitle", "Ajoutez vos compétences ou laissez l'IA vous en suggérer ! ✨")}
        </p>
      </div>

      {data.skillCategories.map((cat) => {
        const levelsEnabled = showLevels[cat.id] ?? false;
        return (
          <Card key={cat.id} className="border">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">{cat.name}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    disabled={suggestingCat === cat.id}
                    onClick={() => handleSuggestSkills(cat.id, cat.name)}
                  >
                    {suggestingCat === cat.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    )}
                    {t("skills.aiSuggestions", "Suggestions IA")}
                  </Button>
                </div>
              </div>

              {/* Level toggle */}
              {cat.skills.length > 0 && (
                <div className="flex items-center gap-2">
                  <Switch
                    id={`levels-${cat.id}`}
                    checked={levelsEnabled}
                    onCheckedChange={(v) => toggleLevels(cat.id, v)}
                    className="scale-75"
                  />
                  <Label htmlFor={`levels-${cat.id}`} className="cursor-pointer text-xs text-muted-foreground">
                    {t("skills.showLevels", "Afficher les niveaux")}
                  </Label>
                </div>
              )}

              {/* Skills list */}
              {levelsEnabled ? (
                <div className="space-y-2">
                  {cat.skills.map((skill) => {
                    const level = cat.skillLevels?.[skill] ?? 80;
                    return (
                      <div key={skill} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="flex-1 text-sm font-medium text-foreground">{skill}</span>
                          <span className="w-8 text-right text-xs font-bold text-primary">{level}%</span>
                          <button
                            onClick={() => removeSkill(cat.id, skill)}
                            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                          >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={5}
                          value={level}
                          onChange={(e) => setSkillLevel(cat.id, skill, Number(e.target.value))}
                          className="h-1.5 w-full cursor-pointer accent-primary"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pl-3 pr-1.5 py-1.5">
                      {skill}
                      <button onClick={() => removeSkill(cat.id, skill)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* AI Suggestions */}
              {suggestions[cat.id] && suggestions[cat.id].length > 0 && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {t("skills.clickToAdd", "Suggestions — cliquez pour ajouter")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions[cat.id].map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer border-primary/30 text-primary hover:bg-primary/10 transition-colors py-1.5"
                        onClick={() => addSuggestedSkill(cat.id, skill)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder={t("skills.addPlaceholder", "Ajouter une compétence...")}
                  value={inputs[cat.id] || ""}
                  onChange={(e) => setInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                  onKeyDown={(e) => handleKeyDown(cat.id, e)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => addSkill(cat.id)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StepSkills;
