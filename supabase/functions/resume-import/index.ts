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

    const { pdfBase64, filename } = await req.json();
    if (!pdfBase64) throw new Error("No PDF data provided");

    // Decode base64 to get text content - send to AI for parsing
    const system = `Tu es un expert en parsing de CV. L'utilisateur va te fournir le contenu encodé en base64 d'un CV PDF.
Extrais les informations et retourne un JSON avec cette structure EXACTE:
{
  "personalInfo": {
    "firstName": "", "lastName": "", "email": "", "phone": "", "city": "", "linkedIn": "", "github": "", "photoUrl": ""
  },
  "education": [
    { "id": "edu-1", "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "current": false, "description": "" }
  ],
  "experience": [
    { "id": "exp-1", "company": "", "position": "", "startDate": "", "endDate": "", "current": false, "bullets": [""] }
  ],
  "summary": "",
  "languages": [{ "name": "", "level": "" }],
  "interests": []
}
Règles:
- Génère des IDs uniques pour chaque entrée (edu-1, edu-2, exp-1, exp-2, etc.)
- Les dates au format "MM/YYYY" ou "YYYY"
- Les bullets doivent être des phrases individuelles
- Si une information n'est pas trouvée, laisse une string vide
- Réponds UNIQUEMENT avec le JSON, pas de markdown ni de commentaire`;

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${AI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Fichier: ${filename}\n\nContenu base64 du PDF (les premiers 50000 caractères):\n${pdfBase64.slice(0, 50000)}` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Trop de requêtes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Erreur du service IA." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let resumeData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      resumeData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      return new Response(JSON.stringify({ error: "Impossible de parser le CV. Essayez un autre format." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ resumeData }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("resume-import error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
