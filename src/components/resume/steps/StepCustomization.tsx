import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResumeCustomization } from "@/types/resume";
import { useTranslation } from "react-i18next";

const accentColors = [
  { value: "#0d9488", label: "Teal" },
  { value: "#2563eb", label: "Bleu" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#dc2626", label: "Rouge" },
  { value: "#ea580c", label: "Orange" },
  { value: "#16a34a", label: "Vert" },
  { value: "#1e293b", label: "Noir" },
];

const fontPairs = [
  { value: "inter", label: "Inter", sample: "Aa", family: "'Inter', system-ui, sans-serif" },
  { value: "georgia", label: "Georgia", sample: "Aa", family: "Georgia, 'Times New Roman', serif" },
  { value: "roboto", label: "Roboto", sample: "Aa", family: "'Roboto', system-ui, sans-serif" },
  { value: "playfair", label: "Playfair Display", sample: "Aa", family: "'Playfair Display', Georgia, serif" },
  { value: "dm-sans", label: "DM Sans", sample: "Aa", family: "'DM Sans', 'Inter', system-ui, sans-serif" },
  { value: "source-serif", label: "Source Serif 4", sample: "Aa", family: "'Source Serif 4', Georgia, serif" },
  { value: "space-grotesk", label: "Space Grotesk", sample: "Aa", family: "'Space Grotesk', 'Inter', system-ui, sans-serif" },
];

interface Props {
  customization: ResumeCustomization;
  updateCustomization: (updates: Partial<ResumeCustomization>) => void;
}

const StepCustomization = ({ customization, updateCustomization }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("customization.title", "Personnalisation")}</h2>
        <p className="mt-1 text-muted-foreground">
          {t("customization.subtitle", "Ajustez l'apparence de votre CV à votre goût.")}
        </p>
      </div>

      {/* Accent color */}
      <Card className="border">
        <CardContent className="space-y-3 p-5">
          <Label className="text-base font-semibold">{t("customization.accentColor", "Couleur d'accent")}</Label>
          <div className="flex flex-wrap gap-3 items-center">
            {accentColors.map((c) => (
              <button
                key={c.value}
                onClick={() => updateCustomization({ accentColor: c.value })}
                className={`h-10 w-10 rounded-full border-2 transition-all ${
                  customization.accentColor === c.value ? "border-foreground scale-110 shadow-md" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
            {/* Custom color picker */}
            <label
              className={`relative h-10 w-10 rounded-full border-2 transition-all cursor-pointer overflow-hidden ${
                !accentColors.find((c) => c.value === customization.accentColor) ? "border-foreground scale-110 shadow-md" : "border-transparent hover:border-muted-foreground"
              }`}
              style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
              title={t("customization.customColor", "Couleur personnalisée")}
            >
              <input
                type="color"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                value={customization.accentColor}
                onChange={(e) => updateCustomization({ accentColor: e.target.value })}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Font */}
      <Card className="border">
        <CardContent className="space-y-3 p-5">
          <Label className="text-base font-semibold">{t("customization.font", "Police")}</Label>
          <RadioGroup value={customization.fontPair} onValueChange={(v) => updateCustomization({ fontPair: v })}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {fontPairs.map((f) => (
                <label
                  key={f.value}
                  htmlFor={`font-${f.value}`}
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all ${
                    customization.fontPair === f.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  <RadioGroupItem value={f.value} id={`font-${f.value}`} className="sr-only" />
                  <span style={{ fontFamily: f.family, fontSize: "22px", fontWeight: 600, lineHeight: 1 }}>{f.sample}</span>
                  <span className="text-center text-[11px] text-muted-foreground leading-tight">{f.label}</span>
                </label>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Photo */}
      <Card className="border">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <Label className="text-base font-semibold">{t("customization.showPhoto", "Afficher la photo")}</Label>
            <p className="text-sm text-muted-foreground">{t("customization.showPhotoDesc", "Inclure une photo sur le CV")}</p>
          </div>
          <Switch checked={customization.showPhoto} onCheckedChange={(v) => updateCustomization({ showPhoto: v })} />
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card className="border">
        <CardContent className="space-y-3 p-5">
          <Label className="text-base font-semibold">{t("customization.spacing", "Espacement")}</Label>
          <RadioGroup value={customization.spacing} onValueChange={(v) => updateCustomization({ spacing: v })}>
            <div className="flex gap-4">
              {[
                { value: "compact", label: t("customization.compact", "Compact") },
                { value: "normal", label: t("customization.normal", "Normal") },
                { value: "spacious", label: t("customization.spacious", "Aéré") },
              ].map((s) => (
                <div key={s.value} className="flex items-center gap-2">
                  <RadioGroupItem value={s.value} id={`spacing-${s.value}`} />
                  <Label htmlFor={`spacing-${s.value}`} className="cursor-pointer">{s.label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepCustomization;
