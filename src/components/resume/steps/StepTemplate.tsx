import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ChevronDown, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ResumePreview from "@/components/resume/ResumePreview";
import { ResumeData, ResumeCustomization } from "@/types/resume";
import { getRecommendedResumeTemplate, getResumeTemplateMeta } from "@/lib/template-recommendations";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const templates = [
  { id: "essentiel", name: "Essentiel", descKey: "template.essentielDesc", badge: "template.popular" },
  { id: "horizon", name: "Horizon", descKey: "template.horizonDesc", badge: null },
  { id: "trajectoire", name: "Trajectoire", descKey: "template.trajectoireDesc", badge: null },
  { id: "direction", name: "Direction", descKey: "template.directionDesc", badge: null },
  { id: "signature", name: "Signature", descKey: "template.signatureDesc", badge: null },
  { id: "academique", name: "Académique", descKey: "template.academiqueDesc", badge: "template.new" },
  { id: "medical", name: "Médical", descKey: "template.medicalDesc", badge: "template.new" },
  { id: "technique", name: "Technique", descKey: "template.techniqueDesc", badge: "template.new" },
];

const templateDescDefaults: Record<string, string> = {
  "template.essentielDesc": "ATS-first, direct et très lisible. Idéal pour les candidatures terrain et généralistes.",
  "template.horizonDesc": "Équilibre entre modernité, clarté et sécurité ATS pour la plupart des profils.",
  "template.trajectoireDesc": "Montre clairement l'évolution de carrière, les promotions et la progression.",
  "template.directionDesc": "Plus premium et plus posé. Pensé pour les profils seniors et corporate.",
  "template.signatureDesc": "Ajoute de la personnalité sans tomber dans un style trop risqué.",
  "template.academiqueDesc": "Formation et publications en priorité. Idéal pour les candidatures universitaires et la recherche.",
  "template.medicalDesc": "Certifications et expérience clinique mises en avant pour les professionnels de santé.",
  "template.techniqueDesc": "Permis, licences et compétences terrain en priorité pour les métiers manuels.",
  "template.popular": "Populaire",
  "template.new": "Nouveau",
};

// Fake sample data for realistic mini-previews
const sampleData: ResumeData = {
  jobTarget: "experienced",
  targetCountry: "",
  jobField: "tech",
  jobTitle: "Développeur Full Stack",
  experienceLevel: "mid",
  simplifiedMode: false,
  personalInfo: {
    firstName: "Ahmed",
    lastName: "Ben Ali",
    email: "ahmed@email.com",
    phone: "+216 12 345 678",
    city: "Tunis",
    linkedIn: "linkedin.com/in/ahmed",
    github: "github.com/ahmed",
    photoUrl: "",
  },
  education: [
    { id: "1", institution: "ESPRIT", degree: "Ingénieur", field: "Informatique", startDate: "2018", endDate: "2021", current: false, description: "" },
  ],
  experience: [
    {
      id: "1", company: "TechCorp", position: "Développeur Full Stack", startDate: "2021", endDate: "", current: true,
      bullets: ["Développement d'applications React/Node.js", "Gestion de bases de données PostgreSQL"],
    },
    {
      id: "2", company: "StartupXYZ", position: "Développeur Junior", startDate: "2020", endDate: "2021", current: false,
      bullets: ["Développement front-end avec Vue.js"],
    },
  ],
  skillCategories: [
    { id: "tech", name: "Compétences techniques", skills: ["React", "Node.js", "TypeScript", "PostgreSQL"] },
    { id: "soft", name: "Compétences personnelles", skills: ["Travail d'équipe", "Communication"] },
    { id: "tools", name: "Outils & Logiciels", skills: ["Git", "Docker"] },
  ],
  projects: [
    { id: "1", name: "E-commerce App", description: "Plateforme de vente en ligne", url: "", technologies: ["React", "Node.js"] },
  ],
  certifications: [
    { id: "1", name: "AWS Solutions Architect", issuer: "Amazon", date: "2023", url: "" },
  ],
  languages: [
    { name: "Français", level: "Natif" },
    { name: "Anglais", level: "Courant" },
  ],
  interests: ["Programmation", "Lecture"],
  summary: "Développeur Full Stack passionné avec 3 ans d'expérience en React et Node.js.",
  additionalSections: [],
};

const sampleCustomization: ResumeCustomization = {
  accentColor: "#0d9488",
  fontPair: "inter",
  showPhoto: false,
  spacing: "compact",
  sectionOrder: ["summary", "experience", "education", "skills", "projects", "languages", "interests"],
};

interface Props {
  data: ResumeData;
  template: string;
  setTemplate: (t: string) => void;
}

const StepTemplate = ({ data, template, setTemplate }: Props) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const recommended = getRecommendedResumeTemplate({
    targetCountry: data.targetCountry as any,
    jobField: data.jobField as any,
    experienceLevel: data.experienceLevel as any,
    jobTitle: data.jobTitle || data.jobTarget,
  });
  const previewData = data.personalInfo.firstName || data.personalInfo.lastName || data.summary || data.experience.length > 0
    ? data
    : sampleData;
  const primaryTemplateIds = useMemo(() => {
    const base = ["essentiel", "horizon", "trajectoire"];
    return Array.from(new Set([recommended.id, ...base]));
  }, [recommended.id]);
  const primaryTemplates = templates.filter((entry) => primaryTemplateIds.includes(entry.id));
  const advancedTemplates = templates.filter((entry) => !primaryTemplateIds.includes(entry.id));
  const previewTemplateIdSafe = previewTemplateId || template;

  const renderTemplateCard = (tpl: typeof templates[number]) => {
    const meta = getResumeTemplateMeta(tpl.id);
    const isRecommended = recommended.id === tpl.id;

    return (
      <Card
        key={tpl.id}
        className={cn(
          "cursor-pointer border-2 transition-all hover:shadow-lg group",
          template === tpl.id ? "border-primary shadow-md" : "border-border hover:border-primary/30"
        )}
        onClick={() => setTemplate(tpl.id)}
      >
        <div className="relative overflow-hidden bg-white" style={{ height: "320px" }}>
          <div
            style={{
              transform: "scale(0.35)",
              transformOrigin: "top left",
              width: "700px",
              padding: "32px",
              pointerEvents: "none",
            }}
          >
            <ResumePreview data={previewData} customization={sampleCustomization} template={tpl.id} />
          </div>

          <div className={cn(
            "absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity",
            template === tpl.id && "opacity-100 bg-primary/10"
          )} />

          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/55 to-transparent px-3 py-3 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={(event) => {
                event.stopPropagation();
                setPreviewTemplateId(tpl.id);
              }}
            >
              <Eye className="h-4 w-4" />
              {t("template.viewLarge", "Voir en grand")}
            </Button>
          </div>

          {template === tpl.id && (
            <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-md">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}

          {(tpl.badge || isRecommended) && (
            <Badge className={cn(
              "absolute left-2 top-2 text-[10px] pointer-events-none",
              isRecommended
                ? "bg-primary text-primary-foreground"
                : tpl.badge === "template.new"
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground"
            )}>
              {isRecommended ? t("template.recommended", "Recommandé") : t(tpl.badge!, templateDescDefaults[tpl.badge!])}
            </Badge>
          )}
        </div>

        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">{tpl.name}</h3>
            {template === tpl.id && <Badge variant="outline" className="text-[10px]">{t("template.selected", "Sélectionné")}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{t(tpl.descKey, templateDescDefaults[tpl.descKey])}</p>
          {meta && (
            <div className="space-y-2 text-xs">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[10px]">{meta.styleLabel}</Badge>
                <Badge variant="outline" className="text-[10px]">{meta.atsLabel}</Badge>
                <Badge variant="outline" className="text-[10px]">{meta.density}</Badge>
              </div>
              <p className="text-muted-foreground"><span className="font-medium text-foreground">{t("template.idealFor", "Idéal pour")}:</span> {meta.bestFor}</p>
              <p className="text-muted-foreground"><span className="font-medium text-foreground">{t("template.emphasizes", "Met l'accent sur")}:</span> {meta.emphasis}</p>
              <p className="text-muted-foreground"><span className="font-medium text-foreground">{t("template.photo", "Photo")}:</span> {meta.photoLabel}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("template.chooseTitle", "Choisissez un modèle")}</h2>
        <p className="mt-1 text-muted-foreground">
          {t("template.chooseSubtitle", "Commencez par la famille recommandée, puis comparez les autres si vous voulez une présentation plus senior ou plus marquée.")}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">{t("template.recommendedForProfile", "Recommandé pour votre profil")}</p>
            </div>
            <p className="mt-1 text-sm text-foreground">{recommended.meta.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{recommended.reason}</p>
          </div>
          {template !== recommended.id && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              onClick={() => setTemplate(recommended.id)}
            >
              {t("template.useRecommended", "Utiliser le recommandé")}
            </button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("template.quickPicks", "Choix rapides")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("template.quickPicksDesc", "Les familles les plus sûres pour la majorité des candidatures.")}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {primaryTemplates.map(renderTemplateCard)}
        </div>
      </div>

      {advancedTemplates.length > 0 && (
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setShowAdvanced((value) => !value)}
          >
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t("template.moreTemplates", "Plus de modèles")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("template.moreTemplatesDesc", "Styles spécialisés pour profils seniors, académiques, médicaux ou techniques.")}
              </p>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showAdvanced && "rotate-180")} />
          </button>

          {showAdvanced && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {advancedTemplates.map(renderTemplateCard)}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!previewTemplateId} onOpenChange={() => setPreviewTemplateId(null)}>
        <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {getResumeTemplateMeta(previewTemplateIdSafe)?.label || previewTemplateIdSafe}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto rounded-lg border bg-white p-6">
            <ResumePreview data={previewData} customization={sampleCustomization} template={previewTemplateIdSafe} />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setTemplate(previewTemplateIdSafe);
                setPreviewTemplateId(null);
              }}
            >
              {t("template.useThis", "Utiliser ce modèle")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StepTemplate;
