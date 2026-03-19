import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const examples = [
  {
    before: "J'ai fait des tests sur le logiciel",
    after: "Conçu et exécuté plus de 15 scénarios de test couvrant 92 % des flux utilisateurs critiques, réduisant les bugs post-release de 40 %.",
  },
  {
    before: "J'ai aidé au service client",
    after: "Géré un portefeuille de 120+ clients avec un taux de satisfaction de 96 %, en résolvant les problèmes en moins de 24h en moyenne.",
  },
  {
    before: "J'ai travaillé sur un projet web",
    after: "Développé une application React/Node.js de gestion de stock servant 500+ utilisateurs, réduisant le temps de traitement des commandes de 60 %.",
  },
];

const BeforeAfterAI = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAfter, setShowAfter] = useState(false);

  const handleToggle = () => {
    setShowAfter(!showAfter);
  };

  const handleNext = () => {
    setShowAfter(false);
    setActiveIndex((prev) => (prev + 1) % examples.length);
  };

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl border bg-card p-6 md:p-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3" />

        <div className="relative space-y-5">
          {/* Before */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
              ✗ Avant
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={`before-${activeIndex}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="rounded-lg border border-destructive/20 bg-destructive/5 p-4"
              >
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  "{examples[activeIndex].before}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrow / Transform button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              className="gap-2 rounded-full border-primary/30 hover:bg-primary/5"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              {showAfter ? "Voir l'original" : "Améliorer avec l'IA"}
            </Button>
          </div>

          {/* After */}
          <AnimatePresence>
            {showAfter && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-2 overflow-hidden"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  ✓ Après IA
                </span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`after-${activeIndex}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="rounded-lg border border-primary/20 bg-primary/5 p-4"
                  >
                    <p className="text-sm text-foreground font-medium leading-relaxed">
                      "{examples[activeIndex].after}"
                    </p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex items-center justify-center gap-3">
        {examples.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIndex(i); setShowAfter(false); }}
            className={`h-2 rounded-full transition-all ${
              i === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
        <button
          onClick={handleNext}
          className="ml-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Suivant <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default BeforeAfterAI;
