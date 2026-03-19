import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = Deno.env.get("AI_GATEWAY_URL") || "https://api.openai.com/v1/chat/completions";

const CATEGORY_PROMPTS: Record<string, string> = {
  profile: `Tu génères du contenu pour un PROFIL PROFESSIONNEL de candidat. Le ton doit être simple, crédible et utile à un recruteur.
- Mets l'accent sur l'expérience réelle, la fiabilité, la disponibilité, les permis, les certifications et les langues si elles existent.
- Le contenu doit marcher aussi bien pour un chauffeur, un agent logistique, un réceptionniste, un aide-soignant ou un profil administratif.
- Les sections "credentials", "availability" et "languages" doivent être concrètes et lisibles.`,

  portfolio: `Tu génères du contenu pour un PORTFOLIO PROFESSIONNEL de candidat. Le ton doit être professionnel, orienté résultats et facile à parcourir.
- Mets l'accent sur les réalisations, projets, résultats et spécialités.
- Les projets doivent être réalistes, lisibles et utiles pour un recruteur.
- Les compétences doivent rester crédibles, sans jargon excessif.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    if (!AI_API_KEY) throw new Error("AI_API_KEY is not configured");

    const {
      purpose,
      mode = "generate",
      siteName,
      description,
      goal,
      colorPreference,
      sections,
      categoryContext,
      candidateTrack,
      targetCountry,
      experienceLevel,
    } = await req.json();

    const sectionList = (sections as string[]).join(", ");
    const categoryHint = CATEGORY_PROMPTS[purpose] || "";

    const systemPrompt = `Tu es un expert en création de sites web professionnels. Tu génères du contenu complet et convaincant pour un site web.

${categoryHint}

Règles:
- Contenu professionnel, engageant et adapté à la recherche d'emploi internationale
- Chaque section doit avoir du contenu riche et réaliste
- Utilise le nom du site et la description fournis
- Le contenu doit être prêt à l'emploi (pas de "[placeholder]")
- Adapte le ton au type de site: ${purpose}
- Adapte la complexité au secteur du candidat: ${candidateTrack || "other"}
- Adapte le ton au pays cible: ${targetCountry || "other"}
- Adapte le niveau de séniorité: ${experienceLevel || "none"}

Tu dois retourner un JSON valide avec cette structure exacte (inclus UNIQUEMENT les sections demandées):
{
  "sections": {
    "hero": { "title": "...", "subtitle": "...", "cta": "..." },
    "about": { "title": "À propos", "text": "..." },
    "skills": { "title": "Compétences", "items": [{ "name": "...", "level": "90" }] },
    "credentials": { "title": "Permis & Certifications", "items": [{ "name": "...", "issuer": "...", "detail": "..." }] },
    "availability": { "title": "Disponibilité", "items": [{ "label": "...", "value": "..." }] },
    "languages": { "title": "Langues", "items": [{ "name": "...", "level": "..." }] },
    "projects": { "title": "Projets", "items": [{ "name": "...", "description": "...", "tags": ["..."] }] },
    "experience": { "title": "Expérience", "items": [{ "position": "...", "company": "...", "period": "...", "description": "..." }] },
    "education": { "title": "Formation", "items": [{ "degree": "...", "institution": "...", "period": "..." }] },
    "stats": { "title": "Points forts", "items": [{ "number": "...", "label": "..." }] },
    "contact": { "title": "Contact", "text": "...", "email": "contact@example.com" },
    "social-links": { "linkedin": "...", "github": "...", "whatsapp": "..." }
  }
}

Génère 2-4 items pour les sections avec listes.
Retourne UNIQUEMENT le JSON, sans markdown ni explication.`;

    const contextStr = categoryContext ? `\nDétails spécifiques: ${JSON.stringify(categoryContext)}` : "";

    const userPrompt = `Mode: ${mode}
Nom du site: ${siteName}
Description: ${description}
Objectif: ${goal}
Type: ${purpose}
Secteur du candidat: ${candidateTrack || "other"}
Pays cible: ${targetCountry || "other"}
Niveau d'expérience: ${experienceLevel || "none"}
Couleur préférée: ${colorPreference || "teal"}
Sections à générer: ${sectionList}${contextStr}`;

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez dans quelques secondes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(JSON.stringify({ error: "Erreur du service IA." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Erreur de format IA. Réessayez." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("website-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
