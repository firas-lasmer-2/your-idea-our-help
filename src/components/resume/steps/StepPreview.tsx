import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Save, Sparkles, Loader2, FileText, Target, CheckCircle, AlertCircle, ChevronDown, MessageCircle } from "lucide-react";
import { ResumeData, ResumeCustomization } from "@/types/resume";
import ResumePreview from "@/components/resume/ResumePreview";
import ATSScoreGauge from "@/components/resume/ATSScoreGauge";
import CoverLetterGenerator from "@/components/resume/CoverLetterGenerator";
import { useResumeAi } from "@/hooks/use-resume-ai";
import { fireConfetti } from "@/hooks/use-confetti";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const { generateSummary } = useResumeAi();
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [downloading, setDownloading] = useState(false);
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
        title: "Export bloqué",
        description: "Complétez les éléments manquants avant de télécharger votre CV.",
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
            title: "Limite atteinte",
            description: "Vous avez atteint votre quota PDF actuel. Passez au plan superieur pour continuer.",
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
        data: {
          template,
          hasSummary: Boolean(data.summary),
        },
      });
    } catch (e) {
      console.error("PDF download error:", e);
      toast({ title: "Erreur", description: "Le PDF n'a pas pu etre genere.", variant: "destructive" });
    }
    setDownloading(false);
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({ title: "Erreur", description: "Veuillez coller une description de poste.", variant: "destructive" });
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
        toast({ title: "Erreur", description: result?.error || "Erreur d'analyse.", variant: "destructive" });
        return;
      }

      try {
        const parsed = typeof result.result === "string" ? JSON.parse(result.result) : result.result;
        setMatchResult(parsed);
      } catch {
        toast({ title: "Erreur", description: "Réponse IA invalide.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur de connexion.", variant: "destructive" });
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
      toast({ title: "Compétence ajoutée", description: `"${skill}" a été ajouté à vos compétences techniques.` });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Aperçu de votre CV</h2>
          <p className="mt-1 text-muted-foreground">
            Vérifiez votre CV avant de le télécharger.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={() => {
              const text = encodeURIComponent(`Découvrez mon CV créé avec Resume Builder ! 📄`);
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button className="gap-2" onClick={handleDownloadPDF} disabled={downloading || exportBlockers.length > 0}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Génération..." : exportBlockers.length > 0 ? "Compléter avant export" : "Télécharger PDF"}
          </Button>
        </div>
      </div>

      {exportBlockers.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">Finalisez votre CV avant export</p>
                <p className="text-sm text-muted-foreground">
                  Progression actuelle : {completionPercent}% des étapes obligatoires complétées.
                </p>
              </div>
              <Badge variant="destructive">
                {exportBlockers.length} blocage{exportBlockers.length > 1 ? "s" : ""}
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

      {/* ATS Score */}
      <ATSScoreGauge data={data} autoAnalyze={exportBlockers.length === 0} />

      {/* Professional Summary */}
      <Card className="border p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Résumé professionnel</Label>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              disabled={generatingSummary}
              onClick={handleGenerateSummary}
            >
              {generatingSummary ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              )}
              {generatingSummary ? "Génération..." : "Générer avec l'IA"}
            </Button>
          </div>
          <Textarea
            placeholder="Écrivez un court résumé professionnel ou laissez l'IA le générer..."
            value={data.summary}
            onChange={(e) => onUpdateData({ summary: e.target.value })}
            rows={3}
            className="resize-none"
          />
          {!data.summary && (
            <p className="text-xs text-muted-foreground">
              💡 Cliquez sur « Générer avec l'IA » pour créer un résumé basé sur vos informations.
            </p>
          )}
        </div>
      </Card>

      {/* Job Matching — Optional Collapsible */}
      <Collapsible open={matchOpen} onOpenChange={setMatchOpen}>
        <Card className="border-2 border-dashed border-primary/20 bg-primary/[0.02]">
          <CollapsibleTrigger asChild>
            <button className="w-full p-5 flex items-center gap-3 text-left hover:bg-primary/[0.03] transition-colors rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Matching offre d'emploi</h3>
                <p className="text-xs text-muted-foreground">Optionnel — Collez une offre pour voir votre score de correspondance</p>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${matchOpen ? "rotate-180" : ""}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Description du poste</Label>
                <Textarea
                  placeholder="Collez ici la description de l'offre d'emploi..."
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
                {analyzing ? "Analyse en cours..." : "Analyser la correspondance"}
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
                        <p className="font-semibold text-foreground">Score de correspondance</p>
                        <p className="text-xs text-muted-foreground">
                          {matchResult.matchScore >= 70
                            ? "Excellent match ! Votre profil correspond bien."
                            : matchResult.matchScore >= 40
                              ? "Match correct. Ajoutez les compétences manquantes."
                              : "Match faible. Considérez enrichir votre profil."}
                        </p>
                      </div>
                    </div>

                    {matchResult.matchedKeywords.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-medium text-foreground">Mots-clés trouvés ({matchResult.matchedKeywords.length})</span>
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
                          <span className="text-sm font-medium text-foreground">Mots-clés manquants ({matchResult.missingKeywords.length})</span>
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
                          💡 Cliquez sur un mot-clé pour l'ajouter à vos compétences techniques.
                        </p>
                      </div>
                    )}

                    {matchResult.suggestions.length > 0 && (
                      <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                        <p className="text-xs font-medium text-foreground">Recommandations :</p>
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
          <TabsTrigger value="cv" className="gap-2"><FileText className="h-4 w-4" /> Aperçu CV</TabsTrigger>
          <TabsTrigger value="cover" className="gap-2"><Sparkles className="h-4 w-4" /> Lettre de motivation</TabsTrigger>
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
