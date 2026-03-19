import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarra Ben Ali",
    university: "ESPRIT",
    initials: "SA",
    rating: 5,
    text: "J'ai décroché mon stage PFE chez Vermeg grâce à ce CV ! L'IA a transformé mes descriptions en bullet points professionnels. Le score ATS m'a aidée à optimiser mon contenu.",
  },
  {
    name: "Ahmed Gharbi",
    university: "INSAT",
    initials: "AG",
    rating: 5,
    text: "En 15 minutes, j'avais un CV meilleur que tout ce que j'ai pu faire en 3 jours sur Word. Le matching avec la description du poste est incroyable.",
  },
  {
    name: "Yasmine Trabelsi",
    university: "IHEC Carthage",
    initials: "YT",
    rating: 4,
    text: "Interface super intuitive et résultat professionnel. J'ai aussi créé mon profil public en quelques clics pour mes candidatures. Parfait pour les étudiants tunisiens.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

const Testimonials = () => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          custom={i}
        >
          <Card className="h-full border bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`h-4 w-4 ${si < t.rating ? "fill-accent text-accent" : "text-muted"}`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.university}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default Testimonials;
