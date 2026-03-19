import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = Deno.env.get("AI_GATEWAY_URL") || "https://api.openai.com/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    if (!AI_API_KEY) throw new Error("AI_API_KEY is not configured");

    const { resumeData, jobDescription } = await req.json();
    const pi = resumeData?.personalInfo || {};
    const exp = resumeData?.experience || [];
    const edu = resumeData?.education || [];
    const skills = resumeData?.skillCategories || [];

    const context = [
      `Candidat: ${pi.firstName || ""} ${pi.lastName || ""}`,
      `Email: ${pi.email || ""}`, `Téléphone: ${pi.phone || ""}`, `Ville: ${pi.city || ""}`,
      edu.length > 0 ? `Formation: ${edu.map((e: any) => `${e.degree} ${e.field} - ${e.institution}`).join("; ")}` : "",
      exp.length > 0 ? `Expérience: ${exp.map((e: any) => `${e.position} chez ${e.company}`).join("; ")}` : "",
      skills.filter((s: any) => s.skills?.length > 0).length > 0
        ? `Compétences: ${skills.filter((s: any) => s.skills?.length > 0).map((s: any) => s.skills.join(", ")).join("; ")}`
        : "",
    ].filter(Boolean).join("\n");

    const system = `Tu es un expert en rédaction de lettres de motivation professionnelles en français.
Règles:
- Rédige une lettre formelle et professionnelle
- Structure: objet, introduction, 2-3 paragraphes, conclusion avec formule de politesse
- Mets en avant les compétences et expériences pertinentes du candidat
- Si une description de poste est fournie, personnalise la lettre en fonction
- Ton professionnel mais pas trop rigide
- Adaptée au marché tunisien/francophone
- Ne mets PAS de crochets ou placeholders, utilise les vraies informations du candidat
- Réponds UNIQUEMENT avec la lettre, sans commentaire`;

    const userMsg = jobDescription
      ? `Informations du candidat:\n${context}\n\nDescription du poste:\n${jobDescription}`
      : `Informations du candidat:\n${context}\n\nGénère une lettre de motivation générique adaptable.`;

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${AI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, { role: "user", content: userMsg }],
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Erreur du service IA." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("cover-letter error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
