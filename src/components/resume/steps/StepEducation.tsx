import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { ResumeData, Education, TUNISIAN_INSTITUTIONS, DEGREE_TYPES } from "@/types/resume";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Props {
  data: ResumeData;
  updateData: (updates: Partial<ResumeData>) => void;
}

function InstitutionCombobox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setSearch(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = TUNISIAN_INSTITUTIONS.filter(
    (inst) => inst.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10);

  return (
    <div ref={ref} className="relative">
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
      />
      {open && filtered.length > 0 && search.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-auto">
          {filtered.map((inst) => (
            <button
              key={inst}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                value === inst && "bg-accent/50 font-medium"
              )}
              onClick={() => {
                onChange(inst);
                setSearch(inst);
                setOpen(false);
              }}
            >
              {inst}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const StepEducation = ({ data, updateData }: Props) => {
  const { t } = useTranslation();

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    updateData({ education: [...data.education, newEdu] });
  };

  const updateEdu = (id: string, updates: Partial<Education>) => {
    updateData({
      education: data.education.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const removeEdu = (id: string) => {
    updateData({ education: data.education.filter((e) => e.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("education.title", "Formation")}</h2>
        <p className="mt-1 text-muted-foreground">
          {t("education.subtitle", "Ajoutez vos diplômes et formations, du plus récent au plus ancien.")}
        </p>
      </div>

      {data.education.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">{t("education.none", "Aucune formation ajoutée")}</p>
            <Button onClick={addEducation} className="mt-4 gap-2" size="sm">
              <Plus className="h-4 w-4" /> {t("education.add", "Ajouter une formation")}
            </Button>
          </CardContent>
        </Card>
      )}

      {data.education.map((edu, idx) => (
        <Card key={edu.id} className="border">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{t("education.label", "Formation")} {idx + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => removeEdu(edu.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("education.institution", "Établissement *")}</Label>
                <InstitutionCombobox
                  value={edu.institution}
                  onChange={(v) => updateEdu(edu.id, { institution: v })}
                  placeholder={t("education.institutionPlaceholder", "Tapez ou sélectionnez un établissement...")}
                />
                <p className="text-[11px] text-muted-foreground">
                  {t("education.institutionHint", "Université, ISET, centre ATFP, lycée, plateforme en ligne...")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("education.degree", "Diplôme *")}</Label>
                <Select value={edu.degree} onValueChange={(v) => updateEdu(edu.id, { degree: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("education.degreePlaceholder", "Type de diplôme")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREE_TYPES.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("education.field", "Spécialité")}</Label>
                <Input placeholder={t("education.fieldPlaceholder", "Informatique, Gestion...")} value={edu.field} onChange={(e) => updateEdu(edu.id, { field: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("education.startDate", "Date de début")}</Label>
                <Input type="month" value={edu.startDate} onChange={(e) => updateEdu(edu.id, { startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("education.endDate", "Date de fin")}</Label>
                <Input type="month" value={edu.endDate} disabled={edu.current} onChange={(e) => updateEdu(edu.id, { endDate: e.target.value })} />
                <div className="flex items-center gap-2">
                  <Checkbox checked={edu.current} onCheckedChange={(c) => updateEdu(edu.id, { current: !!c, endDate: "" })} />
                  <span className="text-sm text-muted-foreground">{t("education.current", "En cours")}</span>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("education.description", "Description (optionnel)")}</Label>
                <Textarea placeholder={t("education.descriptionPlaceholder", "Mention, projets notables, activités...")} value={edu.description} onChange={(e) => updateEdu(edu.id, { description: e.target.value })} rows={2} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {data.education.length > 0 && (
        <Button onClick={addEducation} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> {t("education.addAnother", "Ajouter une autre formation")}
        </Button>
      )}
    </div>
  );
};

export default StepEducation;
