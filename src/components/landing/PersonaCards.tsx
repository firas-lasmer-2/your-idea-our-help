import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Truck, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function PersonaCards() {
  const { t } = useTranslation();

  const personas = [
    { icon: GraduationCap, title: t("personas.student"), description: t("personas.studentDesc"), color: "text-primary", bg: "bg-primary/10" },
    { icon: Briefcase, title: t("personas.professional"), description: t("personas.professionalDesc"), color: "text-accent", bg: "bg-accent/10" },
    { icon: Truck, title: t("personas.fieldwork"), description: t("personas.fieldworkDesc"), color: "text-primary", bg: "bg-primary/10" },
    { icon: Stethoscope, title: t("personas.services"), description: t("personas.servicesDesc"), color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            {t("personas.title")} <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Resume</span> ?
          </h2>
          <p className="mt-4 text-muted-foreground">{t("personas.subtitle")}</p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full border bg-card hover:shadow-md transition-all hover:-translate-y-1 group">
                <CardContent className="p-6 text-center">
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${p.bg} transition-transform group-hover:scale-110`}>
                    <p.icon className={`h-7 w-7 ${p.color}`} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
