import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  { name: "Yasmine B.", role: "Étudiante en informatique", text: "J'ai décroché mon stage PFE grâce à ce CV. Le score ATS m'a aidée à comprendre ce qui manquait.", rating: 5 },
  { name: "Ahmed K.", role: "Ingénieur mécanique", text: "L'IA a transformé mes descriptions basiques en bullet points d'expert. Incroyable.", rating: 5 },
  { name: "Sarra M.", role: "Designer produit", text: "Le profil public généré automatiquement m'a donné un portfolio propre et partageable en quelques minutes.", rating: 5 },
  { name: "Mohamed R.", role: "Technicien ATFP", text: "Enfin un outil qui accepte les formations professionnelles, pas seulement les universités.", rating: 5 },
  { name: "Ines T.", role: "Comptable junior", text: "Le matching offre d'emploi m'a montré exactement quelles compétences ajouter. Très pratique.", rating: 4 },
  { name: "Khalil D.", role: "Développeur web", text: "Gratuit et aussi puissant que les outils payants. Je recommande à tous mes collègues.", rating: 5 },
  { name: "Fatma Z.", role: "Infirmière", text: "Simple à utiliser même sans compétences techniques. Mon CV est magnifique maintenant.", rating: 5 },
  { name: "Oussama H.", role: "Étudiant en commerce", text: "J'ai créé 3 versions de mon CV pour différents postes. L'IA adapte le contenu à chaque fois.", rating: 5 },
];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <Card className="w-[320px] shrink-0 border bg-card mx-3">
      <CardContent className="p-5">
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-accent text-accent" : "text-border"}`} />
          ))}
        </div>
        <p className="text-sm text-foreground leading-relaxed">"{t.text}"</p>
        <div className="mt-4 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{t.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestimonialMarquee() {
  const row1 = testimonials.slice(0, 4);
  const row2 = testimonials.slice(4);

  return (
    <section id="testimonials" className="py-20 md:py-28 overflow-hidden">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Ce que disent nos utilisateurs
          </h2>
          <p className="mt-4 text-muted-foreground">
            Des milliers d'étudiants tunisiens ont déjà créé leur CV professionnel.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1 - scroll left */}
        <div className="flex animate-marquee-left">
          {[...row1, ...row1, ...row1].map((t, i) => (
            <TestimonialCard key={`r1-${i}`} t={t} />
          ))}
        </div>
        {/* Row 2 - scroll right */}
        <div className="flex animate-marquee-right">
          {[...row2, ...row2, ...row2].map((t, i) => (
            <TestimonialCard key={`r2-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
