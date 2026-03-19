import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ResumeData, ResumeCustomization, defaultResumeData, defaultCustomization } from "@/types/resume";
import { useToast } from "@/hooks/use-toast";
import { ensureGrowthProfile, trackProductEvent } from "@/lib/product-events";
import { normalizeResumeTemplateId } from "@/lib/template-recommendations";

const auth = supabase.auth as any;

export function useResume(resumeId?: string) {
  const [data, setData] = useState<ResumeData>(defaultResumeData);
  const [customization, setCustomization] = useState<ResumeCustomization>(defaultCustomization);
  const [currentStep, setCurrentStep] = useState(1);
  const [template, setTemplate] = useState("horizon");
  const [title, setTitle] = useState("Mon CV");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!resumeId);
  const [id, setId] = useState<string | undefined>(resumeId);
  const { toast } = useToast();
  const saveTimeout = useRef<NodeJS.Timeout>();

  // Load resume
  useEffect(() => {
    if (!resumeId) return;
    (async () => {
      const { data: resume, error } = await (supabase as any)
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .single();
      if (error) {
        toast({ title: "Erreur", description: "CV introuvable.", variant: "destructive" });
      } else if (resume) {
        setData(resume.data as ResumeData);
        setCustomization(resume.customization as ResumeCustomization);
        setCurrentStep(resume.current_step);
        setTemplate(normalizeResumeTemplateId(resume.template));
        setTitle(resume.title);
        setLastSavedAt(resume.updated_at);
      }
      setLoading(false);
    })();
  }, [resumeId]);

  // Auto-save with debounce
  const save = useCallback(async (
    overrides?: Partial<{ data: ResumeData; customization: ResumeCustomization; currentStep: number; template: string; title: string }>
  ) => {
    const session = (await auth.getSession()).data.session;
    if (!session) {
      setSaveError("Votre session a expiré. Reconnectez-vous pour sauvegarder.");
      return false;
    }

    const savedAt = new Date().toISOString();
    const payload = {
      data: overrides?.data ?? data,
      customization: overrides?.customization ?? customization,
      current_step: overrides?.currentStep ?? currentStep,
      template: overrides?.template ?? template,
      title: overrides?.title ?? title,
      updated_at: savedAt,
    };

    setSaving(true);
    setSaveError(null);
    try {
      if (id) {
        const { error } = await (supabase as any).from("resumes").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data: created, error } = await (supabase as any)
          .from("resumes")
          .insert({ ...payload, user_id: session.user.id })
          .select()
          .single();
        if (error) throw error;
        if (created) {
          setId(created.id);
          await ensureGrowthProfile(session.user.id, { onboarding_status: "resume_started" });
          await trackProductEvent("resume_started", {
            userId: session.user.id,
            data: {
              resumeId: created.id,
              currentStep: payload.current_step,
              template: payload.template,
            },
          });
        }
      }
      setLastSavedAt(savedAt);
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Impossible de sauvegarder votre CV.");
      return false;
    }
    finally {
      setSaving(false);
    }
  }, [data, customization, currentStep, template, title, id]);

  const autoSave = useCallback((
    overrides?: Partial<{ data: ResumeData; customization: ResumeCustomization; currentStep: number; template: string; title: string }>
  ) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => save(overrides), 1500);
  }, [save]);

  const updateData = useCallback((updates: Partial<ResumeData>) => {
    setData(prev => {
      const next = { ...prev, ...updates };
      autoSave({ data: next });
      return next;
    });
  }, [autoSave]);

  const updateCustomization = useCallback((updates: Partial<ResumeCustomization>) => {
    setCustomization(prev => {
      const next = { ...prev, ...updates };
      autoSave({ customization: next });
      return next;
    });
  }, [autoSave]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    autoSave({ currentStep: step });
  }, [autoSave]);

  return {
    data, updateData,
    customization, updateCustomization,
    currentStep, goToStep,
    template, setTemplate: (t: string) => {
      const normalized = normalizeResumeTemplateId(t);
      setTemplate(normalized);
      autoSave({ template: normalized });
    },
    title, setTitle: (t: string) => { setTitle(t); autoSave({ title: t }); },
    saving, saveError, lastSavedAt, loading, id,
    clearSaveError: () => setSaveError(null),
    save,
  };
}
