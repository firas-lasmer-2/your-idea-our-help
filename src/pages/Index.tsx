import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import MobileNav from "@/components/landing/MobileNav";
import HeroAnimated from "@/components/landing/HeroAnimated";
import PersonaCards from "@/components/landing/PersonaCards";
import FeatureZigzag from "@/components/landing/FeatureZigzag";
import BeforeAfterAI from "@/components/landing/BeforeAfterAI";
import StatsCounter from "@/components/landing/StatsCounter";
import TemplateMiniPreview from "@/components/landing/TemplateMiniPreview";
import TestimonialMarquee from "@/components/landing/TestimonialMarquee";
import TrustedByMarquee from "@/components/landing/TrustedByMarquee";
import PricingToggle from "@/components/landing/PricingToggle";
import FAQ from "@/components/landing/FAQ";
import FooterFull from "@/components/landing/FooterFull";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <MobileNav />
      <HeroAnimated />

      {/* Stats */}
      <section className="border-t border-b bg-secondary/30 py-12">
        <div className="container"><StatsCounter /></div>
      </section>

      <PersonaCards />
      <FeatureZigzag />

      {/* Before/After AI */}
      <section id="ai" className="border-t bg-secondary/30 py-20 md:py-28">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                {t("ai.sectionTitle")}{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t("ai.sectionHighlight")}</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{t("ai.sectionDesc")}</p>
              <div className="mt-6 space-y-3">
                {[t("ai.benefit1"), t("ai.benefit2"), t("ai.benefit3")].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <BeforeAfterAI />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{t("howItWorks.title")}</h2>
            <p className="mt-4 text-muted-foreground">{t("howItWorks.subtitle")}</p>
          </div>

          <div className="mt-16 relative">
            <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] h-0.5 bg-border" />
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: t("howItWorks.step1"), description: t("howItWorks.step1Desc") },
                { step: "02", title: t("howItWorks.step2"), description: t("howItWorks.step2Desc") },
                { step: "03", title: t("howItWorks.step3"), description: t("howItWorks.step3Desc") },
              ].map((item, i) => (
                <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className="text-center relative">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/25 relative z-10">
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="border-t bg-secondary/30 py-20 md:py-28">
        <div className="container">
          <motion.div className="mx-auto max-w-2xl text-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{t("templates.sectionTitle")}</h2>
            <p className="mt-4 text-muted-foreground">{t("templates.sectionSubtitle")}</p>
          </motion.div>
          <div className="mt-12">
            <TemplateMiniPreview />
          </div>
        </div>
      </section>

      <TestimonialMarquee />
      <TrustedByMarquee />
      <PricingToggle />

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{t("faq.title")}</h2>
              <p className="mt-4 text-muted-foreground">{t("faq.subtitle")}</p>
            </div>
            <div className="mt-12"><FAQ /></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{t("cta.title")}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{t("cta.subtitle")}</p>
            <Button size="lg" className="mt-8 gap-2 px-8 text-base shadow-lg shadow-primary/25" asChild>
              <Link to="/signup">
                {t("cta.button")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <FooterFull />
    </div>
  );
};

export default Index;
