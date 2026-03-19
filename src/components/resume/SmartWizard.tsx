import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ArrowRight, ArrowLeft, MapPin, Briefcase, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COUNTRY_STANDARDS,
  JOB_CATEGORIES,
  getAllJobs,
  type TargetCountry,
  type JobField,
  type ExperienceLevel,
} from "@/lib/country-standards";
import { motion, AnimatePresence } from "framer-motion";

interface WizardResult {
  targetCountry: TargetCountry;
  jobField: JobField;
  jobTitle: string;
  experienceLevel: ExperienceLevel;
}

interface Props {
  onComplete: (result: WizardResult) => void;
  onSkip: () => void;
  expressMode?: boolean;
}

const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string; desc: string; icon: string }[] = [
  { id: "none", label: "Pas d'expérience", desc: "Étudiant ou premier emploi", icon: "🎓" },
  { id: "1-3", label: "1 à 3 ans", desc: "Début de carrière", icon: "🌱" },
  { id: "3-10", label: "3 à 10 ans", desc: "Expérience confirmée", icon: "💪" },
  { id: "10+", label: "Plus de 10 ans", desc: "Expert / Senior", icon: "⭐" },
];

const SmartWizard = ({ onComplete, onSkip, expressMode = false }: Props) => {
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState<TargetCountry | null>(null);
  const [jobField, setJobField] = useState<JobField | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);

  const allJobs = useMemo(() => getAllJobs(), []);
  const filteredJobs = useMemo(() => {
    if (!jobSearch.trim()) return [];
    const q = jobSearch.toLowerCase();
    return allJobs.filter(j => j.label.toLowerCase().includes(q)).slice(0, 8);
  }, [jobSearch, allJobs]);

  const selectedCategory = jobField ? JOB_CATEGORIES.find(c => c.id === jobField) : null;

  const handleComplete = () => {
    if (!country || !jobField || !experienceLevel) return;
    onComplete({
      targetCountry: country,
      jobField,
      jobTitle: jobTitle || selectedCategory?.jobs[0] || "",
      experienceLevel,
    });
  };

  const canNext = () => {
    if (step === 0) return !!country;
    if (step === 1) return !!jobField && !!jobTitle;
    if (step === 2) return !!experienceLevel;
    return false;
  };

  const next = () => {
    if (step < 2) setStep(step + 1);
    else handleComplete();
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            {expressMode ? "CV Express — prêt en 2 minutes" : "Assistant intelligent"}
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {step === 0 && "Où postulez-vous ?"}
            {step === 1 && "Quel est votre métier ?"}
            {step === 2 && "Quelle est votre expérience ?"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {step === 0 && "Chaque pays a ses propres standards de CV. On s'adapte pour vous."}
            {step === 1 && "On adaptera le contenu et les compétences à votre domaine."}
            {step === 2 && "Pour adapter le ton et le contenu de votre CV."}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className={cn("h-2 rounded-full transition-all", i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/50" : "w-2 bg-muted")} />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.values(COUNTRY_STANDARDS).map(c => (
                  <Card
                    key={c.id}
                    className={cn(
                      "cursor-pointer border-2 transition-all hover:shadow-md",
                      country === c.id ? "border-primary bg-primary/5" : "border-border"
                    )}
                    onClick={() => setCountry(c.id)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <p className="font-semibold text-foreground">{c.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.showPhoto ? "Photo: Oui" : "Photo: Non"} · Max {c.maxPages} page{c.maxPages > 1 ? "s" : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                {/* Job search */}
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tapez votre métier (ex: Chauffeur, Développeur, Infirmier...)"
                    className="pl-10 h-12 text-base"
                    value={jobSearch}
                    onChange={e => {
                      setJobSearch(e.target.value);
                      if (!jobTitle) setJobTitle(e.target.value);
                    }}
                  />
                  {filteredJobs.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border bg-background shadow-lg max-h-60 overflow-y-auto">
                      {filteredJobs.map((j, i) => (
                        <button
                          key={i}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm flex items-center justify-between"
                          onClick={() => {
                            setJobTitle(j.label);
                            setJobField(j.field);
                            setJobSearch(j.label);
                          }}
                        >
                          <span className="font-medium text-foreground">{j.label}</span>
                          <Badge variant="secondary" className="text-[10px]">{j.category}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category grid */}
                <p className="text-sm text-muted-foreground font-medium">Ou choisissez un domaine :</p>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                  {JOB_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setJobField(cat.id);
                        if (!jobTitle && cat.jobs.length > 0) {
                          setJobTitle(cat.jobs[0]);
                          setJobSearch(cat.jobs[0]);
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all text-center hover:shadow-sm",
                        jobField === cat.id ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs font-medium text-foreground">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Show jobs for selected category */}
                {selectedCategory && selectedCategory.jobs.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.jobs.map(job => (
                      <button
                        key={job}
                        onClick={() => { setJobTitle(job); setJobSearch(job); }}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs border transition-all",
                          jobTitle === job ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {job}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {EXPERIENCE_LEVELS.map(lvl => (
                  <Card
                    key={lvl.id}
                    className={cn(
                      "cursor-pointer border-2 transition-all hover:shadow-md",
                      experienceLevel === lvl.id ? "border-primary bg-primary/5" : "border-border"
                    )}
                    onClick={() => setExperienceLevel(lvl.id)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="text-2xl">{lvl.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground">{lvl.label}</p>
                        <p className="text-xs text-muted-foreground">{lvl.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
            ) : (
              <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
                Passer cette étape
              </Button>
            )}
          </div>
          <Button onClick={next} disabled={!canNext()} className="gap-2" size="lg">
            {step === 2 ? (
              <>
                {expressMode ? "Générer mon CV" : "Commencer"} <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                Suivant <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Country tips */}
        {step === 0 && country && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 rounded-lg border bg-muted/50 p-4">
            <p className="text-xs font-semibold text-foreground mb-2">💡 Conseils pour {COUNTRY_STANDARDS[country].label} :</p>
            <ul className="space-y-1">
              {COUNTRY_STANDARDS[country].tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-primary">•</span> {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SmartWizard;
