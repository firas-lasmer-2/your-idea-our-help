import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Truck, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const personas = [
  {
    icon: GraduationCap,
    title: "Étudiant",
    description: "Premier stage ou PFE. Mettez en valeur vos projets et formations.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Briefcase,
    title: "Professionnel",
    description: "Changement de carrière ou promotion. Valorisez votre expérience.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Truck,
    title: "Métiers terrain",
    description: "Transport, logistique, BTP ou maintenance. Valorisez expérience, permis et disponibilité.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Stethoscope,
    title: "Services & santé",
    description: "Hôtellerie, accueil, soins ou support. Un profil clair et professionnel, facile à partager.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

export default function PersonaCards() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Qui utilise <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Resume</span> ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Étudiant, chauffeur, infirmier, technicien ou cadre: l'IA adapte le CV et le profil public à votre métier.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
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
