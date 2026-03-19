import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Eye, Palette, Sparkles } from "lucide-react";
import { WebsiteTemplate, getTemplatesForCategory, buildSectionsFromTemplate } from "@/data/website-templates";
import { FONT_OPTIONS } from "@/types/website";
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

const TemplateGallery = ({ category, selectedTemplateId, recommendedTemplateId, recommendedReason, onSelect }: Props) => {
  const templates = getTemplatesForCategory(category);
  const [previewTemplate, setPreviewTemplate] = useState<WebsiteTemplate | null>(null);
  const recommendedTemplate = templates.find((template) => template.id === recommendedTemplateId) || null;

  if (templates.length === 0) return null;

  return (
    <>
      {recommendedTemplate && recommendedReason && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Template recommandé</p>
              </div>
              <p className="mt-1 text-sm text-foreground">{recommendedTemplate.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{recommendedReason}</p>
            </div>
            {selectedTemplateId !== recommendedTemplate.id && (
              <Button size="sm" onClick={() => onSelect(recommendedTemplate)}>
                Utiliser le recommandé
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {templates.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          const isRecommended = recommendedTemplateId === tpl.id;
          const fontLabel = FONT_OPTIONS.find(f => f.value === tpl.globalSettings.fontPair)?.label || tpl.globalSettings.fontPair;
          const meta = getWebsiteTemplateMeta(tpl.id);

          return (
            <Card
              key={tpl.id}
              className={cn(
                "cursor-pointer border-2 transition-all overflow-hidden group",
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40 hover:shadow-lg"
              )}
              onClick={() => onSelect(tpl)}
            >
              {/* Mini preview */}
              <div className="relative h-[250px] overflow-hidden bg-muted">
                <div
                  className="absolute inset-0 origin-top-left pointer-events-none"
                  style={{
                    width: "1200px",
                    height: "2400px",
                    transform: "scale(0.19)",
                    transformOrigin: "top left",
                  }}
                >
                  <WebsitePreview
                    sections={buildSectionsFromTemplate(tpl)}
                    globalSettings={tpl.globalSettings}
                    title={tpl.sampleContent.navbar?.logoText || tpl.name}
                    template={tpl.id}
                  />
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(tpl);
                    }}
                  >
                    <Eye className="h-4 w-4" /> Aperçu
                  </Button>
                </div>

                {/* Selected check */}
                {isSelected && (
                  <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                {isRecommended && (
                  <Badge className="absolute left-3 top-3 text-[10px]">
                    Recommandé
                  </Badge>
                )}
              </div>

              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{tpl.name}</h3>
                  <Badge variant="outline" className="text-xs">{tpl.globalSettings.layout}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tpl.description}</p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: tpl.globalSettings.primaryColor }}
                    />
                    <span className="text-xs text-muted-foreground">{fontLabel}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    <Palette className="h-3 w-3 inline mr-0.5" />
                    {tpl.sectionTypes.length} sections
                  </span>
                </div>
                {meta && (
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p><span className="font-medium text-foreground">Style:</span> {meta.styleLabel}</p>
                    <p><span className="font-medium text-foreground">Idéal pour:</span> {meta.bestFor}</p>
                    <p><span className="font-medium text-foreground">Met l'accent sur:</span> {meta.emphasis}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full preview modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name} — Aperçu</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto rounded-lg border border-border">
            {previewTemplate && (
              <WebsitePreview
                sections={buildSectionsFromTemplate(previewTemplate)}
                globalSettings={previewTemplate.globalSettings}
                title={previewTemplate.sampleContent.navbar?.logoText || previewTemplate.name}
                template={previewTemplate.id}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateGallery;
