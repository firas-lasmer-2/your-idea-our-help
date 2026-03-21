import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getResumeFixture, getWebsiteFixture, ResumePreview, WebsitePreview, RESUME_TEMPLATE_IDS, WEBSITE_TEMPLATE_IDS } from "@/lib/template-preview-fixtures";
import { getResumeTemplateMeta, getWebsiteTemplateMeta } from "@/lib/template-recommendations";
import type { ResumeTemplateId, WebsiteTemplateId } from "@/lib/template-recommendations";

type Tab = "cv" | "website";

const RESUME_GROUPS = [
  { label: "Populaires", ids: ["essentiel", "horizon", "trajectoire", "impact", "minimal", "mosaic"] as ResumeTemplateId[] },
  { label: "Spécialisés", ids: ["direction", "signature", "prestige", "studio", "atlas"] as ResumeTemplateId[] },
  { label: "Sectoriels", ids: ["academique", "medical", "technique"] as ResumeTemplateId[] },
];

const WEBSITE_GROUPS = [
  { label: "Profil", ids: ["profile-clean", "route-pro", "executive-profile", "dossier", "signal"] as WebsiteTemplateId[] },
  { label: "Portfolio", ids: ["casefile", "showcase", "spotlight"] as WebsiteTemplateId[] },
];

const TemplateMiniPreview = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("cv");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const openPreview = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewId(id);
  };

  const renderResumeCard = (id: ResumeTemplateId) => {
    const fixture = getResumeFixture(id);
    const meta = getResumeTemplateMeta(id);
    if (!fixture) return null;
    const { data, customization } = fixture;

    return (
      <div key={id} className="group relative flex flex-col rounded-xl border bg-background shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
        {/* Mini preview */}
        <div className="relative overflow-hidden rounded-t-xl bg-white" style={{ height: "240px" }}>
          <div style={{ transform: "scale(0.27)", transformOrigin: "top left", width: "370%", pointerEvents: "none" }}>
            <div className="p-6">
              <ResumePreview data={data} customization={customization} template={id} />
            </div>
          </div>
          {/* Hover overlay with preview button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
            <button
              onClick={(e) => openPreview(id, e)}
              className="flex translate-y-2 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-800 opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100"
            >
              <Eye className="h-3.5 w-3.5" />
              {t("templates.preview", "Aperçu")}
            </button>
          </div>
        </div>
        {/* Card info */}
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-foreground">{meta?.label || id}</span>
            {meta && <Badge variant="outline" className="text-[10px] shrink-0">{meta.atsLabel}</Badge>}
          </div>
          {meta && <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{meta.bestFor}</p>}
          <Link to="/signup" className="mt-auto inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90">
            {t("templates.use", "Utiliser")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  };

  const renderWebsiteCard = (id: WebsiteTemplateId) => {
    const meta = getWebsiteTemplateMeta(id);
    let fixture;
    try { fixture = getWebsiteFixture(id); } catch { return null; }
    const { title, sections, globalSettings } = fixture;

    return (
      <div key={id} className="group relative flex flex-col rounded-xl border bg-background shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
        {/* Mini preview */}
        <div className="relative overflow-hidden rounded-t-xl" style={{ height: "240px" }}>
          <div style={{ transform: "scale(0.27)", transformOrigin: "top left", width: "370%", pointerEvents: "none" }}>
            <WebsitePreview sections={sections} globalSettings={globalSettings} title={title} template={id} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
            <button
              onClick={(e) => openPreview(`web:${id}`, e)}
              className="flex translate-y-2 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-800 opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100"
            >
              <Eye className="h-3.5 w-3.5" />
              {t("templates.preview", "Aperçu")}
            </button>
          </div>
        </div>
        {/* Card info */}
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-foreground">{meta?.label || id}</span>
            {meta && <Badge variant="outline" className="text-[10px] shrink-0">{meta.motionLabel}</Badge>}
          </div>
          {meta && <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{meta.bestFor}</p>}
          <Link to="/signup" className="mt-auto inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90">
            {t("templates.use", "Utiliser")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  };

  // Determine what to show in the dialog
  const isWebPreview = previewId?.startsWith("web:");
  const previewTemplateId = isWebPreview ? previewId?.replace("web:", "") : previewId;
  const cvFixture = !isWebPreview && previewTemplateId ? getResumeFixture(previewTemplateId as ResumeTemplateId) : null;
  let webFixture: ReturnType<typeof getWebsiteFixture> | null = null;
  if (isWebPreview && previewTemplateId) {
    try { webFixture = getWebsiteFixture(previewTemplateId as WebsiteTemplateId); } catch { /* noop */ }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border bg-muted/50 p-1">
          <button
            onClick={() => setActiveTab("cv")}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${activeTab === "cv" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t("templates.tabCv", "CV")}
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{RESUME_TEMPLATE_IDS.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("website")}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${activeTab === "website" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t("templates.tabWebsite", "Sites Web")}
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{WEBSITE_TEMPLATE_IDS.length}</span>
          </button>
        </div>
      </div>

      {/* CV templates */}
      {activeTab === "cv" && (
        <div className="space-y-10">
          {RESUME_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">{group.label}</h3>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {group.ids.map(renderResumeCard)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Website templates */}
      {activeTab === "website" && (
        <div className="space-y-10">
          {WEBSITE_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">{group.label}</h3>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {group.ids.map(renderWebsiteCard)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {isWebPreview
                ? getWebsiteTemplateMeta(previewTemplateId || "")?.label || previewTemplateId
                : getResumeTemplateMeta(previewTemplateId || "")?.label || previewTemplateId}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto rounded-lg border bg-white">
            {!isWebPreview && cvFixture && (
              <div className="p-6">
                <ResumePreview data={cvFixture.data} customization={cvFixture.customization} template={previewTemplateId as ResumeTemplateId} />
              </div>
            )}
            {isWebPreview && webFixture && (
              <WebsitePreview
                sections={webFixture.sections}
                globalSettings={webFixture.globalSettings}
                title={webFixture.title}
                template={previewTemplateId || ""}
              />
            )}
          </div>
          <div className="flex justify-end">
            <Button asChild>
              <Link to="/signup">
                {t("templates.useThis", "Utiliser ce modèle")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateMiniPreview;
