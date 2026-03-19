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

    const { resumeContext } = await req.json();

    const systemPrompt = `Tu es un expert en stratégie CV. Analyse le profil candidat ci-dessous et recommande quelles sections optionnelles activer dans son CV.

Profil :
- Poste visé : ${resumeContext.jobTitle || "Non renseigné"}
- Pays cible : ${resumeContext.targetCountry || "Non renseigné"}
- Domaine : ${resumeContext.jobField || "Non renseigné"}
- Niveau d'expérience : ${resumeContext.experienceLevel || "Non renseigné"}
- Mode simplifié : ${resumeContext.simplifiedMode ? "Oui (métier terrain)" : "Non"}

Sections optionnelles possibles :
- "projects" : Projets personnels ou professionnels
- "certifications" : Certifications et diplômes additionnels
- "languages" : Langues parlées
- "interests" : Centres d'intérêt

Réponds UNIQUEMENT avec un JSON valide (pas de markdown) :
{
  "suggestions": [
    {
      "section": "projects",
      "recommended": true,
      "reason": "Raison courte en français"
    }
  ]
}

Règles :
- Recommande 2-4 sections selon le profil
- Pour les métiers terrain (simplifiedMode), recommande certifications et langues, pas les projets
- Pour les profils tech, recommande projets et certifications
- Pour les profils seniors, recommande projets et langues
- Les centres d'intérêt sont rarement recommandés sauf pour les juniors ou les profils créatifs
- Sois concis dans les raisons (1 phrase max)`;

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
          { role: "user", content: "Quelles sections optionnelles dois-je activer pour ce profil ?" },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erreur du service IA." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("section-suggest error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
