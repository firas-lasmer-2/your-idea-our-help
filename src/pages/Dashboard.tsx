import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Globe, Plus, LogOut, Settings, User, Trash2, Edit, MoreHorizontal, Copy, ExternalLink, CheckCircle2, ArrowRight, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import FeedbackCard from "@/components/dashboard/FeedbackCard";
import ResumeImportDialog from "@/components/resume/ResumeImportDialog";
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<any[]>([]);
  const [websites, setWebsites] = useState<any[]>([]);
  const [entitlement, setEntitlement] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [importOpen, setImportOpen] = useState(false);
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
    toast({ title: "Déconnecté", description: "À bientôt ! 👋" });
    navigate("/");
  };

  const deleteResume = async (id: string) => {
    await (supabase as any).from("resumes").delete().eq("id", id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "CV supprimé" });
  };

  const duplicateResume = async (id: string) => {
    const { data: original } = await (supabase as any).from("resumes").select("*").eq("id", id).single();
    if (!original) return;
    const { id: _, created_at, updated_at, ...rest } = original;
    const { data: created } = await (supabase as any).from("resumes").insert({ ...rest, title: `${rest.title} (copie)` }).select().single();
    if (created) { setResumes((prev) => [created, ...prev]); toast({ title: "CV dupliqué" }); }
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
    toast({ title: "Site supprimé" });
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
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}><Settings className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-5 w-5" /></Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Bonjour, {displayName} ! 👋</h1>
          <p className="mt-1 text-muted-foreground">Que souhaitez-vous créer aujourd'hui ?</p>
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Checklist d'activation</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Avancez jusqu'au premier CV terminé et au premier site publié.
                  </p>
                </div>
                <Badge variant="secondary">
                  {onboardingProgress.completed}/{onboardingProgress.total}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progression</span>
                  <span>{onboardingProgress.percent}%</span>
                </div>
                <Progress value={onboardingProgress.percent} />
              </div>

              <div className="mt-6 space-y-3">
                {onboardingItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${item.done ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="font-medium text-foreground">{item.title}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Button asChild variant={item.done ? "outline" : "default"} size="sm" className="shrink-0 gap-1.5">
                      <Link to={item.href}>
                        {item.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Plan actuel</p>
                  <h2 className="mt-1 text-2xl font-bold text-foreground">{planLabel}</h2>
                </div>
                <Badge variant={entitlement?.plan_key === "free" ? "secondary" : "default"}>
                  {entitlement?.plan_key === "free" ? "Starter" : "Actif"}
                </Badge>
              </div>

              <div className="mt-5 space-y-3">
                {usageCards.map((card) => (
                  <div key={card.key} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{card.title}</p>
                      <span className="text-sm font-semibold text-foreground">
                        {card.used}/{card.limit}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Restant: {getRemainingAllowance(card.used, card.limit)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {entitlement?.custom_domain_enabled
                  ? "Le domaine personnalisé est activé sur votre plan."
                  : "Passez au plan supérieur pour débloquer plus de téléchargements, plus de sites et le domaine personnalisé."}
              </div>

              <Button className="mt-5 w-full" onClick={handleUpgradeClick}>
                Voir les options de mise a niveau
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="group cursor-pointer border transition-all hover:shadow-md hover:border-primary/30" onClick={() => navigate("/resume/new")}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Nouveau CV</h3>
                <p className="text-sm text-muted-foreground">Créez un CV avec l'aide de l'IA</p>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
          <Card className="group cursor-pointer border transition-all hover:shadow-md hover:border-primary/30 border-dashed" onClick={() => navigate("/resume/new?express=1")}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">CV Express</h3>
                <p className="text-sm text-muted-foreground">CV prêt en 2 minutes par l'IA</p>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
            </CardContent>
          </Card>
          <Card className="group cursor-pointer border transition-all hover:shadow-md hover:border-primary/30" onClick={() => setImportOpen(true)}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-secondary/80">
                <Upload className="h-7 w-7 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Importer un CV</h3>
                <p className="text-sm text-muted-foreground">PDF existant → extraction IA</p>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </CardContent>
          </Card>
          <Card className="group cursor-pointer border transition-all hover:shadow-md hover:border-accent/30" onClick={() => navigate("/website/new")}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover:bg-accent/20">
                <Globe className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Nouveau profil public</h3>
                <p className="text-sm text-muted-foreground">Profil pro ou portfolio généré par l'IA</p>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card className="border">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">CV créés</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{resumes.length}</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Profils publics</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{websites.length}</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Téléchargements</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{usage?.pdf_downloads_count || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Resume list */}
        {resumes.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-foreground">Vos CV</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => {
                const pct = getResumeCompletionPercent(resume);
                return (
                  <Card key={resume.id} className="border group hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
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
                              title="Double-cliquez pour renommer"
                            >
                              {resume.title}
                            </h3>
                          )}
                          <div className="mt-1.5 flex items-center gap-2">
                            <Badge variant={pct >= 80 ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                              {pct}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">Modèle: {resume.template}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(resume.updated_at)}</p>
                          {/* Mini progress bar */}
                          <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/resume/edit?id=${resume.id}`)}><Edit className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => startRename(resume.id, resume.title)}><Edit className="h-4 w-4 mr-2" /> Renommer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateResume(resume.id)}><Copy className="h-4 w-4 mr-2" /> Dupliquer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteResume(resume.id)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Website list */}
        {websites.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-foreground">Vos profils publics</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {websites.map((site) => (
                <Card key={site.id} className="border group hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => navigate(`/website/edit?id=${site.id}`)}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-accent" />
                          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">{site.title}</h3>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">Type: {site.purpose === "portfolio" ? "Portfolio Pro" : "Profil Pro"}</p>
                          {site.is_published && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">Publié</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(site.updated_at)}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/website/edit?id=${site.id}`)}><Edit className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                          {site.is_published && (
                            <DropdownMenuItem onClick={() => window.open(`/site/${site.id}`, "_blank")}><ExternalLink className="h-4 w-4 mr-2" /> Voir le site</DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => deleteWebsite(site.id)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {resumes.length === 0 && websites.length === 0 && (
          <Card className="border border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-foreground">Bienvenue sur Resume !</h3>
              <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
                Vous n'avez pas encore de CV ni de profil public. 
                Commencez par en créer un — notre IA vous accompagne à chaque étape pour un résultat professionnel en quelques minutes ! ✨
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="gap-2" size="lg" onClick={() => navigate("/resume/new")}>
                  <Plus className="h-4 w-4" /> Créer mon premier CV
                </Button>
                <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate("/website/new")}>
                  <Globe className="h-4 w-4" /> Créer un profil public
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {user?.id && (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <Card className="border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-foreground">Prochaine action recommandée</p>
                <h2 className="mt-2 text-xl font-bold text-foreground">
                  {onboardingProgress.nextItem?.title || "Vous avez atteint le premier niveau d'activation"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {onboardingProgress.nextItem?.description || "Continuez a iterer sur vos CV et sites pour augmenter vos chances de conversion."}
                </p>
                {onboardingProgress.nextItem && (
                  <Button asChild className="mt-4 gap-2">
                    <Link to={onboardingProgress.nextItem.href}>
                      {onboardingProgress.nextItem.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
            <FeedbackCard userId={user.id} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
