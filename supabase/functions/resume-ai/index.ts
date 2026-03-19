import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = Deno.env.get("AI_GATEWAY_URL") || "https://api.openai.com/v1/chat/completions";

interface RequestBody {
  action: "enhance-bullet" | "generate-summary" | "suggest-skills" | "optimize-title" | "match-job" | "prefill-resume";
  data: Record<string, unknown>;
}

function buildPrompt(action: string, data: Record<string, unknown>): { system: string; user: string } {
  switch (action) {
    case "enhance-bullet": {
      const jobTarget = data.jobTarget as string || "";
      const position = data.position as string || "";
      const bullet = data.bullet as string || "";
      return {
        system: `Tu es un expert en rédaction de CV professionnel. Tu améliores les descriptions d'expérience pour les rendre percutantes, quantifiées et orientées résultats. 
Règles:
- Commence par un verbe d'action fort
- Quantifie quand possible (%, nombres, délais)
- Garde la même longueur approximative (1-2 lignes)
- Adapte le ton au niveau: ${jobTarget === "internship" ? "stagiaire/étudiant" : jobTarget === "first-job" ? "jeune diplômé" : "professionnel expérimenté"}
- Réponds UNIQUEMENT avec le bullet point amélioré, sans guillemets ni tiret au début`,
        user: `Poste: ${position}\nBullet point original: ${bullet}`,
      };
    }

    case "generate-summary": {
      const resumeData = data.resumeData as Record<string, unknown>;
      const personalInfo = resumeData?.personalInfo as Record<string, string> || {};
      const education = resumeData?.education as Array<Record<string, string>> || [];
      const experience = resumeData?.experience as Array<Record<string, unknown>> || [];
      const skills = resumeData?.skillCategories as Array<{ name: string; skills: string[] }> || [];
      const jobTarget = resumeData?.jobTarget as string || "";

      const context = [
        `Nom: ${personalInfo.firstName} ${personalInfo.lastName}`,
        `Ville: ${personalInfo.city || "Non spécifié"}`,
        `Objectif: ${jobTarget}`,
        education.length > 0 ? `Formation: ${education.map((e) => `${e.degree} ${e.field} à ${e.institution}`).join("; ")}` : "",
        experience.length > 0 ? `Expérience: ${experience.map((e) => `${(e as Record<string, string>).position} chez ${(e as Record<string, string>).company}`).join("; ")}` : "",
        skills.filter((s) => s.skills.length > 0).length > 0
          ? `Compétences: ${skills.filter((s) => s.skills.length > 0).map((s) => `${s.name}: ${s.skills.join(", ")}`).join("; ")}`
          : "",
      ].filter(Boolean).join("\n");

      return {
        system: `Tu es un expert en rédaction de CV. Génère un résumé professionnel de 2-3 phrases maximum pour un CV.
Règles:
- Court et percutant (2-3 phrases max)
- Met en avant les points forts et l'objectif professionnel
- Adapté au marché tunisien et francophone
- Utilise la troisième personne
- Pas de formule de politesse
- Réponds UNIQUEMENT avec le résumé, sans titre ni guillemets`,
        user: context,
      };
    }

    case "suggest-skills": {
      const jobTarget = data.jobTarget as string || "";
      const field = data.field as string || "";
      const existingSkills = (data.existingSkills as string[]) || [];
      const category = data.category as string || "techniques";
      return {
        system: `Tu es un expert en recrutement et compétences professionnelles en Tunisie. Suggère exactement 8 compétences pertinentes pour la catégorie demandée.
Règles:
- Compétences actuelles et recherchées sur le marché tunisien et international
- Ne suggère PAS de compétences déjà listées
- Chaque compétence doit être concise (1-3 mots)
- Réponds avec un JSON array de strings, rien d'autre. Ex: ["React", "Node.js", "Docker"]`,
        user: `Objectif: ${jobTarget}\nDomaine: ${field}\nCatégorie: ${category}\nCompétences existantes: ${existingSkills.join(", ") || "aucune"}`,
      };
    }

    case "optimize-title": {
      const currentTitle = data.currentTitle as string || "";
      const jobTarget = data.jobTarget as string || "";
      return {
        system: `Tu es un expert en optimisation de titres de postes pour CV. Suggère 4 titres de poste alternatifs, plus professionnels et optimisés pour les ATS.
Règles:
- Titres utilisés en Tunisie et à l'international
- Plus professionnels et percutants que l'original
- Réponds avec un JSON array de strings. Ex: ["Développeur Full Stack", "Ingénieur Logiciel"]`,
        user: `Titre actuel: ${currentTitle}\nObjectif: ${jobTarget}`,
      };
    }

    case "match-job": {
      const jobDescription = data.jobDescription as string || "";
      const resumeData = data.resumeData as Record<string, unknown>;
      return {
        system: `Tu es un expert en recrutement ATS. Compare un CV avec une description de poste et évalue la correspondance.
Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "matchScore": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}
Règles:
- matchedKeywords: mots-clés du poste trouvés dans le CV (max 15)
- missingKeywords: mots-clés importants du poste absents du CV (max 10)
- suggestions: 2-4 conseils concrets en français pour améliorer la correspondance
- Pas de blocs markdown, juste le JSON`,
        user: `Description du poste:\n${jobDescription}\n\nDonnées du CV:\n${JSON.stringify(resumeData)}`,
      };
    }

    case "prefill-resume": {
      const country = data.country as string || "";
      const jobTitle = data.jobTitle as string || "";
      const experienceLevel = data.experienceLevel as string || "";
      const field = data.field as string || "";

      const levelDesc: Record<string, string> = {
        "none": "sans expérience, étudiant ou premier emploi",
        "1-3": "1 à 3 ans d'expérience, début de carrière",
        "3-10": "3 à 10 ans d'expérience, professionnel confirmé",
        "10+": "plus de 10 ans d'expérience, expert senior",
      };

      const countryDesc: Record<string, string> = {
        tunisia: "Tunisie - marché local",
        france: "France - normes françaises, CV 1 page",
        canada: "Canada - format nord-américain, pas de photo, résultats chiffrés",
        usa: "USA - resume américain, pas de photo, verbes d'action",
        gulf: "Golfe (UAE/Qatar/Arabie) - CV détaillé avec photo",
        germany: "Allemagne - CV structuré chronologique",
        other: "International",
      };

      return {
        system: `Tu es un expert en rédaction de CV et en recrutement international. Génère du contenu pré-rempli pour un CV complet.
Le candidat est tunisien et postule pour: ${countryDesc[country] || country}.
Niveau: ${levelDesc[experienceLevel] || experienceLevel}.

Réponds UNIQUEMENT avec un JSON valide (pas de markdown) avec cette structure:
{
  "summary": "Résumé professionnel de 2-3 phrases adapté au pays cible",
  "skills": ["compétence1", "compétence2", ...],
  "softSkills": ["compétence1", ...],
  "tools": ["outil1", ...],
  "experience": [
    {
      "position": "Titre du poste",
      "company": "Nom entreprise type",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY",
      "bullets": ["réalisation 1", "réalisation 2", "réalisation 3"]
    }
  ],
  "languages": [{"name": "Arabe", "level": "Langue maternelle"}, {"name": "Français", "level": "Courant"}]
}

Règles:
- Compétences adaptées au métier ET au pays cible
- Bullet points avec verbes d'action et résultats chiffrés quand possible
- Pour les métiers manuels: compétences pratiques, certifications, permis
- Pour les postes tech: technologies, frameworks, méthodologies
- ${experienceLevel === "none" ? "Inclus des stages et projets académiques au lieu d'expériences réelles" : "Inclus 1-2 expériences types pour ce métier"}
- Langues typiques d'un candidat tunisien
- Adapte le ton et le vocabulaire au pays cible`,
        user: `Métier: ${jobTitle}\nDomaine: ${field}\nPays cible: ${country}\nNiveau: ${experienceLevel}`,
      };
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    if (!AI_API_KEY) throw new Error("AI_API_KEY is not configured");

    const { action, data } = (await req.json()) as RequestBody;
    const { system, user } = buildPrompt(action, data);

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes. Veuillez réessayer dans quelques secondes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés. Veuillez recharger votre compte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA. Veuillez réessayer." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("resume-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
