import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeData } = await req.json();
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    if (!AI_API_KEY) throw new Error("AI_API_KEY not configured");

    const prompt = `Tu es un expert en recrutement et systèmes ATS. Analyse ce CV et donne un score ATS de 0 à 100.

CV Data:
${JSON.stringify(resumeData, null, 2)}

Évalue les catégories suivantes:
1. Informations personnelles (max 15): nom, email, téléphone, ville, LinkedIn
2. Expérience professionnelle (max 25): nombre de postes, bullet points quantifiés, pertinence
3. Formation (max 15): diplôme, institution, dates
4. Compétences (max 20): nombre, pertinence, catégorisation
5. Contenu & rédaction (max 15): résumé pro, verbes d'action, quantification
6. Sections additionnelles (max 10): projets, certifications, langues

Réponds UNIQUEMENT avec le JSON suivant, sans markdown:`;

    const GATEWAY_URL = Deno.env.get("AI_GATEWAY_URL") || "https://api.openai.com/v1/chat/completions";
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Tu es un expert ATS. Réponds UNIQUEMENT en JSON valide, sans blocs de code markdown." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_ats_score",
              description: "Return the ATS score analysis",
              parameters: {
                type: "object",
                properties: {
                  score: { type: "number", description: "Overall ATS score 0-100" },
                  summary: { type: "string", description: "2-3 sentence summary in French" },
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        score: { type: "number" },
                        maxScore: { type: "number" },
                        tips: { type: "array", items: { type: "string" } },
                      },
                      required: ["name", "score", "maxScore", "tips"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["score", "summary", "categories"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_ats_score" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Réponse IA invalide" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scoreData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(scoreData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("resume-score error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
