import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages, resumeContext } = await req.json();

    const systemPrompt = `Tu es un assistant IA spécialisé en rédaction de CV et en recherche d'emploi, intégré dans un éditeur de CV.

Contexte du CV en cours de rédaction :
- Nom : ${resumeContext?.fullName || "Non renseigné"}
- Poste visé : ${resumeContext?.jobTitle || "Non renseigné"}
- Pays cible : ${resumeContext?.targetCountry || "Non renseigné"}
- Domaine : ${resumeContext?.jobField || "Non renseigné"}
- Niveau d'expérience : ${resumeContext?.experienceLevel || "Non renseigné"}
- Étape actuelle : ${resumeContext?.currentStep || "Non renseigné"}
- Nombre d'expériences : ${resumeContext?.experienceCount ?? 0}
- Nombre de formations : ${resumeContext?.educationCount ?? 0}
- Compétences : ${resumeContext?.skills || "Aucune"}
- Résumé existant : ${resumeContext?.summary ? "Oui" : "Non"}

Règles :
- Réponds en français sauf si l'utilisateur écrit dans une autre langue
- Sois concis et actionnable (2-4 phrases max par réponse)
- Donne des conseils spécifiques au contexte du CV (pays cible, domaine, niveau)
- Si on te demande d'écrire du contenu (bullet points, résumé, etc.), fournis-le directement
- Utilise le markdown pour formater tes réponses (listes, gras, etc.)
- Tu peux aider avec : rédaction de bullet points, résumés, choix de compétences, conseils ATS, adaptation au pays cible, formulation de titres de postes`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes. Réessayez dans quelques secondes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés. Rechargez votre compte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("resume-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
