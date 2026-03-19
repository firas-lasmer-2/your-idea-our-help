import { motion } from "framer-motion";
import { Shield, Target, Sparkles, Globe, BarChart3, Users } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  visual: React.ReactNode;
}

function ATSGaugeVisual() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" className="stroke-border" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="40" fill="none" className="stroke-primary" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={251.2}
            initial={{ strokeDashoffset: 251.2 }}
            whileInView={{ strokeDashoffset: 251.2 * 0.08 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">92</span>
          <span className="text-xs text-muted-foreground">Score ATS</span>
        </div>
      </div>
    </div>
  );
}

function MatchingVisual() {
  return (
    <div className="space-y-3 p-6">
      {[
        { skill: "React.js", match: true },
        { skill: "TypeScript", match: true },
        { skill: "Node.js", match: true },
        { skill: "Docker", match: false },
        { skill: "AWS", match: false },
      ].map((s) => (
        <div key={s.skill} className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${s.match ? "bg-primary" : "bg-destructive/50"}`} />
          <span className={`text-sm ${s.match ? "text-foreground" : "text-muted-foreground line-through"}`}>{s.skill}</span>
          <span className={`ml-auto text-xs ${s.match ? "text-primary" : "text-destructive"}`}>
            {s.match ? "✓ Match" : "Manquant"}
          </span>
        </div>
      ))}
    </div>
  );
}

function AIWriteVisual() {
  return (
    <div className="space-y-4 p-6">
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
        <p className="text-xs text-muted-foreground line-through">J'ai travaillé sur des projets web</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 text-accent" />
        IA en action...
      </div>
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs text-foreground">Développé 5 applications web React avec TypeScript, réduisant le temps de chargement de 40%</p>
      </div>
    </div>
  );
}

const features: Feature[] = [
  {
    icon: Shield,
    title: "Score ATS intelligent",
    description: "Analysez votre CV avec notre algorithme ATS. Score de 0 à 100 avec recommandations détaillées pour chaque section. Optimisez pour passer les filtres automatiques des recruteurs.",
    visual: <ATSGaugeVisual />,
  },
  {
    icon: Target,
    title: "Matching offre d'emploi",
    description: "Collez une description de poste. L'IA compare les mots-clés et vous montre les compétences manquantes à ajouter. Maximisez vos chances d'être sélectionné.",
    visual: <MatchingVisual />,
  },
  {
    icon: Sparkles,
    title: "IA qui écrit pour vous",
    description: "Transformez vos descriptions en bullet points professionnels et quantifiés. Résumé et titres optimisés automatiquement avec des verbes d'action.",
    visual: <AIWriteVisual />,
  },
  {
    icon: Globe,
    title: "Profil public en un clic",
    description: "Profil pro ou portfolio ciblé emploi. L'IA génère le contenu à partir de votre CV et l'adapte à votre métier pour un lien professionnel prêt à partager.",
    visual: (
      <div className="p-6 space-y-3">
        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <div className="h-3 w-1/2 rounded bg-primary/20" />
          <div className="mt-2 h-2 w-full rounded bg-muted" />
          <div className="mt-1 h-2 w-3/4 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border bg-card p-2 h-16" />
          <div className="rounded-lg border bg-card p-2 h-16" />
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Rapide et gratuit",
    description: "Créez votre premier CV en moins de 10 minutes. Plan gratuit généreux avec IA incluse. Pas de carte bancaire requise.",
    visual: (
      <div className="flex items-end justify-center gap-3 p-8">
        {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
          <motion.div
            key={i}
            className="w-6 rounded-t bg-primary/70"
            initial={{ height: 0 }}
            whileInView={{ height: h }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
        ))}
      </div>
    ),
  },
  {
    icon: Users,
    title: "Fait pour la Tunisie",
    description: "Universités, centres de formation, lycées et conventions locales intégrées. Interface en français avec support pour tous les profils.",
    visual: (
      <div className="flex items-center justify-center p-8">
        <div className="text-6xl">🇹🇳</div>
      </div>
    ),
  },
];

export default function FeatureZigzag() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-4 text-muted-foreground">
            Des outils puissants et simples, pensés pour le marché tunisien.
          </p>
        </div>

        <div className="space-y-20">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}
            >
              <div className={i % 2 === 1 ? "lg:[direction:ltr]" : ""}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-foreground">{f.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
              <div className={`rounded-2xl border bg-card shadow-sm ${i % 2 === 1 ? "lg:[direction:ltr]" : ""}`}>
                {f.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
