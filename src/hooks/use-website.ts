import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WebsiteData, WebsiteGlobalSettings, WebsiteSection, WebsiteSectionStyle, defaultGlobalSettings } from "@/types/website";
import { useToast } from "@/hooks/use-toast";
import { ensureGrowthProfile, incrementUsageCounter, trackProductEvent } from "@/lib/product-events";
import { normalizeWebsiteTemplateId } from "@/lib/template-recommendations";
import { normalizeWebsiteData } from "@/lib/website-system";

const auth = supabase.auth as any;
const MAX_HISTORY = 30;

interface HistoryEntry {
  data: WebsiteData;
  globalSettings: WebsiteGlobalSettings;
}

export function useWebsite(websiteId?: string) {
  const [data, setData] = useState<WebsiteData>({ sections: [] });
  const [globalSettings, setGlobalSettings] = useState<WebsiteGlobalSettings>(defaultGlobalSettings);
  const [title, setTitleState] = useState("Mon profil pro");
  const [purpose, setPurpose] = useState("profile");
  const [template, setTemplateState] = useState("profile-clean");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!websiteId);
  const [id, setId] = useState<string | undefined>(websiteId);
  const [isPublished, setIsPublished] = useState(false);
  const [slug, setSlugState] = useState<string | null>(null);
  const { toast } = useToast();
  const saveTimeout = useRef<NodeJS.Timeout>();

  // Undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  const pushHistory = useCallback((d: WebsiteData, gs: WebsiteGlobalSettings) => {
    if (isUndoRedo.current) { isUndoRedo.current = false; return; }
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, { data: JSON.parse(JSON.stringify(d)), globalSettings: JSON.parse(JSON.stringify(gs)) }];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo) return;
    isUndoRedo.current = true;
    const entry = history[historyIndex - 1];
    setData(entry.data);
    setGlobalSettings(entry.globalSettings);
    setHistoryIndex(prev => prev - 1);
    autoSave({ data: entry.data, globalSettings: entry.globalSettings });
  }, [canUndo, history, historyIndex]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    isUndoRedo.current = true;
    const entry = history[historyIndex + 1];
    setData(entry.data);
    setGlobalSettings(entry.globalSettings);
    setHistoryIndex(prev => prev + 1);
    autoSave({ data: entry.data, globalSettings: entry.globalSettings });
  }, [canRedo, history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const load = useCallback(async (wId: string) => {
    const { data: site, error } = await (supabase as any)
      .from("websites").select("*").eq("id", wId).single();
    if (error) {
      toast({ title: "Erreur", description: "Site introuvable.", variant: "destructive" });
    } else if (site) {
      const normalizedData = normalizeWebsiteData(site.data as WebsiteData, site.purpose);
      setData(normalizedData);
      setGlobalSettings(site.global_settings as WebsiteGlobalSettings);
      setTitleState(site.title);
      setPurpose(site.purpose);
      setTemplateState(normalizeWebsiteTemplateId(site.template, site.purpose));
      setId(site.id);
      setIsPublished(site.is_published || false);
      setSlugState(site.slug || null);
      setLastSavedAt(site.updated_at);
      // Init history
      setHistory([{ data: normalizedData, globalSettings: site.global_settings as WebsiteGlobalSettings }]);
      setHistoryIndex(0);
    }
    setLoading(false);
  }, [toast]);

  const save = useCallback(async (overrides?: Partial<{
    data: WebsiteData; globalSettings: WebsiteGlobalSettings; title: string; purpose: string; template: string; slug: string | null;
  }>) => {
    const session = (await auth.getSession()).data.session;
    if (!session) {
      setSaveError("Votre session a expiré. Reconnectez-vous pour sauvegarder.");
      return false;
    }

    const savedAt = new Date().toISOString();
    const payload = {
      data: normalizeWebsiteData(overrides?.data ?? data, overrides?.purpose ?? purpose),
      global_settings: overrides?.globalSettings ?? globalSettings,
      title: overrides?.title ?? title,
      purpose: overrides?.purpose ?? purpose,
      template: overrides?.template ?? template,
      slug: overrides?.slug !== undefined ? overrides.slug : slug,
      updated_at: savedAt,
    };

    setSaving(true);
    setSaveError(null);
    try {
      if (id) {
        const { error } = await (supabase as any).from("websites").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data: created, error } = await (supabase as any)
          .from("websites")
          .insert({ ...payload, user_id: session.user.id, is_complete: true })
          .select().single();
        if (error) throw error;
        if (created) {
          setId(created.id);
          await ensureGrowthProfile(session.user.id);
          await trackProductEvent("website_started", {
            userId: session.user.id,
            data: {
              websiteId: created.id,
              purpose: payload.purpose,
              template: payload.template,
            },
          });
        }
      }
      setLastSavedAt(savedAt);
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Impossible de sauvegarder votre site.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [data, globalSettings, title, purpose, template, id, slug]);

  const autoSave = useCallback((overrides?: Parameters<typeof save>[0]) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => save(overrides), 1500);
  }, [save]);

  const updateSection = useCallback((sectionId: string, content: Record<string, any>) => {
    setData(prev => {
      const next = {
        ...prev,
        sections: prev.sections.map(s => s.id === sectionId ? { ...s, content: { ...s.content, ...content } } : s),
      };
      pushHistory(next, globalSettings);
      autoSave({ data: next });
      return next;
    });
  }, [autoSave, pushHistory, globalSettings]);

  const updateSectionStyle = useCallback((sectionId: string, style: Partial<WebsiteSectionStyle>) => {
    setData(prev => {
      const next = {
        ...prev,
        sections: prev.sections.map(s => s.id === sectionId ? { ...s, style: { ...s.style, ...style } } : s),
      };
      pushHistory(next, globalSettings);
      autoSave({ data: next });
      return next;
    });
  }, [autoSave, pushHistory, globalSettings]);

  const toggleSection = useCallback((sectionId: string) => {
    setData(prev => {
      const next = {
        ...prev,
        sections: prev.sections.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s),
      };
      pushHistory(next, globalSettings);
      autoSave({ data: next });
      return next;
    });
  }, [autoSave, pushHistory, globalSettings]);

  const reorderSections = useCallback((orderedIds: string[]) => {
    setData(prev => {
      const sections = orderedIds.map((id, idx) => {
        const s = prev.sections.find(sec => sec.id === id);
        return s ? { ...s, order: idx } : null;
      }).filter(Boolean) as WebsiteSection[];
      const next = { ...prev, sections };
      pushHistory(next, globalSettings);
      autoSave({ data: next });
      return next;
    });
  }, [autoSave, pushHistory, globalSettings]);

  const reorderSection = useCallback((sectionId: string, direction: "up" | "down") => {
    setData(prev => {
      const sections = [...prev.sections];
      const idx = sections.findIndex(s => s.id === sectionId);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sections.length) return prev;

      const tempOrder = sections[idx].order;
      sections[idx] = { ...sections[idx], order: sections[swapIdx].order };
      sections[swapIdx] = { ...sections[swapIdx], order: tempOrder };
      sections.sort((a, b) => a.order - b.order);

      const next = { ...prev, sections };
      pushHistory(next, globalSettings);
      autoSave({ data: next });
      return next;
    });
  }, [autoSave, pushHistory, globalSettings]);

  const addSection = useCallback((section: WebsiteSection) => {
    setData(prev => {
      const next = { ...prev, sections: [...prev.sections, section] };
      pushHistory(next, globalSettings);
      autoSave({ data: next });
      return next;
    });
  }, [autoSave, pushHistory, globalSettings]);

  const duplicateSection = useCallback((sectionId: string) => {
    setData(prev => {
      const source = prev.sections.find(s => s.id === sectionId);
      if (!source) return prev;
      const clone: WebsiteSection = {
        ...source,
        id: crypto.randomUUID(),
        order: prev.sections.length,
        content: JSON.parse(JSON.stringify(source.content)),
        style: source.style ? JSON.parse(JSON.stringify(source.style)) : undefined,
      };
      const next = { ...prev, sections: [...prev.sections, clone] };
      pushHistory(next, globalSettings);
      autoSave({ data: next });
      return next;
    });
  }, [autoSave, pushHistory, globalSettings]);

  const removeSection = useCallback((sectionId: string) => {
    setData(prev => {
      const next = { ...prev, sections: prev.sections.filter(s => s.id !== sectionId) };
      pushHistory(next, globalSettings);
      autoSave({ data: next });
      return next;
    });
  }, [autoSave, pushHistory, globalSettings]);

  const setFullData = useCallback((next: WebsiteData) => {
    const normalized = normalizeWebsiteData(next, purpose);
    setData(normalized);
    pushHistory(normalized, globalSettings);
    autoSave({ data: normalized });
  }, [autoSave, pushHistory, globalSettings, purpose]);

  const updateGlobalSettings = useCallback((updates: Partial<WebsiteGlobalSettings>) => {
    setGlobalSettings(prev => {
      const next = { ...prev, ...updates };
      pushHistory(data, next);
      autoSave({ globalSettings: next });
      return next;
    });
  }, [autoSave, pushHistory, data]);

  const setTitle = useCallback((t: string) => {
    setTitleState(t);
    autoSave({ title: t });
  }, [autoSave]);

  const setTemplate = useCallback((t: string) => {
    const normalized = normalizeWebsiteTemplateId(t, purpose as any);
    setTemplateState(normalized);
    autoSave({ template: normalized });
  }, [autoSave]);

  const setSlug = useCallback(async (s: string | null) => {
    const previousSlug = slug;
    setSlugState(s);
    const success = await save({ slug: s });
    if (!success) {
      setSlugState(previousSlug);
      return false;
    }
    return true;
  }, [save, slug]);

  const publish = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updatedAt = new Date().toISOString();
      const { error } = await (supabase as any).from("websites").update({
        is_published: true,
        published_data: data,
        updated_at: updatedAt,
      }).eq("id", id);
      if (error) throw error;
      setIsPublished(true);
      setLastSavedAt(updatedAt);
      await incrementUsageCounter("websites_published_count");
      await trackProductEvent("website_published", {
        data: { websiteId: id, slug, template, purpose },
      });
      toast({ title: "Site publié ! 🎉", description: "Votre site est maintenant accessible publiquement." });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de la publication.";
      setSaveError(message);
      toast({ title: "Erreur", description: message, variant: "destructive" });
      return false;
    } finally {
      setSaving(false);
    }
  }, [id, data, slug, template, purpose, toast]);

  const unpublish = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updatedAt = new Date().toISOString();
      const { error } = await (supabase as any).from("websites").update({
        is_published: false,
        updated_at: updatedAt,
      }).eq("id", id);
      if (error) throw error;
      setIsPublished(false);
      setLastSavedAt(updatedAt);
      toast({ title: "Site dépublié", description: "Le site n'est plus accessible publiquement." });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec de la dépublication.";
      setSaveError(message);
      toast({ title: "Erreur", description: message, variant: "destructive" });
      return false;
    } finally {
      setSaving(false);
    }
  }, [id, toast]);

  return {
    data, setFullData, updateSection, updateSectionStyle, toggleSection, reorderSection, reorderSections,
    addSection, duplicateSection, removeSection,
    globalSettings, updateGlobalSettings,
    title, setTitle, purpose, setPurpose,
    template, setTemplate,
    slug, setSlug,
    saving, saveError, lastSavedAt, loading, id,
    clearSaveError: () => setSaveError(null),
    save, load,
    isPublished, publish, unpublish,
    canUndo, canRedo, undo, redo,
  };
}
