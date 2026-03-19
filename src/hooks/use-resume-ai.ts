import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ResumeData } from "@/types/resume";

type AiAction = "enhance-bullet" | "generate-summary" | "suggest-skills" | "optimize-title";

export function useResumeAi() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { toast } = useToast();

  const callAi = async (action: AiAction, data: Record<string, unknown>): Promise<string | null> => {
    const key = `${action}-${JSON.stringify(data).slice(0, 50)}`;
    setLoadingAction(key);
    try {
      const { data: result, error } = await supabase.functions.invoke("resume-ai", {
        body: { action, data },
      });

      if (error) {
        const msg = typeof error === "object" && "message" in error ? (error as any).message : "Erreur IA";
        toast({ title: "Erreur IA", description: msg, variant: "destructive" });
        return null;
      }

      if (result?.error) {
        toast({ title: "Erreur IA", description: result.error, variant: "destructive" });
        return null;
      }

      return result?.result || null;
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible de contacter le service IA.", variant: "destructive" });
      return null;
    } finally {
      setLoadingAction(null);
    }
  };

  const enhanceBullet = async (bullet: string, position: string, jobTarget: string) => {
    return callAi("enhance-bullet", { bullet, position, jobTarget });
  };

  const generateSummary = async (resumeData: ResumeData) => {
    return callAi("generate-summary", { resumeData });
  };

  const suggestSkills = async (jobTarget: string, field: string, existingSkills: string[], category: string) => {
    const result = await callAi("suggest-skills", { jobTarget, field, existingSkills, category });
    if (!result) return [];
    try {
      const match = result.match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) as string[] : [];
    } catch {
      return [];
    }
  };

  const optimizeTitle = async (currentTitle: string, jobTarget: string) => {
    const result = await callAi("optimize-title", { currentTitle, jobTarget });
    if (!result) return [];
    try {
      const match = result.match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) as string[] : [];
    } catch {
      return [];
    }
  };

  return {
    enhanceBullet,
    generateSummary,
    suggestSkills,
    optimizeTitle,
    loadingAction,
    isLoading: loadingAction !== null,
  };
}
