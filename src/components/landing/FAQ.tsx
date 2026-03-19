import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Est-ce vraiment gratuit ?",
    a: "Oui ! Le plan gratuit vous permet de créer 1 CV avec 3 téléchargements par mois, 1 profil public, et 20 requêtes IA par jour. C'est largement suffisant pour créer votre premier CV professionnel.",
  },
  {
    q: "Qu'est-ce que le score ATS ?",
    a: "ATS (Applicant Tracking System) est le logiciel utilisé par les recruteurs pour filtrer automatiquement les CV. Notre score ATS analyse votre CV selon les mêmes critères que ces logiciels et vous donne des recommandations pour augmenter vos chances de passer le filtre.",
  },
  {
    q: "Puis-je exporter mon CV en PDF ?",
    a: "Absolument ! Vous pouvez télécharger votre CV en PDF haute qualité, prêt à envoyer par email ou à uploader sur LinkedIn, Tanitjobs, ou Emploi.tn.",
  },
  {
    q: "L'IA écrit-elle vraiment bien en français ?",
    a: "Oui, notre IA est optimisée pour le français professionnel. Elle transforme vos descriptions simples en bullet points quantifiés et impactants, adaptés au marché tunisien et international.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers. Vous pouvez supprimer votre compte et toutes vos données à tout moment.",
  },
  {
    q: "Puis-je matcher mon CV avec une offre d'emploi ?",
    a: "Oui ! Collez la description du poste et notre IA compare les mots-clés avec votre CV. Vous obtenez un score de correspondance et les compétences manquantes à ajouter.",
  },
];

const FAQ = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger className="text-left text-base font-medium">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQ;
