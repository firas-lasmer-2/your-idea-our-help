import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WebsiteSectionStyle, ANIMATION_OPTIONS, PADDING_OPTIONS } from "@/types/website";
import { Paintbrush } from "lucide-react";

interface Props {
  style: WebsiteSectionStyle;
  onUpdate: (updates: Partial<WebsiteSectionStyle>) => void;
}

export default function SectionStyleEditor({ style, onUpdate }: Props) {
  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Paintbrush className="h-4 w-4 text-primary" />
        Style de la section
      </div>

      {/* Background color */}
      <div className="space-y-2">
        <Label className="text-xs">Couleur de fond</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={style.backgroundColor || "#ffffff"}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="h-8 w-8 rounded border cursor-pointer"
          />
          <Input
            value={style.backgroundColor || ""}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            placeholder="Transparent (défaut)"
            className="h-8 text-xs flex-1"
          />
          {style.backgroundColor && (
            <button
              onClick={() => onUpdate({ backgroundColor: undefined })}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Padding */}
      <div className="space-y-2">
        <Label className="text-xs">Espacement vertical</Label>
        <Select value={style.paddingY || "md"} onValueChange={(v) => onUpdate({ paddingY: v as any })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PADDING_OPTIONS.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text alignment */}
      <div className="space-y-2">
        <Label className="text-xs">Alignement du texte</Label>
        <div className="flex gap-2">
          {(["left", "center"] as const).map(align => (
            <button
              key={align}
              onClick={() => onUpdate({ textAlign: align })}
              className={`flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors ${
                (style.textAlign || "left") === align
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {align === "left" ? "Gauche" : "Centré"}
            </button>
          ))}
        </div>
      </div>

      {/* Animation */}
      <div className="space-y-2">
        <Label className="text-xs">Animation d'entrée</Label>
        <Select value={style.animation || "none"} onValueChange={(v) => onUpdate({ animation: v as any })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANIMATION_OPTIONS.map(a => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {style.animation && style.animation !== "none" && (
        <div className="space-y-2">
          <Label className="text-xs">Délai (ms)</Label>
          <Select value={String(style.animationDelay || 0)} onValueChange={(v) => onUpdate({ animationDelay: Number(v) })}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 100, 200, 300, 500].map(d => (
                <SelectItem key={d} value={String(d)}>{d}ms</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
