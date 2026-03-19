import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Sparkles, FileText, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function HeroAnimated() {
  const [roleIndex, setRoleIndex] = useState(0);
  const { t } = useTranslation();
  const roles = t("hero.roles", { returnObjects: true }) as string[];

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] animate-blob rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] animate-blob animation-delay-2000 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 h-[350px] w-[350px] animate-blob animation-delay-4000 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur-sm px-5 py-2 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              {t("hero.badge")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {t("hero.title")}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </span>{" "}
            <br className="hidden sm:block" />
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="inline-block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
              >
                {roles[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button size="lg" className="gap-2 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild>
              <Link to="/signup">
                {t("hero.ctaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-6 text-base" asChild>
              <Link to="/signup">
                <Globe className="h-4 w-4" />
                {t("hero.ctaSecondary")}
              </Link>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4"
          >
            {[
              { label: t("hero.badge1"), icon: FileText },
              { label: t("hero.badge2"), icon: CheckCircle },
              { label: t("hero.badge3"), icon: Sparkles },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 rounded-full border bg-card/60 backdrop-blur-sm px-4 py-2 text-sm text-muted-foreground shadow-sm"
              >
                <badge.icon className="h-4 w-4 text-primary" />
                {badge.label}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
