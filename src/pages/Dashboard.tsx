import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, Globe, Plus, LogOut, Settings, User, Trash2, Edit, MoreHorizontal, Copy, ExternalLink, CheckCircle2, ArrowRight, Upload, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import FeedbackCard from "@/components/dashboard/FeedbackCard";
import ResumeImportDialog from "@/components/resume/ResumeImportDialog";
import { useTranslation } from "react-i18next";
import {
  buildOnboardingChecklist,
  getChecklistProgress,
  getPlanLabel,
  getRemainingAllowance,
  getResumeCompletionPercent,
  getUsageCards,
} from "@/lib/growth";
import { ensureGrowthProfile, loadGrowthState, trackProductEvent } from "@/lib/product-events";

const auth = supabase.auth as any;

function timeAgo(dateStr: string, t: (key: string, opts?: any) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("dashboard.justNow");
  if (mins < 60) return t("dashboard.minutesAgo", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("dashboard.hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("dashboard.daysAgo", { count: days });
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

const Dashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<any[]>([]);
  const [websites, setWebsites] = useState<any[]>([]);
  const [entitlement, setEntitlement] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange((_event: any, session: any) => {
      if (!session) navigate("/login");
      else {
        setUser(session.user);
        void ensureGrowthProfile(session.user.id);
        void loadData(session.user.id);
      }
      setLoading(false);
    });

    auth.getSession().then(({ data: { session } }: any) => {
      if (!session) navigate("/login");
      else {
        setUser(session.user);
        void ensureGrowthProfile(session.user.id);
        void loadData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async (userId: string) => {
    const [resumeRes, websiteRes, growthState] = await Promise.all([
      (supabase as any).from("resumes").select("id, title, template, current_step, is_complete, updated_at, data").order("updated_at", { ascending: false }),
      (supabase as any).from("websites").select("id, title, purpose, template, updated_at, is_published").order("updated_at", { ascending: false }),
      loadGrowthState(userId),
    ]);
    if (resumeRes.data) setResumes(resumeRes.data);
    if (websiteRes.data) setWebsites(websiteRes.data);
    setEntitlement(growthState.entitlement);
    setUsage(growthState.usage);
  };

  const handleLogout = async () => {
    await auth.signOut();
    toast({ title: t("dashboard.disconnected"), description: t("dashboard.seeYouSoon") });
    navigate("/");
  };

  const deleteResume = async (id: string) => {
    await (supabase as any).from("resumes").delete().eq("id", id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
    toast({ title: t("dashboard.cvDeleted") });
  };

  const duplicateResume = async (id: string) => {
    const { data: original } = await (supabase as any).from("resumes").select("*").eq("id", id).single();
    if (!original) return;
    const { id: _, created_at, updated_at, ...rest } = original;
    const { data: created } = await (supabase as any).from("resumes").insert({ ...rest, title: `${rest.title} (copie)` }).select().single();
    if (created) { setResumes((prev) => [created, ...prev]); toast({ title: t("dashboard.cvDuplicated") }); }
  };

  const startRename = (id: string, currentTitle: string) => {
    setEditingTitle(id);
    setEditValue(currentTitle);
    setTimeout(() => titleInputRef.current?.focus(), 50);
  };

  const saveRename = async (id: string) => {
    if (editValue.trim()) {
      await (supabase as any).from("resumes").update({ title: editValue.trim() }).eq("id", id);
      setResumes(prev => prev.map(r => r.id === id ? { ...r, title: editValue.trim() } : r));
    }
    setEditingTitle(null);
  };

  const deleteWebsite = async (id: string) => {
    await (supabase as any).from("websites").delete().eq("id", id);
    setWebsites((prev) => prev.filter((w) => w.id !== id));
    toast({ title: t("dashboard.siteDeleted") });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "utilisateur";
  const onboardingItems = buildOnboardingChecklist(resumes, websites);
  const onboardingProgress = getChecklistProgress(onboardingItems);
  const usageCards = getUsageCards(entitlement, usage);
  const planLabel = getPlanLabel(entitlement?.plan_key);
  const hasCompletedCv = resumes.some((r: any) => getResumeCompletionPercent(r) >= 80);
  const hasNoWebsite = websites.length === 0;

  const handleUpgradeClick = async () => {
    await trackProductEvent("upgrade_clicked", {
      userId: user?.id,
      data: { source: "dashboard-plan-card", currentPlan: entitlement?.plan_key || "free" },
    });
    window.location.href = "/#pricing";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Resume</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Compact stats in header */}
            <div className="hidden md:flex items-center gap-3 mr-2">
              <span className="text-xs text-muted-foreground">{resumes.length} {t("dashboard.cvCreated")}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{websites.length} {t("dashboard.publicProfiles")}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}><Settings className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-5 w-5" /></Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Welcome + Quick Actions Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("dashboard.hello", { name: displayName })}</h1>
          <p className="mt-1 text-muted-foreground">{t("dashboard.whatCreate")}</p>
        </div>

        {/* Quick actions - most prominent */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="group cursor-pointer border transition-all hover:shadow-md hover:border-primary/30" onClick={() => navigate("/resume/new")}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{t("dashboard.newCv")}</h3>
                <p className="text-xs text-muted-foreground">{t("dashboard.newCvDesc")}</p>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
          <Card className="group cursor-pointer border transition-all hover:shadow-md hover:border-primary/30 border-dashed" onClick={() => navigate("/resume/new?express=1")}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                <span className="text-xl">⚡</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{t("dashboard.expressCv")}</h3>
                <p className="text-xs text-muted-foreground">{t("dashboard.expressCvDesc")}</p>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors shrink-0" />
            </CardContent>
          </Card>
          <Card className="group cursor-pointer border transition-all hover:shadow-md hover:border-primary/30" onClick={() => setImportOpen(true)}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-secondary/80">
                <Upload className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{t("dashboard.importCv", "Importer un CV")}</h3>
                <p className="text-xs text-muted-foreground">{t("dashboard.importCvDesc", "PDF existant → extraction IA")}</p>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </CardContent>
          </Card>
          <Card className="group cursor-pointer border transition-all hover:shadow-md hover:border-accent/30" onClick={() => navigate("/website/new")}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover:bg-accent/20">
                <Globe className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{t("dashboard.newProfile")}</h3>
                <p className="text-xs text-muted-foreground">{t("dashboard.newProfileDesc")}</p>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* Post-CV nudge: after first complete CV, prompt to create website */}
        {hasCompletedCv && hasNoWebsite && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("dashboard.cvReady", "Votre CV est prêt !")}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.createProfileNudge", "Créez maintenant votre profil public pour partager votre candidature en un lien.")}</p>
                </div>
              </div>
              <Button size="sm" className="gap-1.5 shrink-0" onClick={() => navigate("/website/new")}>
                <Globe className="h-3.5 w-3.5" />
                {t("dashboard.newProfile")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Collapsible checklist + Plan card side by side */}
        <div className="mb-8 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          {/* Checklist - collapsed by default */}
          <Collapsible open={checklistOpen} onOpenChange={setChecklistOpen}>
            <Card className="border">
              <CardContent className="p-5">
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div>
                        <p className="text-sm font-medium text-foreground text-left">{t("dashboard.activationChecklist")}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <Progress value={onboardingProgress.percent} className="h-2 flex-1" />
                          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{onboardingProgress.percent}%</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${checklistOpen ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-4 space-y-2">
                    {onboardingItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${item.done ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>
                        </div>
                        <Button asChild variant={item.done ? "outline" : "default"} size="sm" className="shrink-0 gap-1 text-xs h-8">
                          <Link to={item.href}>
                            {item.cta}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>

          {/* Plan card */}
          <Card className="border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{t("dashboard.currentPlan")}</p>
                  <h2 className="mt-0.5 text-xl font-bold text-foreground">{planLabel}</h2>
                </div>
                <Badge variant={entitlement?.plan_key === "free" ? "secondary" : "default"}>
                  {entitlement?.plan_key === "free" ? t("dashboard.starter") : t("dashboard.active")}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                {usageCards.map((card) => (
                  <div key={card.key} className="flex items-center justify-between rounded-lg border p-3">
                    <p className="text-sm text-foreground">{card.title}</p>
                    <span className="text-sm font-semibold text-foreground">
                      {card.used}/{card.limit}
                    </span>
                  </div>
                ))}
              </div>

              <Button className="mt-4 w-full" size="sm" onClick={handleUpgradeClick}>
                {t("dashboard.viewUpgrade")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resume list */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-foreground">{t("dashboard.yourCvs")}</h2>
          {resumes.length === 0 ? (
            <Card className="border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{t("dashboard.noCvYet", "Pas encore de CV")}</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {t("dashboard.noCvDesc", "Créez votre premier CV professionnel en quelques minutes avec l'aide de l'IA.")}
                </p>
                <div className="mt-5 flex gap-3">
                  <Button className="gap-2" onClick={() => navigate("/resume/new")}>
                    <Plus className="h-4 w-4" /> {t("dashboard.createFirstCv")}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
                    <Upload className="h-4 w-4" /> {t("dashboard.importCv")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => {
                const pct = getResumeCompletionPercent(resume);
                const isComplete = pct >= 80;
                const circumference = 2 * Math.PI * 18;
                const strokeDashoffset = circumference - (pct / 100) * circumference;
                return (
                  <Card key={resume.id} className="border group hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Progress Ring */}
                          <div className="relative h-11 w-11 shrink-0">
                            <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90">
                              <circle cx="20" cy="20" r="18" fill="none" strokeWidth="3" className="stroke-muted" />
                              <circle
                                cx="20" cy="20" r="18" fill="none" strokeWidth="3"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className={isComplete ? "stroke-primary" : "stroke-accent"}
                              />
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${isComplete ? "text-primary" : "text-accent"}`}>
                              {pct}%
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingTitle === resume.id ? (
                              <Input
                                ref={titleInputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => saveRename(resume.id)}
                                onKeyDown={(e) => { if (e.key === "Enter") saveRename(resume.id); if (e.key === "Escape") setEditingTitle(null); }}
                                className="h-7 text-sm font-semibold px-1"
                              />
                            ) : (
                              <h3
                                className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer truncate"
                                onClick={() => navigate(`/resume/edit?id=${resume.id}`)}
                                onDoubleClick={() => startRename(resume.id, resume.title)}
                                title={t("dashboard.doubleClickRename")}
                              >
                                {resume.title}
                              </h3>
                            )}
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{t("dashboard.model")}: {resume.template}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(resume.updated_at, t)}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/resume/edit?id=${resume.id}`)}><Edit className="h-4 w-4 mr-2" /> {isComplete ? t("dashboard.edit") : t("dashboard.continueEditing", "Continuer")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => startRename(resume.id, resume.title)}><Edit className="h-4 w-4 mr-2" /> {t("dashboard.rename")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateResume(resume.id)}><Copy className="h-4 w-4 mr-2" /> {t("dashboard.duplicate")}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteResume(resume.id)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" /> {t("dashboard.delete")}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Website list */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-foreground">{t("dashboard.yourSites")}</h2>
          {websites.length === 0 ? (
            <Card className="border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-4">
                  <Globe className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{t("dashboard.noSiteYet", "Pas encore de profil public")}</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {t("dashboard.noSiteDesc", "Créez un profil public pour partager votre candidature en un seul lien. L'IA génère le contenu à partir de votre CV.")}
                </p>
                <Button className="mt-5 gap-2" onClick={() => navigate("/website/new")}>
                  <Globe className="h-4 w-4" /> {t("dashboard.newProfile")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {websites.map((site) => {
                const siteUrl = `/site/${site.slug || site.id}`;
                return (
                  <Card key={site.id} className="border group hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/website/edit?id=${site.id}`)}>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-accent shrink-0" />
                            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">{site.title}</h3>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                            <Badge variant={site.is_published ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                              {site.is_published ? t("dashboard.published") : t("dashboard.draft")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{site.purpose === "portfolio" ? "Portfolio Pro" : "Profil Pro"}</span>
                          </div>
                          {site.is_published && (
                            <p className="mt-1 text-[11px] text-primary truncate">{window.location.origin}{siteUrl}</p>
                          )}
                          <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(site.updated_at, t)}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/website/edit?id=${site.id}`)}><Edit className="h-4 w-4 mr-2" /> {t("dashboard.edit")}</DropdownMenuItem>
                            {site.is_published && (
                              <>
                                <DropdownMenuItem onClick={() => window.open(siteUrl, "_blank")}><ExternalLink className="h-4 w-4 mr-2" /> {t("dashboard.visitSite")}</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}${siteUrl}`);
                                  toast({ title: t("dashboard.linkCopied") });
                                }}><Copy className="h-4 w-4 mr-2" /> {t("dashboard.copyLink")}</DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => deleteWebsite(site.id)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" /> {t("dashboard.delete")}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {user?.id && (
          <div className="mt-8">
            <FeedbackCard userId={user.id} />
          </div>
        )}
      </main>

      <ResumeImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportSuccess={(resumeData) => {
          sessionStorage.setItem("importedResumeData", JSON.stringify(resumeData));
          navigate("/resume/new?imported=1");
        }}
      />
    </div>
  );
};

export default Dashboard;
