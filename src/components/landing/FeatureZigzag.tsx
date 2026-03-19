import { motion } from "framer-motion";
import { Shield, Target, Sparkles, Globe, BarChart3, Users } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

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

function MatchingVisual({ t }: { t: (key: string) => string }) {
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
          <span className={`ms-auto text-xs ${s.match ? "text-primary" : "text-destructive"}`}>
            {s.match ? `✓ ${t("features.match")}` : t("features.missing")}
          </span>
        </div>
      ))}
    </div>
  );
}

function AIWriteVisual({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-4 p-6">
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
        <p className="text-xs text-muted-foreground line-through">{t("features.aiBefore")}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 text-accent" />
        {t("features.aiInAction")}
      </div>
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs text-foreground">{t("features.aiAfter")}</p>
      </div>
    </div>
  );
}

export default function FeatureZigzag() {
  const { t } = useTranslation();

  const features: Feature[] = [
    { icon: Shield, title: t("features.atsTitle"), description: t("features.atsDesc"), visual: <ATSGaugeVisual /> },
    { icon: Target, title: t("features.matchTitle"), description: t("features.matchDesc"), visual: <MatchingVisual t={t} /> },
    { icon: Sparkles, title: t("features.aiTitle"), description: t("features.aiDesc"), visual: <AIWriteVisual t={t} /> },
    {
      icon: Globe, title: t("features.profileTitle"), description: t("features.profileDesc"),
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
      icon: BarChart3, title: t("features.fastTitle"), description: t("features.fastDesc"),
      visual: (
        <div className="flex items-end justify-center gap-3 p-8">
          {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
            <motion.div key={i} className="w-6 rounded-t bg-primary/70" initial={{ height: 0 }} whileInView={{ height: h }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} />
          ))}
        </div>
      ),
    },
    {
      icon: Users, title: t("features.tunisiaTitle"), description: t("features.tunisiaDesc"),
      visual: <div className="flex items-center justify-center p-8"><div className="text-6xl">🇹🇳</div></div>,
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{t("features.sectionTitle")}</h2>
          <p className="mt-4 text-muted-foreground">{t("features.sectionSubtitle")}</p>
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
