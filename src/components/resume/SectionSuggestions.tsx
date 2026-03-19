import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResumeData } from "@/types/resume";
import { motion, AnimatePresence } from "framer-motion";

interface SectionSuggestion {
  section: string;
  recommended: boolean;
  reason: string;
}

interface Props {
  data: ResumeData;
  onEnableSections: (sections: string[]) => void;
  visible: boolean;
  onDismiss: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  projects: "Projets",
  certifications: "Certifications",
  languages: "Langues",
  interests: "Centres d'intérêt",
};

const SECTION_ICONS: Record<string, string> = {
  projects: "🔧",
  certifications: "📜",
  languages: "🌍",
  interests: "💡",
};

const SectionSuggestions = ({ data, onEnableSections, visible, onDismiss }: Props) => {
  const [suggestions, setSuggestions] = useState<SectionSuggestion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!visible || fetched) return;
    setLoading(true);

    (async () => {
      try {
        const { data: result, error } = await supabase.functions.invoke("section-suggest", {
          body: {
            resumeContext: {
              jobTitle: data.jobTitle || data.jobTarget,
              targetCountry: data.targetCountry,
              jobField: data.jobField,
              experienceLevel: data.experienceLevel,
              simplifiedMode: data.simplifiedMode,
            },
          },
        });

        if (!error && result?.result) {
          try {
            const jsonMatch = result.result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.suggestions) {
                setSuggestions(parsed.suggestions);
                // Pre-select recommended ones
                const recommended = new Set<string>(
                  parsed.suggestions
                    .filter((s: SectionSuggestion) => s.recommended)
                    .map((s: SectionSuggestion) => s.section)
                );
                setSelected(recommended);
              }
            }
          } catch {
            // Parse error, silently fail
          }
        }
      } catch {
        // Network error, silently fail
      } finally {
        setLoading(false);
        setFetched(true);
      }
    })();
  }, [visible, fetched, data]);

  const toggleSection = (section: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleApply = () => {
    onEnableSections(Array.from(selected));
    onDismiss();
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Sections recommandées par l'IA</p>
                  <p className="text-xs text-muted-foreground">Basé sur votre profil et votre domaine</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onDismiss}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analyse de votre profil...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                <div className="space-y-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.section}
                      onClick={() => toggleSection(s.section)}
                      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                        selected.has(s.section)
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-card hover:bg-muted/50"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        selected.has(s.section) ? "border-primary bg-primary" : "border-muted-foreground/30"
                      }`}>
                        {selected.has(s.section) && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{SECTION_ICONS[s.section] || "📄"}</span>
                          <span className="text-sm font-medium text-foreground">{SECTION_LABELS[s.section] || s.section}</span>
                          {s.recommended && <Badge variant="secondary" className="text-[10px]">Recommandé</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{s.reason}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={onDismiss}>
                    Ignorer
                  </Button>
                  <Button size="sm" onClick={handleApply} disabled={selected.size === 0} className="gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    Activer {selected.size > 0 ? `(${selected.size})` : ""}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-2">Aucune suggestion disponible pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default SectionSuggestions;
