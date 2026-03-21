import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Eye, Sparkles, Target, Zap, Shield, LayoutGrid, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ResumeData, ResumeCustomization } from "@/types/resume";
import { getResumeTemplateMeta, getRecommendedResumeTemplate } from "@/lib/template-recommendations";
import { getResumeFixture } from "@/lib/template-preview-fixtures";
import ResumePreview from "@/components/resume/ResumePreview";

const templates = [
  { id: "essentiel", label: "Essentiel" },
  { id: "horizon", label: "Horizon" },
  { id: "trajectoire", label: "Trajectoire" },
  { id: "impact", label: "Impact" },
  { id: "minimal", label: "Minimal" },
  { id: "mosaic", label: "Mosaic" },
  { id: "direction", label: "Direction" },
  { id: "signature", label: "Signature" },
  { id: "prestige", label: "Prestige" },
  { id: "studio", label: "Studio" },
  { id: "atlas", label: "Atlas" },
  { id: "academique", label: "Académique" },
  { id: "medical", label: "Médical" },
  { id: "technique", label: "Technique" },
];

const POPULAR_IDS = ["essentiel", "horizon", "trajectoire", "impact", "minimal"];
const SPECIALIST_IDS = ["direction", "signature", "prestige", "studio", "mosaic", "atlas"];
const SECTOR_IDS = ["academique", "medical", "technique"];

type FilterKey = "all" | "populaires" | "specialises" | "sectoriels" | "ats-max" | "premium" | "creatif";

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "populaires", label: "Populaires" },
  { key: "specialises", label: "Spécialisés" },
  { key: "sectoriels", label: "Sectoriels" },
  { key: "ats-max", label: "ATS maximal" },
  { key: "premium", label: "Premium" },
  { key: "creatif", label: "Créatif" },
];

const FILTER_MAP: Record<FilterKey, string[] | null> = {
  all: null,
  populaires: POPULAR_IDS,
  specialises: SPECIALIST_IDS,
  sectoriels: SECTOR_IDS,
  "ats-max": ["essentiel", "technique"],
  premium: ["prestige", "direction", "minimal"],
  creatif: ["signature", "studio", "mosaic", "minimal", "impact"],
};

function atsColor(label: string) {
  if (label === "ATS maximal") return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (label === "ATS fort")    return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300";
  if (label === "ATS bon")     return "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300";
  if (label === "ATS moyen")   return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-muted text-muted-foreground";
}

interface MetaRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}

function MetaRow({ icon: Icon, label, value, valueClass }: MetaRowProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <span className="font-medium text-foreground">{label} : </span>
        <span className={cn("text-muted-foreground", valueClass)}>{value}</span>
      </div>
    </div>
  );
}

interface Props {
  data: ResumeData;
  template: string;
  setTemplate: (t: string) => void;
  customization?: ResumeCustomization;
}

const StepTemplate = ({ data, template, setTemplate, customization }: Props) => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const recommended = getRecommendedResumeTemplate({
    targetCountry: data.targetCountry as any,
    jobField: data.jobField as any,
    experienceLevel: data.experienceLevel as any,
    jobTitle: data.jobTitle || data.jobTarget,
  });

  const allowedIds = FILTER_MAP[activeFilter];
  const filteredTemplates = allowedIds
    ? templates.filter((t) => allowedIds.includes(t.id))
    : templates;

  const previewMeta = previewTemplateId ? getResumeTemplateMeta(previewTemplateId) : null;
  const previewFixture = previewTemplateId ? getResumeFixture(previewTemplateId) : null;
  const previewCustomization = previewFixture
    ? {
        ...previewFixture.customization,
        accentColor: customization?.accentColor ?? previewFixture.customization.accentColor,
        fontPair: customization?.fontPair ?? previewFixture.customization.fontPair,
      }
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Choisissez un modèle</h2>
        <p className="mt-1 text-muted-foreground">
          14 modèles disponibles. Le recommandé est mis en avant, mais tous sont accessibles.
        </p>
      </div>

      {/* Slim recommendation strip */}
      {recommended && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            Recommandé pour vous :{" "}
            <span className="font-semibold text-foreground">{recommended.meta.label}</span>
            {" — "}{recommended.reason}
          </span>
          {template !== recommended.id && (
            <button
              onClick={() => setTemplate(recommended.id)}
              className="ml-auto shrink-0 text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              l'utiliser
            </button>
          )}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill.key}
            onClick={() => setActiveFilter(pill.key)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
              activeFilter === pill.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          {filteredTemplates.map((tpl) => {
            const meta = getResumeTemplateMeta(tpl.id);
            const fixture = getResumeFixture(tpl.id);
            const cardCustomization = {
              ...fixture.customization,
              accentColor: customization?.accentColor ?? fixture.customization.accentColor,
              fontPair: customization?.fontPair ?? fixture.customization.fontPair,
            };

            return (
              <motion.div
                key={tpl.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                onMouseEnter={() => setHoveredId(tpl.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setTemplate(tpl.id)}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-shadow",
                  template === tpl.id
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary/40 hover:shadow-md"
                )}
              >
                {/* Preview area */}
                <div className="relative bg-white" style={{ height: 380 }}>
                  <div
                    style={{
                      transform: "scale(0.40)",
                      transformOrigin: "top left",
                      width: "250%",
                      pointerEvents: "none",
                    }}
                  >
                    <ResumePreview data={fixture.data} customization={cardCustomization} template={tpl.id} />
                  </div>

                  {/* Hover overlay */}
                  {hoveredId === tpl.id && template !== tpl.id && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-[1px]">
                      <Button
                        size="sm"
                        className="gap-1.5 shadow-lg"
                        onClick={(e) => { e.stopPropagation(); setTemplate(tpl.id); }}
                      >
                        <Check className="h-3.5 w-3.5" /> Sélectionner
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1.5 shadow-lg"
                        onClick={(e) => { e.stopPropagation(); setPreviewTemplateId(tpl.id); }}
                      >
                        <Eye className="h-3.5 w-3.5" /> Aperçu
                      </Button>
                    </div>
                  )}

                  {/* Selected state */}
                  <AnimatePresence>
                    {template === tpl.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-3"
                      >
                        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow">
                          Sélectionné
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card footer */}
                <div className="flex items-center gap-2 border-t bg-background px-3 py-2.5">
                  <span className="flex-1 truncate text-sm font-semibold text-foreground">{tpl.label}</span>
                  {meta && (
                    <>
                      <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium", atsColor(meta.atsLabel))}>
                        {meta.atsLabel}
                      </span>
                      <span className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {meta.density}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* Two-column preview modal */}
      <Dialog open={!!previewTemplateId} onOpenChange={() => setPreviewTemplateId(null)}>
        {previewTemplateId && previewMeta && previewFixture && previewCustomization && (
          <DialogContent className="max-w-6xl overflow-hidden p-0">
            <div className="flex h-[80vh]">
              {/* Left: scrollable live preview */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <div
                  style={{
                    transform: "scale(0.75)",
                    transformOrigin: "top center",
                    width: "133%",
                    marginLeft: "-16.5%",
                  }}
                >
                  <ResumePreview
                    data={previewFixture.data}
                    customization={previewCustomization}
                    template={previewTemplateId}
                  />
                </div>
              </div>

              {/* Right: metadata panel */}
              <div className="flex w-72 shrink-0 flex-col border-l bg-background">
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  <div>
                    <h3 className="text-lg font-bold">{previewMeta.label}</h3>
                    <p className="text-sm text-muted-foreground">{previewMeta.styleLabel}</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <MetaRow icon={Target} label="Idéal pour" value={previewMeta.bestFor} />
                    <MetaRow icon={Zap} label="Emphase" value={previewMeta.emphasis} />
                    <MetaRow
                      icon={Shield}
                      label="ATS"
                      value={previewMeta.atsLabel}
                      valueClass={atsColor(previewMeta.atsLabel)}
                    />
                    <MetaRow icon={LayoutGrid} label="Densité" value={previewMeta.density} />
                    <MetaRow icon={Camera} label="Photo" value={previewMeta.photoLabel} />
                  </div>
                </div>

                {/* CTA pinned at bottom */}
                <div className="space-y-2 border-t p-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setTemplate(previewTemplateId);
                      setPreviewTemplateId(null);
                    }}
                  >
                    Utiliser ce modèle
                  </Button>
                  <DialogClose asChild>
                    <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                      Annuler
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default StepTemplate;
