import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResumeCustomization } from "@/types/resume";

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
  { value: "inter", label: "Inter", sample: "Aa" },
  { value: "georgia", label: "Georgia", sample: "Aa" },
  { value: "roboto", label: "Roboto", sample: "Aa" },
];

interface Props {
  customization: ResumeCustomization;
  updateCustomization: (updates: Partial<ResumeCustomization>) => void;
}

const StepCustomization = ({ customization, updateCustomization }: Props) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Personnalisation</h2>
        <p className="mt-1 text-muted-foreground">
          Ajustez l'apparence de votre CV à votre goût.
        </p>
      </div>

      {/* Accent color */}
      <Card className="border">
        <CardContent className="space-y-3 p-5">
          <Label className="text-base font-semibold">Couleur d'accent</Label>
          <div className="flex flex-wrap gap-3">
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
          </div>
        </CardContent>
      </Card>

      {/* Font */}
      <Card className="border">
        <CardContent className="space-y-3 p-5">
          <Label className="text-base font-semibold">Police</Label>
          <RadioGroup value={customization.fontPair} onValueChange={(v) => updateCustomization({ fontPair: v })}>
            {fontPairs.map((f) => (
              <div key={f.value} className="flex items-center gap-3">
                <RadioGroupItem value={f.value} id={`font-${f.value}`} />
                <Label htmlFor={`font-${f.value}`} className="cursor-pointer">{f.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Photo */}
      <Card className="border">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <Label className="text-base font-semibold">Afficher la photo</Label>
            <p className="text-sm text-muted-foreground">Inclure une photo sur le CV</p>
          </div>
          <Switch checked={customization.showPhoto} onCheckedChange={(v) => updateCustomization({ showPhoto: v })} />
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card className="border">
        <CardContent className="space-y-3 p-5">
          <Label className="text-base font-semibold">Espacement</Label>
          <RadioGroup value={customization.spacing} onValueChange={(v) => updateCustomization({ spacing: v })}>
            <div className="flex gap-4">
              {[
                { value: "compact", label: "Compact" },
                { value: "normal", label: "Normal" },
                { value: "spacious", label: "Aéré" },
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
