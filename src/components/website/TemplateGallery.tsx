import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Eye, Sparkles, Target, Zap, Activity, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { WebsiteTemplate, getTemplatesForCategory, buildSectionsFromTemplate } from "@/data/website-templates";
import WebsitePreview from "./WebsitePreview";
import { cn } from "@/lib/utils";
import { getWebsiteTemplateMeta } from "@/lib/template-recommendations";

interface Props {
  category: string;
  selectedTemplateId: string | null;
  recommendedTemplateId?: string | null;
  recommendedReason?: string;
  onSelect: (template: WebsiteTemplate) => void;
}

function MetaRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span>
        <span className="font-medium text-foreground">{label} : </span>
        <span className="text-muted-foreground">{value}</span>
      </span>
    </div>
  );
}

const TemplateGallery = ({ category, selectedTemplateId, recommendedTemplateId, recommendedReason, onSelect }: Props) => {
  const templates = getTemplatesForCategory(category);
  const [previewTemplate, setPreviewTemplate] = useState<WebsiteTemplate | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const recommendedTemplate = templates.find((template) => template.id === recommendedTemplateId) || null;
  const previewMeta = previewTemplate ? getWebsiteTemplateMeta(previewTemplate.id) : null;

  if (templates.length === 0) return null;

  return (
    <>
      {recommendedTemplate && recommendedReason && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="text-muted-foreground">
            Recommandé : <span className="font-semibold text-foreground">{recommendedTemplate.name}</span>
            {" — "}{recommendedReason}
          </span>
          {selectedTemplateId !== recommendedTemplate.id && (
            <button
              onClick={() => onSelect(recommendedTemplate)}
              className="ml-auto shrink-0 text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              l'utiliser
            </button>
          )}
        </div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          {templates.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;
            const meta = getWebsiteTemplateMeta(tpl.id);

            return (
              <motion.div
                key={tpl.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                onMouseEnter={() => setHoveredId(tpl.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(tpl)}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-shadow",
                  isSelected
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary/40 hover:shadow-md",
                )}
              >
                {/* Preview area */}
                <div className="relative overflow-hidden bg-white" style={{ height: 360 }}>
                  <div
                    className="pointer-events-none absolute inset-0 origin-top-left"
                    style={{ width: "1200px", transform: "scale(0.28)", transformOrigin: "top left" }}
                  >
                    <WebsitePreview
                      sections={buildSectionsFromTemplate(tpl)}
                      globalSettings={tpl.globalSettings}
                      title={tpl.sampleContent.navbar?.logoText || tpl.name}
                      template={tpl.id}
                    />
                  </div>

                  {/* Hover overlay */}
                  {hoveredId === tpl.id && !isSelected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-[1px]">
                      <Button
                        size="sm"
                        className="gap-1.5 shadow-lg"
                        onClick={(e) => { e.stopPropagation(); onSelect(tpl); }}
                      >
                        <Check className="h-3.5 w-3.5" /> Sélectionner
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1.5 shadow-lg"
                        onClick={(e) => { e.stopPropagation(); setPreviewTemplate(tpl); }}
                      >
                        <Eye className="h-3.5 w-3.5" /> Aperçu complet
                      </Button>
                    </div>
                  )}

                  {/* Animated selected state */}
                  <AnimatePresence>
                    {isSelected && (
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
                  <span className="flex-1 truncate text-sm font-semibold text-foreground">{tpl.name}</span>
                  {meta && (
                    <>
                      <span className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {meta.styleLabel}
                      </span>
                      <span className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {meta.motionLabel}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* Full preview modal — two-column */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-6xl overflow-hidden p-0">
          <div className="flex h-[80vh]">
            {/* Left: scrollable live preview */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {previewTemplate && (
                <WebsitePreview
                  sections={buildSectionsFromTemplate(previewTemplate)}
                  globalSettings={previewTemplate.globalSettings}
                  title={previewTemplate.sampleContent.navbar?.logoText || previewTemplate.name}
                  template={previewTemplate.id}
                />
              )}
            </div>

            {/* Right: metadata panel */}
            <div className="flex w-72 shrink-0 flex-col border-l bg-background">
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div>
                  <h3 className="text-lg font-bold">{previewTemplate?.name}</h3>
                  <p className="text-sm text-muted-foreground">{previewMeta?.styleLabel}</p>
                </div>
                <div className="space-y-3 text-sm">
                  <MetaRow icon={Target} label="Idéal pour" value={previewMeta?.bestFor} />
                  <MetaRow icon={Zap} label="Emphase" value={previewMeta?.emphasis} />
                  <MetaRow icon={Activity} label="Animations" value={previewMeta?.motionLabel} />
                  <MetaRow icon={LayoutGrid} label="Sections" value={previewTemplate ? `${previewTemplate.sectionTypes.length} sections` : undefined} />
                </div>
              </div>
              {/* Pinned CTA */}
              <div className="space-y-2 border-t p-4">
                <Button
                  className="w-full"
                  onClick={() => { onSelect(previewTemplate!); setPreviewTemplate(null); }}
                >
                  Utiliser ce modèle
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost" className="w-full text-xs text-muted-foreground">Annuler</Button>
                </DialogClose>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateGallery;
