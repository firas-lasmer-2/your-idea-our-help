import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  EyeOff,
  Loader2,
  Monitor,
  Paintbrush,
  Plus,
  Redo2,
  Smartphone,
  Sparkles,
  Tablet,
  Undo2,
  Upload,
  Wand2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import WebsitePreview from "./WebsitePreview";
import DraggableSectionList from "./DraggableSectionList";
import SectionStyleEditor from "./SectionStyleEditor";
import {
  createDefaultSections,
  FONT_OPTIONS,
  SECTION_LABELS,
  TEMPLATE_STYLES,
  type SectionType,
  type WebsiteCandidateProfile,
  type WebsiteGlobalSettings,
  type WebsiteSection,
  type WebsiteSectionStyle,
} from "@/types/website";
import {
  getWebsiteModeLabel,
  getWebsiteModeSections,
  normalizeWebsiteMode,
  normalizeWebsiteTrack,
} from "@/lib/website-system";
import { cn } from "@/lib/utils";

interface Props {
  sections: WebsiteSection[];
  purpose: string;
  profile?: WebsiteCandidateProfile;
  globalSettings: WebsiteGlobalSettings;
  title: string;
  template: string;
  onUpdateSection: (sectionId: string, content: Record<string, any>) => void;
  onUpdateSectionStyle?: (sectionId: string, style: Partial<WebsiteSectionStyle>) => void;
  onToggleSection: (sectionId: string) => void;
  onUpdateGlobalSettings: (updates: Partial<WebsiteGlobalSettings>) => void;
  onReorderSection?: (sectionId: string, direction: "up" | "down") => void;
  onReorderSections?: (orderedIds: string[]) => void;
  onAddSection?: (section: WebsiteSection) => void;
  onDuplicateSection?: (sectionId: string) => void;
  onRemoveSection?: (sectionId: string) => void;
  saving: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const accentColors = [
  { value: "#0f766e", label: "Teal" },
  { value: "#2563eb", label: "Blue" },
  { value: "#b45309", label: "Amber" },
  { value: "#7c3aed", label: "Purple" },
  { value: "#7c2d12", label: "Earth" },
  { value: "#1e293b", label: "Slate" },
];

export default function WebsiteEditor({
  sections,
  purpose,
  profile,
  globalSettings,
  title,
  template,
  onUpdateSection,
  onUpdateSectionStyle,
  onToggleSection,
  onUpdateGlobalSettings,
  onReorderSections,
  onAddSection,
  onDuplicateSection,
  onRemoveSection,
  saving,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: Props) {
  const { t } = useTranslation();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(sections[0]?.id || null);
  const [sidebarTab, setSidebarTab] = useState<"structure" | "style">("structure");
  const [editorMode, setEditorMode] = useState<"simple" | "advanced">("simple");
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { toast } = useToast();

  const websiteMode = normalizeWebsiteMode(profile?.mode || purpose);
  const candidateTrack = normalizeWebsiteTrack(profile?.candidateTrack);
  const allowedSectionTypes = useMemo(
    () => getWebsiteModeSections(websiteMode, candidateTrack),
    [websiteMode, candidateTrack],
  );
  const availableSectionTypes = allowedSectionTypes.filter(
    (type) => !sections.some((section) => section.type === type),
  );
  const selectedSection = sections.find((section) => section.id === selectedSectionId) || null;

  useEffect(() => {
    if (!sections.length) {
      setSelectedSectionId(null);
      return;
    }

    if (!selectedSectionId || !sections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  const handleAddSection = (type: SectionType) => {
    if (!onAddSection) return;
    const newSection = createDefaultSections([type])[0];
    if (!newSection) return;
    newSection.order = sections.length;
    onAddSection(newSection);
    setSelectedSectionId(newSection.id);
  };

  const handleRegenerate = useCallback(async (section: WebsiteSection) => {
    setRegeneratingId(section.id);
    try {
      const { data: result, error } = await supabase.functions.invoke("website-ai", {
        body: {
          mode: "regenerate",
          purpose: websiteMode,
          siteName: title,
          description: profile?.summary || "",
          goal: profile?.jobTitle || title,
          sections: [section.type],
          categoryContext: {
            candidateTrack,
            targetCountry: profile?.targetCountry,
            experienceLevel: profile?.experienceLevel,
            jobTitle: profile?.jobTitle,
          },
          candidateTrack,
          targetCountry: profile?.targetCountry,
          experienceLevel: profile?.experienceLevel,
        },
      });

      if (error || !result?.result?.sections?.[section.type]) {
        throw error || new Error(t("editor.regenError", "Impossible de régénérer cette section."));
      }

      onUpdateSection(section.id, result.result.sections[section.type]);
      toast({
        title: t("editor.sectionUpdated", "Section mise à jour"),
        description: `${SECTION_LABELS[section.type]} ${t("editor.regenerated", "a été régénérée pour ce profil.")}`,
      });
    } catch (error) {
      toast({
        title: t("website.aiError"),
        description: error instanceof Error ? error.message : t("editor.regenError", "Impossible de régénérer cette section."),
        variant: "destructive",
      });
    } finally {
      setRegeneratingId(null);
    }
  }, [candidateTrack, onUpdateSection, profile?.experienceLevel, profile?.jobTitle, profile?.summary, profile?.targetCountry, title, toast, websiteMode, t]);

  const handleImageUpload = useCallback(async (file: File, sectionId: string, field: string) => {
    try {
      const session = (await (supabase.auth as any).getSession()).data.session;
      if (!session) {
        throw new Error(t("editor.sessionExpired", "Session expirée."));
      }

      const ext = file.name.split(".").pop();
      const path = `${session.user.id}/${sectionId}/${field}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("website-assets").upload(path, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from("website-assets").getPublicUrl(path);
      onUpdateSection(sectionId, { [field]: data.publicUrl });
      toast({ title: t("editor.imageAdded", "Image ajoutée") });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("editor.uploadFailed", "Échec de l'upload."),
        variant: "destructive",
      });
    }
  }, [onUpdateSection, toast, t]);

  const handleGalleryUpload = useCallback(async (file: File, sectionId: string, index: number, items: any[]) => {
    try {
      const session = (await (supabase.auth as any).getSession()).data.session;
      if (!session) {
        throw new Error(t("editor.sessionExpired", "Session expirée."));
      }

      const ext = file.name.split(".").pop();
      const path = `${session.user.id}/${sectionId}/item-${index}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("website-assets").upload(path, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from("website-assets").getPublicUrl(path);
      const nextItems = [...items];
      nextItems[index] = { ...nextItems[index], image: data.publicUrl };
      onUpdateSection(sectionId, { items: nextItems });
      toast({ title: t("editor.imageAdded", "Image ajoutée") });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("editor.uploadFailed", "Échec de l'upload."),
        variant: "destructive",
      });
    }
  }, [onUpdateSection, toast, t]);

  if (showPreview) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed right-4 top-4 z-50">
          <Button variant="outline" className="gap-2 bg-background shadow-md" onClick={() => setShowPreview(false)}>
            <EyeOff className="h-4 w-4" />
            {t("editor.exitPreview", "Quitter l'aperçu")}
          </Button>
        </div>
        <WebsitePreview sections={sections} globalSettings={globalSettings} title={title} template={template} />
      </div>
    );
  }

  const previewWidth = previewDevice === "mobile" ? "375px" : previewDevice === "tablet" ? "768px" : "100%";

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="flex w-80 shrink-0 flex-col border-r bg-background">
        <div className="border-b p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{getWebsiteModeLabel(websiteMode)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {profile?.jobTitle || t("editor.publicProfile", "Profil public")} · {profile?.targetCountry || t("editor.targetMarket", "marché cible")}
              </p>
            </div>
            <Button
              variant={editorMode === "advanced" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setEditorMode((mode) => mode === "simple" ? "advanced" : "simple")}
            >
              <Wand2 className="h-3.5 w-3.5" />
              {editorMode === "simple" ? t("editor.advancedMode", "Mode avancé") : t("editor.simpleMode", "Mode simple")}
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
            <button
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                sidebarTab === "structure" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setSidebarTab("structure")}
            >
              {t("editor.structure", "Structure")}
            </button>
            <button
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                sidebarTab === "style" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setSidebarTab("style")}
            >
              <Paintbrush className="mr-1 inline h-3.5 w-3.5" />
              {t("editor.style", "Style")}
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {sidebarTab === "structure" ? (
            <div className="space-y-4 p-4">
              <Card className="border-dashed">
                <CardContent className="space-y-2 p-4 text-sm">
                  <p className="font-medium text-foreground">
                    {editorMode === "simple" ? t("editor.guidedFlow", "Flux guidé") : t("editor.advancedControl", "Contrôle avancé")}
                  </p>
                  <p className="text-muted-foreground">
                    {editorMode === "simple"
                      ? t("editor.guidedFlowDesc", "Concentrez-vous sur le contenu essentiel. Les sections sont déjà ordonnées pour un recruteur.")
                      : t("editor.advancedControlDesc", "Ajoutez des sections compatibles, changez le style et régénérez le contenu si nécessaire.")}
                  </p>
                </CardContent>
              </Card>

              {onReorderSections ? (
                <DraggableSectionList
                  sections={sections}
                  selectedId={selectedSectionId}
                  onSelect={setSelectedSectionId}
                  onToggle={onToggleSection}
                  onDuplicate={editorMode === "advanced" ? onDuplicateSection : undefined}
                  onReorder={onReorderSections}
                />
              ) : null}

              {editorMode === "advanced" && availableSectionTypes.length > 0 && onAddSection ? (
                <Select onValueChange={(value) => handleAddSection(value as SectionType)}>
                  <SelectTrigger className="border-dashed">
                    <Plus className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t("editor.addSection", "Ajouter une section utile")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSectionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {SECTION_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6 p-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t("editor.primaryColor", "Couleur principale")}</Label>
                <div className="flex flex-wrap gap-2">
                  {accentColors.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-transform",
                        globalSettings.primaryColor === colorOption.value ? "scale-110 border-foreground" : "border-transparent",
                      )}
                      style={{ backgroundColor: colorOption.value }}
                      onClick={() => onUpdateGlobalSettings({ primaryColor: colorOption.value })}
                    />
                  ))}
                </div>
                {editorMode === "advanced" ? (
                  <input
                    type="color"
                    value={globalSettings.primaryColor}
                    onChange={(event) => onUpdateGlobalSettings({ primaryColor: event.target.value })}
                    className="h-8 w-8 cursor-pointer rounded-full border border-dashed border-border bg-transparent"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">{t("editor.colorHint", "Palette guidée par défaut. La couleur libre reste disponible en mode avancé.")}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t("editor.font", "Police")}</Label>
                <Select value={globalSettings.fontPair} onValueChange={(value) => onUpdateGlobalSettings({ fontPair: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t("editor.layout", "Mise en page")}</Label>
                <div className="space-y-2">
                  {TEMPLATE_STYLES.map((styleOption) => (
                    <label key={styleOption.value} className="flex cursor-pointer items-start gap-2 rounded-lg border p-3">
                      <input
                        type="radio"
                        name="layout"
                        className="mt-1 accent-primary"
                        checked={globalSettings.layout === styleOption.value}
                        onChange={() => onUpdateGlobalSettings({ layout: styleOption.value })}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{styleOption.label}</p>
                        <p className="text-xs text-muted-foreground">{styleOption.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("editor.metaDescription", "Meta description")}</Label>
                <Textarea
                  rows={3}
                  value={globalSettings.metaDescription || ""}
                  onChange={(event) => onUpdateGlobalSettings({ metaDescription: event.target.value })}
                  placeholder={t("editor.metaPlaceholder", "Décrivez votre profil professionnel pour Google et le partage social.")}
                />
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="space-y-2 border-t p-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onUndo} disabled={!canUndo}>
              <Undo2 className="h-3.5 w-3.5" />
              {t("editor.undo", "Annuler")}
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onRedo} disabled={!canRedo}>
              <Redo2 className="h-3.5 w-3.5" />
              {t("editor.redo", "Refaire")}
            </Button>
          </div>
          <Button className="w-full gap-2" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4" />
            {t("editor.fullPreview", "Aperçu plein écran")}
          </Button>
        </div>
      </aside>

      <section className="flex w-[420px] shrink-0 flex-col border-r bg-background">
        {selectedSection ? (
          <ScrollArea className="flex-1">
            <div className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{SECTION_LABELS[selectedSection.type]}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {editorMode === "simple"
                      ? t("editor.editBasicContent", "Modifiez le contenu de base pour ce profil public.")
                      : t("editor.editAdvancedContent", "Vous pouvez éditer, styliser et régénérer cette section.")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSection.type !== "navbar" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={regeneratingId === selectedSection.id || saving}
                      onClick={() => handleRegenerate(selectedSection)}
                    >
                      {regeneratingId === selectedSection.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      {t("editor.ai", "IA")}
                    </Button>
                  ) : null}
                  <Switch checked={selectedSection.enabled} onCheckedChange={() => onToggleSection(selectedSection.id)} />
                </div>
              </div>

              <SectionEditor
                section={selectedSection}
                onUpdate={(updates) => onUpdateSection(selectedSection.id, updates)}
                onImageUpload={(file, field) => handleImageUpload(file, selectedSection.id, field)}
                onItemImageUpload={(file, index, items) => handleGalleryUpload(file, selectedSection.id, index, items)}
              />

              {editorMode === "advanced" && selectedSection.type !== "navbar" && onUpdateSectionStyle ? (
                <SectionStyleEditor
                  style={selectedSection.style || {}}
                  onUpdate={(updates) => onUpdateSectionStyle(selectedSection.id, updates)}
                />
              ) : null}

              {editorMode === "advanced" && onRemoveSection && selectedSection.type !== "navbar" ? (
                <Button variant="outline" className="w-full" onClick={() => onRemoveSection(selectedSection.id)}>
                  {t("editor.removeSection", "Retirer cette section")}
                </Button>
              ) : null}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {t("editor.selectSection", "Sélectionnez une section dans la colonne de gauche.")}
          </div>
        )}
      </section>

      <section className="flex flex-1 flex-col overflow-hidden bg-muted/30">
        <div className="flex items-center justify-between border-b bg-background p-2">
          <div className="flex items-center gap-1">
            <Button variant={previewDevice === "desktop" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setPreviewDevice("desktop")}>
              <Monitor className="h-4 w-4" />
            </Button>
            <Button variant={previewDevice === "tablet" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setPreviewDevice("tablet")}>
              <Tablet className="h-4 w-4" />
            </Button>
            <Button variant={previewDevice === "mobile" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setPreviewDevice("mobile")}>
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {profile?.jobTitle || title} · {getWebsiteModeLabel(websiteMode)}
          </p>
          <div className="w-16" />
        </div>

        <div className="flex flex-1 items-start justify-center overflow-auto p-4">
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ width: previewWidth, maxWidth: "100%" }}>
            <WebsitePreview sections={sections} globalSettings={globalSettings} title={title} template={template} />
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionEditor({
  section,
  onUpdate,
  onImageUpload,
  onItemImageUpload,
}: {
  section: WebsiteSection;
  onUpdate: (content: Record<string, any>) => void;
  onImageUpload: (file: File, field: string) => void;
  onItemImageUpload: (file: File, index: number, items: any[]) => void;
}) {
  const { t } = useTranslation();
  const { type, content } = section;

  const updateField = (key: string, value: any) => onUpdate({ [key]: value });
  const updateItem = (index: number, updates: Record<string, any>) => {
    const items = [...(content.items || [])];
    items[index] = { ...items[index], ...updates };
    onUpdate({ items });
  };
  const removeItem = (index: number) => {
    onUpdate({ items: (content.items || []).filter((_: unknown, itemIndex: number) => itemIndex !== index) });
  };
  const addItem = () => {
    onUpdate({ items: [...(content.items || []), getEmptyItem(type)] });
  };

  return (
    <div className="space-y-4">
      {type === "navbar" ? (
        <>
          <div className="space-y-2">
            <Label>{t("editor.displayName", "Nom affiché")}</Label>
            <Input value={content.logoText || ""} onChange={(event) => updateField("logoText", event.target.value)} placeholder={t("editor.myProfile", "Mon profil pro")} />
          </div>
          <div className="space-y-2">
            <Label>{t("editor.style", "Style")}</Label>
            <Select value={content.style || "sticky"} onValueChange={(value) => updateField("style", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sticky">{t("editor.fixed", "Fixe")}</SelectItem>
                <SelectItem value="static">{t("editor.static", "Statique")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      ) : null}

      {type !== "navbar" && content.title !== undefined ? (
        <div className="space-y-2">
          <Label>{t("editor.sectionTitle", "Titre de section")}</Label>
          <Input value={content.title || ""} onChange={(event) => updateField("title", event.target.value)} />
        </div>
      ) : null}

      {type === "hero" ? (
        <>
          <div className="space-y-2">
            <Label>{t("editor.mainTitle", "Titre principal")}</Label>
            <Input value={content.title || ""} onChange={(event) => updateField("title", event.target.value)} placeholder={t("editor.mainTitlePlaceholder", "Nom complet ou accroche forte")} />
          </div>
          <div className="space-y-2">
            <Label>{t("editor.subtitle", "Sous-titre")}</Label>
            <Textarea value={content.subtitle || ""} onChange={(event) => updateField("subtitle", event.target.value)} rows={3} placeholder={t("editor.subtitlePlaceholder", "Poste ciblé, pays, disponibilité...")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("editor.mainButton", "Bouton principal")}</Label>
              <Input value={content.cta || ""} onChange={(event) => updateField("cta", event.target.value)} placeholder={t("editor.contactMe", "Me contacter")} />
            </div>
            <div className="space-y-2">
              <Label>{t("editor.buttonLink", "Lien du bouton")}</Label>
              <Input value={content.ctaLink || ""} onChange={(event) => updateField("ctaLink", event.target.value)} placeholder="#contact" />
            </div>
          </div>
          <ImageField
            label={t("editor.backgroundImage", "Image de fond")}
            value={content.backgroundImage}
            onUpload={(file) => onImageUpload(file, "backgroundImage")}
            onClear={() => updateField("backgroundImage", "")}
          />
        </>
      ) : null}

      {type === "about" ? (
        <>
          <div className="space-y-2">
            <Label>{t("editor.introText", "Texte de présentation")}</Label>
            <Textarea value={content.text || ""} onChange={(event) => updateField("text", event.target.value)} rows={5} />
          </div>
          <ImageField
            label={t("editor.photo", "Photo")}
            value={content.image}
            onUpload={(file) => onImageUpload(file, "image")}
            onClear={() => updateField("image", "")}
          />
        </>
      ) : null}

      {type === "contact" ? (
        <>
          <div className="space-y-2">
            <Label>{t("editor.introductionText", "Texte d'introduction")}</Label>
            <Textarea value={content.text || ""} onChange={(event) => updateField("text", event.target.value)} rows={2} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={content.email || ""} onChange={(event) => updateField("email", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("editor.phone", "Téléphone")}</Label>
              <Input value={content.phone || ""} onChange={(event) => updateField("phone", event.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={content.whatsapp || ""} onChange={(event) => updateField("whatsapp", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("editor.address", "Adresse")}</Label>
              <Input value={content.address || ""} onChange={(event) => updateField("address", event.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={content.showForm !== false} onCheckedChange={(checked) => updateField("showForm", checked)} />
            <Label className="text-sm">{t("editor.showForm", "Afficher le formulaire")}</Label>
          </div>
        </>
      ) : null}

      {type === "social-links" ? (
        <div className="grid gap-3">
          {["linkedin", "github", "whatsapp", "instagram", "facebook", "twitter", "youtube"].map((platform) => (
            <div key={platform} className="space-y-1">
              <Label className="capitalize">{platform}</Label>
              <Input value={content[platform] || ""} onChange={(event) => updateField(platform, event.target.value)} placeholder={`${t("editor.link", "Lien")} ${platform}`} />
            </div>
          ))}
        </div>
      ) : null}

      {content.items !== undefined ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">{t("editor.elements", "Éléments")}</Label>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={addItem}>
              <Plus className="h-3.5 w-3.5" />
              {t("editor.add", "Ajouter")}
            </Button>
          </div>
          {(content.items || []).map((item: any, index: number) => (
            <Card key={`${type}-${index}`}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t("editor.element", "Élément")} {index + 1}</p>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                    {t("editor.remove", "Retirer")}
                  </Button>
                </div>
                <ItemEditor
                  type={type}
                  item={item}
                  onUpdate={(updates) => updateItem(index, updates)}
                  onImageUpload={(file) => onItemImageUpload(file, index, content.items || [])}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ItemEditor({
  type,
  item,
  onUpdate,
  onImageUpload,
}: {
  type: SectionType;
  item: any;
  onUpdate: (updates: Record<string, any>) => void;
  onImageUpload?: (file: File) => void;
}) {
  const { t } = useTranslation();

  switch (type) {
    case "skills":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.skill", "Compétence")}</Label>
            <Input value={item.name || ""} onChange={(event) => onUpdate({ name: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.level", "Niveau")}</Label>
            <Input type="number" min="0" max="100" value={item.level || ""} onChange={(event) => onUpdate({ level: event.target.value })} />
          </div>
        </div>
      );
    case "credentials":
      return (
        <div className="grid gap-3">
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.certification", "Permis ou certification")}</Label>
            <Input value={item.name || ""} onChange={(event) => onUpdate({ name: event.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("editor.issuer", "Émetteur")}</Label>
              <Input value={item.issuer || ""} onChange={(event) => onUpdate({ issuer: event.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("editor.detail", "Détail")}</Label>
              <Input value={item.detail || ""} onChange={(event) => onUpdate({ detail: event.target.value })} placeholder={t("editor.detailPlaceholder", "Valide, 2025, CE...")} />
            </div>
          </div>
        </div>
      );
    case "availability":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.label", "Libellé")}</Label>
            <Input value={item.label || ""} onChange={(event) => onUpdate({ label: event.target.value })} placeholder={t("editor.availability", "Disponibilité")} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.value", "Valeur")}</Label>
            <Input value={item.value || ""} onChange={(event) => onUpdate({ value: event.target.value })} placeholder={t("editor.immediate", "Immédiate")} />
          </div>
        </div>
      );
    case "languages":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.language", "Langue")}</Label>
            <Input value={item.name || ""} onChange={(event) => onUpdate({ name: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.level", "Niveau")}</Label>
            <Input value={item.level || ""} onChange={(event) => onUpdate({ level: event.target.value })} placeholder={t("editor.levelPlaceholder", "Courant, B2...")} />
          </div>
        </div>
      );
    case "projects":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.projectName", "Nom du projet")}</Label>
            <Input value={item.name || ""} onChange={(event) => onUpdate({ name: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.description", "Description")}</Label>
            <Textarea value={item.description || ""} onChange={(event) => onUpdate({ description: event.target.value })} rows={3} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tags</Label>
            <Input
              value={(item.tags || []).join(", ")}
              onChange={(event) => onUpdate({ tags: event.target.value.split(",").map((tag: string) => tag.trim()).filter(Boolean) })}
              placeholder="React, UI, mobile..."
            />
          </div>
          <ImageField
            label={t("editor.projectImage", "Image du projet")}
            value={item.image}
            onUpload={(file) => onImageUpload?.(file)}
            onClear={() => onUpdate({ image: "" })}
          />
        </div>
      );
    case "experience":
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("editor.position", "Poste")}</Label>
              <Input value={item.position || ""} onChange={(event) => onUpdate({ position: event.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("editor.company", "Entreprise")}</Label>
              <Input value={item.company || ""} onChange={(event) => onUpdate({ company: event.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.period", "Période")}</Label>
            <Input value={item.period || ""} onChange={(event) => onUpdate({ period: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.description", "Description")}</Label>
            <Textarea value={item.description || ""} onChange={(event) => onUpdate({ description: event.target.value })} rows={3} />
          </div>
        </div>
      );
    case "education":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.degree", "Diplôme")}</Label>
            <Input value={item.degree || ""} onChange={(event) => onUpdate({ degree: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.institution", "Établissement")}</Label>
            <Input value={item.institution || ""} onChange={(event) => onUpdate({ institution: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.period", "Période")}</Label>
            <Input value={item.period || ""} onChange={(event) => onUpdate({ period: event.target.value })} />
          </div>
        </div>
      );
    case "stats":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.value", "Valeur")}</Label>
            <Input value={item.number || ""} onChange={(event) => onUpdate({ number: event.target.value })} placeholder="5+" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("editor.label", "Libellé")}</Label>
            <Input value={item.label || ""} onChange={(event) => onUpdate({ label: event.target.value })} placeholder={t("editor.yearsExperience", "Années d'expérience")} />
          </div>
        </div>
      );
    default:
      return (
        <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          {t("editor.noDetailPanel", "Cette section n'a pas encore de panneau d'édition détaillé.")}
        </div>
      );
  }
}

function ImageField({
  label,
  value,
  onUpload,
  onClear,
}: {
  label: string;
  value?: string;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="space-y-2">
          <img src={value} alt="" className="h-32 w-full rounded-lg object-cover" />
          <Button variant="outline" size="sm" onClick={onClear}>
            {t("editor.removeImage", "Retirer l'image")}
          </Button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:bg-muted/50">
          <Upload className="h-4 w-4" />
          <span>{t("editor.chooseImage", "Choisir une image")}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
      )}
    </div>
  );
}

function getEmptyItem(type: SectionType) {
  switch (type) {
    case "skills":
      return { name: "", level: 80 };
    case "credentials":
      return { name: "", issuer: "", detail: "" };
    case "availability":
      return { label: "", value: "" };
    case "languages":
      return { name: "", level: "" };
    case "projects":
      return { name: "", description: "", tags: [], image: "" };
    case "experience":
      return { position: "", company: "", period: "", description: "" };
    case "education":
      return { degree: "", institution: "", period: "" };
    case "stats":
      return { number: "", label: "" };
    default:
      return {};
  }
}
