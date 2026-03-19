import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = () => {
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
                L'IA transforme vos descriptions en{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">bullet points d'expert</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Écrivez simplement ce que vous avez fait. Notre IA reformule avec des verbes d'action,
                des chiffres concrets et un langage professionnel.
              </p>
              <div className="mt-6 space-y-3">
                {["Verbes d'action professionnels", "Résultats quantifiés", "Adapté au marché tunisien"].map((item) => (
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
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Trois étapes, c'est tout
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pas besoin d'être expert. Notre IA vous guide à chaque étape.
            </p>
          </div>

          <div className="mt-16 relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] h-0.5 bg-border" />
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: "Remplissez vos infos", description: "Suivez le formulaire étape par étape. On s'occupe de la mise en forme." },
                { step: "02", title: "L'IA améliore tout", description: "Score ATS, bullet points optimisés, matching avec l'offre d'emploi." },
                { step: "03", title: "Téléchargez & partagez", description: "PDF prêt à envoyer, site web en ligne, lien de partage pour LinkedIn." },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="text-center relative"
                >
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
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Des modèles professionnels
            </h2>
            <p className="mt-4 text-muted-foreground">
              5 familles CV + 5 familles de profils publics, concues pour convaincre vite.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              { template: "essentiel" as const, name: "Essentiel", tag: "CV", description: "ATS-first, simple et direct pour les candidatures generalistes." },
              { template: "horizon" as const, name: "Horizon", tag: "CV", description: "Le meilleur equilibre entre modernite, clarté et sécurité." },
              { template: "signature" as const, name: "Signature", tag: "CV", description: "Plus de personnalite pour les profils creatifs, produit ou marketing." },
            ].map((t, i) => (
              <motion.div key={t.template} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to="/signup" className="group block">
                  <div className="transition-transform group-hover:-translate-y-2 group-hover:shadow-xl rounded-lg">
                    <TemplateMiniPreview template={t.template} name={t.name} tag={t.tag} description={t.description} />
                  </div>
                </Link>
              </motion.div>
            ))}
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
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Questions fréquentes</h2>
              <p className="mt-4 text-muted-foreground">Tout ce que vous devez savoir pour commencer.</p>
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
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Prêt à décrocher votre prochain emploi ?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Rejoignez des milliers d'utilisateurs qui ont déjà créé leur CV professionnel.
            </p>
            <Button size="lg" className="mt-8 gap-2 px-8 text-base shadow-lg shadow-primary/25" asChild>
              <Link to="/signup">
                Créer mon CV maintenant
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
