import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ArrowLeft, Loader2, Share2, ExternalLink, GlobeLock, Link2, CheckCircle2, AlertTriangle, ListChecks, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useWebsite } from "@/hooks/use-website";
import WebsiteWizard from "@/components/website/WebsiteWizard";
import WebsiteEditor from "@/components/website/WebsiteEditor";
import WebsiteOnboarding from "@/components/website/WebsiteOnboarding";
import PublishSuccessDialog from "@/components/website/PublishSuccessDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { getWebsitePublishReadiness } from "@/lib/website-readiness";
import type { WebsiteCandidateProfile, WebsiteGlobalSettings, WebsiteSection, WebsiteMode } from "@/types/website";

const auth = supabase.auth as any;

const WebsiteBuilder = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const websiteId = searchParams.get("id") || undefined;
  const fromResumeId = searchParams.get("fromResume") || null;
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const [wizardDone, setWizardDone] = useState(!!websiteId);
  const [resumes, setResumes] = useState<{ id: string; title: string }[]>([]);
  const [slugInput, setSlugInput] = useState("");
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const { toast } = useToast();

  const {
    data, setFullData, updateSection, updateSectionStyle, toggleSection, reorderSection, reorderSections,
    addSection, duplicateSection, removeSection,
    globalSettings, updateGlobalSettings,
    title, setTitle, purpose, setPurpose,
    template, setTemplate,
    slug, setSlug,
    saving, saveError, lastSavedAt, loading, save, load,
    isPublished, publish, unpublish, id,
    canUndo, canRedo, undo, redo,
  } = useWebsite();

  useEffect(() => {
    auth.getSession().then(async ({ data: { session } }: any) => {
      if (!session) { navigate("/login"); return; }
      setAuthLoading(false);

      const { data: r } = await (supabase as any)
        .from("resumes").select("id, title").order("updated_at", { ascending: false });
      if (r) setResumes(r);

      if (websiteId) {
        await load(websiteId);
        setWizardDone(true);
      }
    });
  }, [navigate, websiteId, load]);

  useEffect(() => {
    if (slug) setSlugInput(slug);
  }, [slug]);

  const publishReadiness = getWebsitePublishReadiness({
    title,
    slug,
    data,
    globalSettings,
  });

  if (authLoading || (websiteId && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleWizardComplete = (result: {
    purpose: WebsiteMode;
    template: string;
    title: string;
    sections: WebsiteSection[];
    globalSettings?: WebsiteGlobalSettings;
    profile: WebsiteCandidateProfile;
  }) => {
    setPurpose(result.purpose);
    setTemplate(result.template);
    setTitle(result.title);
    setFullData({ sections: result.sections, profile: result.profile });
    if (result.globalSettings) {
      updateGlobalSettings(result.globalSettings);
    }
    setWizardDone(true);
    save({
      data: { sections: result.sections, profile: result.profile },
      globalSettings: result.globalSettings || globalSettings,
      purpose: result.purpose,
      template: result.template,
      title: result.title,
    });
  };

  const handleSlugSave = async () => {
    const clean = slugInput.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-");
    if (clean.length < 2) {
      toast({ title: t("website.slugTooShort", "Slug trop court"), description: t("website.minChars", "Minimum 2 caractères."), variant: "destructive" });
      return;
    }
    const success = await setSlug(clean);
    if (!success) {
      toast({ title: t("common.error"), description: t("website.slugTaken", "Cette URL est déjà prise ou n'a pas pu être enregistrée."), variant: "destructive" });
      return;
    }
    setSlugInput(clean);
    toast({ title: t("website.slugSaved", "URL personnalisée enregistrée !") });
  };

  const siteUrl = id
    ? slug
      ? `${window.location.origin}/site/${slug}`
      : `${window.location.origin}/site/${id}`
    : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
                <Globe className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-bold text-foreground">{wizardDone ? title : t("website.newSite", "Nouveau site")}</span>
            </Link>
          </div>
          {wizardDone && (
            <div className="flex items-center gap-2">
              {saving ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> {t("website.saving", "Sauvegarde...")}
                </span>
              ) : saveError ? (
                <span className="text-xs text-destructive">{t("website.saveError", "Erreur de sauvegarde")}</span>
              ) : lastSavedAt ? (
                <span className="text-xs text-muted-foreground">
                  {t("website.savedAt", "Sauvegarde")} {new Date(lastSavedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">{t("website.readyToSave", "Prêt à sauvegarder")}</span>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ListChecks className="h-3 w-3" />
                    {t("website.checklist", "Checklist")}
                    {publishReadiness.blockers.length > 0 && (
                      <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">
                        {publishReadiness.blockers.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t("website.publishChecklist", "Checklist de publication")}</p>
                      <p className="text-xs text-muted-foreground">
                        {publishReadiness.ready
                          ? t("website.readyToPublish", "Le site est prêt à être publié.")
                          : t("website.fixBeforePublish", "Corrigez les éléments bloquants avant publication.")}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("website.blockages", "Blocages")}</p>
                      {publishReadiness.blockers.length === 0 ? (
                        <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-sm text-primary">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{t("website.noBlockers", "Aucun blocage détecté.")}</span>
                        </div>
                      ) : (
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {publishReadiness.blockers.map((blocker) => (
                            <li key={blocker} className="flex items-start gap-2">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                              <span>{blocker}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {publishReadiness.warnings.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("website.improvements", "Améliorations conseillées")}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {publishReadiness.warnings.map((warning) => (
                            <li key={warning} className="flex items-start gap-2">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Custom slug popover */}
              {id && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Link2 className="h-3 w-3" /> URL
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">{t("website.customUrl", "URL personnalisée")}</p>
                      <div className="flex gap-2">
                        <span className="text-xs text-muted-foreground self-center whitespace-nowrap">/site/</span>
                        <Input
                          value={slugInput}
                          onChange={(e) => setSlugInput(e.target.value)}
                          placeholder="mon-site"
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button size="sm" onClick={handleSlugSave} className="w-full">
                        {t("website.saveSlug", "Enregistrer")}
                      </Button>
                      {siteUrl && (
                        <p className="text-[11px] text-muted-foreground break-all">{siteUrl}</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {isPublished && siteUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => window.open(siteUrl, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" /> {t("website.viewSite", "Voir le site")}
                </Button>
              )}
              <Button
                data-tour="publish"
                variant={isPublished ? "outline" : "default"}
                size="sm"
                className="gap-1.5"
                onClick={async () => {
                  if (isPublished) {
                    await unpublish();
                  } else {
                    await publish();
                    setShowPublishSuccess(true);
                  }
                }}
                disabled={saving || (!isPublished && !publishReadiness.ready)}
              >
                {isPublished ? (
                  <>
                    <GlobeLock className="h-3.5 w-3.5" /> {t("website.unpublish", "Dépublier")}
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" /> {publishReadiness.ready ? t("website.publish", "Publier") : t("website.completeBeforePublish", "Compléter avant publication")}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </header>

      {!wizardDone ? (
        <main className="container py-8">
          {resumes.length === 0 && (
            <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("website.noResumeTip", "Astuce : créez d'abord un CV")}</p>
                    <p className="text-xs text-muted-foreground">{t("website.noResumeDesc", "L'IA remplira automatiquement votre profil à partir de votre CV.")}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => navigate("/resume/new")}>
                  <FileText className="h-3.5 w-3.5" /> {t("website.createCvFirst", "Créer un CV")}
                </Button>
              </div>
            </div>
          )}
          <WebsiteWizard onComplete={handleWizardComplete} resumes={resumes} preselectedResumeId={fromResumeId || undefined} />
        </main>
      ) : (
        <main className="space-y-4">
          {!publishReadiness.ready && (
            <div className="container">
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                <p className="text-sm font-semibold text-foreground">{t("website.publishBlocked", "Publication bloquée tant que les éléments essentiels ne sont pas prêts")}</p>
                <p className="text-xs text-muted-foreground">
                  {publishReadiness.enabledSectionCount} section{publishReadiness.enabledSectionCount > 1 ? "s" : ""} {t("website.active", "active")}{publishReadiness.enabledSectionCount > 1 ? "s" : ""}
                  {" "}{t("website.and", "et")} {publishReadiness.blockers.length} {t("website.blockageDetected", "blocage")}{publishReadiness.blockers.length > 1 ? "s" : ""} {t("website.detected", "détecté")}{publishReadiness.blockers.length > 1 ? "s" : ""}.
                </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {t("website.checklistRequired", "Checklist requise")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <WebsiteEditor
            sections={data.sections}
            purpose={purpose}
            profile={data.profile}
            globalSettings={globalSettings}
            title={title}
            template={template}
            onUpdateSection={updateSection}
            onUpdateSectionStyle={updateSectionStyle}
            onToggleSection={toggleSection}
            onUpdateGlobalSettings={updateGlobalSettings}
            onReorderSection={reorderSection}
            onReorderSections={reorderSections}
            onAddSection={addSection}
            onDuplicateSection={duplicateSection}
            onRemoveSection={removeSection}
            saving={saving}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />
        </main>
      )}

      <PublishSuccessDialog
        open={showPublishSuccess}
        onOpenChange={setShowPublishSuccess}
        siteUrl={siteUrl}
        title={title}
      />
    </div>
  );
};

export default WebsiteBuilder;
