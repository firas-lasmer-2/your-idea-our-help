import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Save, Sparkles, Loader2, FileText, Target, CheckCircle, AlertCircle, ChevronDown, MessageCircle, Globe, Linkedin, ArrowRight, Star } from "lucide-react";
import ShareDialog from "@/components/ShareDialog";
import { ResumeData, ResumeCustomization } from "@/types/resume";
import ResumePreview from "@/components/resume/ResumePreview";
import ATSScoreGauge from "@/components/resume/ATSScoreGauge";
import CoverLetterGenerator from "@/components/resume/CoverLetterGenerator";
import { useResumeAi } from "@/hooks/use-resume-ai";
import { fireConfetti } from "@/hooks/use-confetti";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { getGrowthState, getRemainingAllowance } from "@/lib/growth";
import { incrementUsageCounter, loadGrowthState, trackProductEvent } from "@/lib/product-events";

interface MatchResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

interface Props {
  data: ResumeData;
  customization: ResumeCustomization;
  template: string;
  saving: boolean;
  completionPercent: number;
  exportBlockers: string[];
  onSave: () => void;
  onUpdateData: (updates: Partial<ResumeData>) => void;
}

const StepPreview = ({ data, customization, template, saving, completionPercent, exportBlockers, onSave, onUpdateData }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("id");
  const { generateSummary } = useResumeAi();
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsSent, setNpsSent] = useState(false);
  const celebratedRef = useRef(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Job matching state
  const [matchOpen, setMatchOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!celebratedRef.current) {
      celebratedRef.current = true;
      fireConfetti();
    }
  }, []);

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    const summary = await generateSummary(data);
    if (summary) {
      onUpdateData({ summary });
    }
    setGeneratingSummary(false);
  };

  const handleDownloadPDF = async () => {
    if (exportBlockers.length > 0) {
      toast({
        title: t("preview.exportBlocked", "Export bloqué"),
        description: t("preview.completeFirst", "Complétez les éléments manquants avant de télécharger votre CV."),
        variant: "destructive",
      });
      return;
    }
    if (!resumeRef.current) return;
    setDownloading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (session?.user?.id) {
        const growthState = await loadGrowthState(session.user.id);
        const { entitlement, usage } = getGrowthState(growthState.entitlement, growthState.usage);
        if (usage.pdf_downloads_count >= entitlement.pdf_monthly_limit) {
          await trackProductEvent("upgrade_clicked", {
            userId: session.user.id,
            data: {
              source: "resume-download-limit",
              remaining: getRemainingAllowance(usage.pdf_downloads_count, entitlement.pdf_monthly_limit),
            },
          });
          toast({
            title: t("preview.limitReached", "Limite atteinte"),
            description: t("preview.limitDesc", "Vous avez atteint votre quota PDF actuel. Passez au plan supérieur pour continuer."),
            variant: "destructive",
          });
          setDownloading(false);
          return;
        }
      }

      const html2pdf = (await import("html2pdf.js")).default;
      const firstName = data.personalInfo.firstName || "CV";
      const lastName = data.personalInfo.lastName || "";
      const filename = `CV_${firstName}${lastName ? "_" + lastName : ""}.pdf`;

      await html2pdf()
        .set({
          margin: [0, 0, 0, 0],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(resumeRef.current)
        .save();
      await incrementUsageCounter("pdf_downloads_count");
      await trackProductEvent("resume_downloaded", {
        data: { template, hasSummary: Boolean(data.summary) },
      });
      setDownloaded(true);
    } catch (e) {
      console.error("PDF download error:", e);
      toast({ title: t("common.error"), description: t("preview.pdfError", "Le PDF n'a pas pu être généré."), variant: "destructive" });
    }
    setDownloading(false);
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({ title: t("common.error"), description: t("preview.pasteJob", "Veuillez coller une description de poste."), variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("resume-ai", {
        body: {
          action: "match-job",
          data: { jobDescription, resumeData: data },
        },
      });

      if (error || result?.error) {
        toast({ title: t("common.error"), description: result?.error || t("preview.analysisError", "Erreur d'analyse."), variant: "destructive" });
        return;
      }

      try {
        const parsed = typeof result.result === "string" ? JSON.parse(result.result) : result.result;
        setMatchResult(parsed);
      } catch {
        toast({ title: t("common.error"), description: t("preview.invalidAi", "Réponse IA invalide."), variant: "destructive" });
      }
    } catch {
      toast({ title: t("common.error"), description: t("preview.connectionError", "Erreur de connexion."), variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const addSkillFromSuggestion = (skill: string) => {
    const techCategory = data.skillCategories.find(c => c.id === "tech");
    if (techCategory && !techCategory.skills.includes(skill)) {
      const updatedCategories = data.skillCategories.map(c =>
        c.id === "tech" ? { ...c, skills: [...c.skills, skill] } : c
      );
      onUpdateData({ skillCategories: updatedCategories });
      toast({ title: t("preview.skillAdded", "Compétence ajoutée"), description: `"${skill}" ${t("preview.skillAddedDesc", "a été ajouté à vos compétences techniques.")}` });
    }
  };

  const shareUrl = window.location.origin;
  const userName = [data.personalInfo.firstName, data.personalInfo.lastName].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("preview.title", "Aperçu de votre CV")}</h2>
          <p className="mt-1 text-muted-foreground">
            {t("preview.subtitle", "Vérifiez votre CV avant de le télécharger.")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? t("resume.saving") : t("common.save")}
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-primary border-primary/20 hover:bg-primary/5 hover:text-primary"
            onClick={() => {
              const text = encodeURIComponent(
                userName
                  ? `${t("preview.whatsappMsg", "Découvrez mon CV créé avec Resume Builder !")} — ${userName} 📄\n${shareUrl}`
                  : `${t("preview.whatsappMsg", "Découvrez mon CV créé avec Resume Builder !")} 📄\n${shareUrl}`
              );
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button className="gap-2" onClick={handleDownloadPDF} disabled={downloading || exportBlockers.length > 0}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? t("preview.generating", "Génération...") : exportBlockers.length > 0 ? t("preview.completeBeforeExport", "Compléter avant export") : t("preview.downloadPdf", "Télécharger PDF")}
          </Button>
        </div>
      </div>

      {exportBlockers.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{t("preview.finalize", "Finalisez votre CV avant export")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("preview.currentProgress", "Progression actuelle")} : {completionPercent}%
                </p>
              </div>
              <Badge variant="destructive">
                {exportBlockers.length} {t("preview.blockers", "blocage(s)")}
              </Badge>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {exportBlockers.map((blocker) => (
                <li key={blocker} className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>{blocker}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* ATS Score - compact */}
      <ATSScoreGauge data={data} autoAnalyze={exportBlockers.length === 0} />


      {/* Post-download: What's next? */}
      {downloaded && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-primary/20 bg-primary/5 p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{t("preview.congrats", "Bravo ! Votre CV est prêt 🎉")}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{t("preview.whatsNext", "Et maintenant ?")}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <Button variant="outline" className="gap-2 justify-start h-auto py-3" onClick={() => {
                  navigate(resumeId ? `/website/new?fromResume=${resumeId}` : "/website/new");
                }}>
                  <Globe className="h-4 w-4 text-accent shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-medium">{t("preview.createProfile", "Créer un profil public")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("preview.createProfileDesc", "Partagez votre candidature en un lien")}</p>
                  </div>
                </Button>
                <Button variant="outline" className="gap-2 justify-start h-auto py-3" onClick={() => setMatchOpen(true)}>
                  <Target className="h-4 w-4 text-primary shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-medium">{t("preview.matchJob", "Matcher avec une offre")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("preview.matchJobDesc", "Comparez avec une description de poste")}</p>
                  </div>
                </Button>
                <Button variant="outline" className="gap-2 justify-start h-auto py-3" onClick={() => setShowShareDialog(true)}>
                  <MessageCircle className="h-4 w-4 text-primary shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-medium">{t("preview.shareCv", "Partager mon CV")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("preview.shareCvDesc", "WhatsApp, LinkedIn, QR code")}</p>
                  </div>
                </Button>
              </div>
            </div>
          </Card>

          {/* NPS quick rating */}
          {!npsSent && (
            <Card className="border p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{t("preview.npsQuestion", "Comment évaluez-vous votre expérience ?")}</p>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      variant={npsScore === value ? "default" : "outline"}
                      size="sm"
                      className="h-9 w-9 px-0"
                      onClick={async () => {
                        setNpsScore(value);
                        setNpsSent(true);
                        await trackProductEvent("nps_after_download", {
                          data: { score: value, template },
                        });
                        toast({ title: t("preview.thanksFeedback", "Merci pour votre retour !") });
                      }}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">{t("preview.npsHint", "1 = pas satisfait, 5 = très satisfait")}</p>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        url={shareUrl}
        title={t("preview.shareCvTitle", "Partagez votre CV")}
        description={t("preview.shareCvDescription", "Envoyez votre CV par WhatsApp, LinkedIn ou QR code.")}
        shareMessage={t("preview.whatsappMsg", "Découvrez mon CV créé avec Resume Builder !")}
      />

      {/* Job Matching — Optional Collapsible */}
      <Collapsible open={matchOpen} onOpenChange={setMatchOpen}>
        <Card className="border-2 border-dashed border-primary/20 bg-primary/[0.02]">
          <CollapsibleTrigger asChild>
            <button className="w-full p-5 flex items-center gap-3 text-left hover:bg-primary/[0.03] transition-colors rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{t("preview.jobMatching", "Matching offre d'emploi")}</h3>
                <p className="text-xs text-muted-foreground">{t("preview.jobMatchingDesc", "Optionnel — Collez une offre pour voir votre score de correspondance")}</p>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${matchOpen ? "rotate-180" : ""}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">{t("preview.jobDescLabel", "Description du poste")}</Label>
                <Textarea
                  placeholder={t("preview.jobDescPlaceholder", "Collez ici la description de l'offre d'emploi...")}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  className="resize-none text-sm"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !jobDescription.trim()}
                className="gap-2"
                size="sm"
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {analyzing ? t("preview.analyzing", "Analyse en cours...") : t("preview.analyzeMatch", "Analyser la correspondance")}
              </Button>

              <AnimatePresence>
                {matchResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 pt-2"
                  >
                    <div className="flex items-center gap-4 rounded-lg bg-card p-4 border">
                      <div className="relative h-16 w-16 shrink-0">
                        <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="2.5" className="stroke-muted" />
                          <circle
                            cx="18" cy="18" r="15.5" fill="none" strokeWidth="2.5"
                            strokeDasharray="97.4"
                            strokeDashoffset={97.4 - (matchResult.matchScore / 100) * 97.4}
                            strokeLinecap="round"
                            className={matchResult.matchScore >= 70 ? "stroke-primary" : matchResult.matchScore >= 40 ? "stroke-accent" : "stroke-destructive"}
                          />
                        </svg>
                        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                          matchResult.matchScore >= 70 ? "text-primary" : matchResult.matchScore >= 40 ? "text-accent" : "text-destructive"
                        }`}>
                          {matchResult.matchScore}%
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t("preview.matchScore", "Score de correspondance")}</p>
                        <p className="text-xs text-muted-foreground">
                          {matchResult.matchScore >= 70
                            ? t("preview.excellentMatch", "Excellent match ! Votre profil correspond bien.")
                            : matchResult.matchScore >= 40
                              ? t("preview.correctMatch", "Match correct. Ajoutez les compétences manquantes.")
                              : t("preview.weakMatch", "Match faible. Considérez enrichir votre profil.")}
                        </p>
                      </div>
                    </div>

                    {matchResult.matchedKeywords.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-medium text-foreground">{t("preview.foundKeywords", "Mots-clés trouvés")} ({matchResult.matchedKeywords.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.matchedKeywords.map((kw) => (
                            <Badge key={kw} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {matchResult.missingKeywords.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-accent" />
                          <span className="text-sm font-medium text-foreground">{t("preview.missingKeywords", "Mots-clés manquants")} ({matchResult.missingKeywords.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.missingKeywords.map((kw) => (
                            <Badge
                              key={kw}
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                              onClick={() => addSkillFromSuggestion(kw)}
                            >
                              + {kw}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          💡 {t("preview.clickToAdd", "Cliquez sur un mot-clé pour l'ajouter à vos compétences techniques.")}
                        </p>
                      </div>
                    )}

                    {matchResult.suggestions.length > 0 && (
                      <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                        <p className="text-xs font-medium text-foreground">{t("preview.recommendations", "Recommandations")} :</p>
                        {matchResult.suggestions.map((s, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span>→</span> {s}
                          </p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Tabs: CV Preview + Cover Letter */}
      <Tabs defaultValue="cv" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cv" className="gap-2"><FileText className="h-4 w-4" /> {t("preview.cvTab", "Aperçu CV")}</TabsTrigger>
          <TabsTrigger value="cover" className="gap-2"><Sparkles className="h-4 w-4" /> {t("preview.coverTab", "Lettre de motivation")}</TabsTrigger>
        </TabsList>
        <TabsContent value="cv">
          <Card className="border overflow-hidden">
            <div ref={resumeRef} className="mx-auto max-w-[800px] bg-white p-8">
              <ResumePreview data={data} customization={customization} template={template} />
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="cover">
          <CoverLetterGenerator data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StepPreview;
