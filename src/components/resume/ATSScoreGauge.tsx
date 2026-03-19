import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Shield, ChevronDown, ChevronUp, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResumeData } from "@/types/resume";
import { useToast } from "@/hooks/use-toast";
import { incrementUsageCounter, trackProductEvent } from "@/lib/product-events";

interface ScoreResult {
  score: number;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    tips: string[];
  }[];
  summary: string;
}

interface Props {
  data: ResumeData;
  autoAnalyze?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-primary";
  if (score >= 60) return "text-accent";
  return "text-destructive";
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Très bien";
  if (score >= 60) return "Bien";
  if (score >= 40) return "À améliorer";
  return "Faible";
};

const ATSScoreGauge = ({ data, autoAnalyze = false }: Props) => {
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const autoTriggeredRef = useRef(false);

  const checkScore = async () => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("resume-score", {
        body: { resumeData: data },
      });

      if (error) {
        toast({ title: "Erreur", description: "Impossible d'analyser le CV.", variant: "destructive" });
        return;
      }

      if (res?.error) {
        toast({ title: "Erreur", description: res.error, variant: "destructive" });
        return;
      }

      setResult(res);
      await incrementUsageCounter("ai_requests_count");
      await trackProductEvent("ats_scored", {
        data: {
          score: res.score,
          country: data.targetCountry,
          field: data.jobField,
        },
      });
    } catch {
      toast({ title: "Erreur", description: "Erreur de connexion.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoAnalyze || autoTriggeredRef.current || result || loading) return;
    autoTriggeredRef.current = true;
    void checkScore();
  }, [autoAnalyze, result, loading]);

  if (!result) {
    return (
      <Card className="border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Score ATS</p>
              <p className="text-xs text-muted-foreground">Analysez la compatibilité de votre CV</p>
            </div>
          </div>
          <Button onClick={checkScore} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {loading ? "Analyse..." : "Analyser"}
          </Button>
        </div>
      </Card>
    );
  }

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (result.score / 100) * circumference;

  return (
    <Card className="border p-5 space-y-4">
      <div className="flex items-start gap-5">
        {/* Circular gauge */}
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-muted" />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`${result.score >= 80 ? "stroke-primary" : result.score >= 60 ? "stroke-accent" : "stroke-destructive"}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}</span>
            <span className="text-[10px] text-muted-foreground">{getScoreLabel(result.score)}</span>
          </div>
        </div>

        {/* Summary */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Score ATS</h3>
            <Button variant="ghost" size="sm" onClick={checkScore} disabled={loading} className="text-xs gap-1">
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Réanalyser
            </Button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Category breakdown */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="w-full justify-between text-xs"
      >
        Détails par catégorie
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {result.categories.map((cat) => {
              const pct = Math.round((cat.score / cat.maxScore) * 100);
              const Icon = pct >= 80 ? CheckCircle : pct >= 50 ? AlertCircle : XCircle;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 ${pct >= 80 ? "text-primary" : pct >= 50 ? "text-accent" : "text-destructive"}`} />
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{cat.score}/{cat.maxScore}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${pct >= 80 ? "bg-primary" : pct >= 50 ? "bg-accent" : "bg-destructive"}`}
                    />
                  </div>
                  {cat.tips.length > 0 && (
                    <ul className="space-y-0.5">
                      {cat.tips.map((tip, ti) => (
                        <li key={ti} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="mt-0.5">💡</span> {tip}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ATSScoreGauge;
