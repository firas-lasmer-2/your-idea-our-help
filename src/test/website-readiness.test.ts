import { describe, expect, it } from "vitest";
import { defaultGlobalSettings } from "@/types/website";
import { getWebsitePublishReadiness } from "@/lib/website-readiness";

describe("website publish readiness", () => {
  it("blocks publish when critical content is missing", () => {
    const readiness = getWebsitePublishReadiness({
      title: "",
      slug: "a",
      globalSettings: defaultGlobalSettings,
      data: {
        profile: {
          mode: "profile",
          candidateTrack: "transport",
          targetCountry: "canada",
          experienceLevel: "none",
          jobTitle: "",
          summary: "",
        },
        sections: [
          { id: "hero-1", type: "hero", enabled: true, order: 0, content: { title: "", cta: "" } },
        ],
      },
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.length).toBeGreaterThan(0);
  });

  it("allows publish when core website quality checks pass", () => {
    const readiness = getWebsitePublishReadiness({
      title: "Studio Amal",
      slug: "studio-amal",
      globalSettings: { ...defaultGlobalSettings, metaDescription: "Portfolio professionnel et site de presentation." },
      data: {
        profile: {
          mode: "profile",
          candidateTrack: "transport",
          targetCountry: "canada",
          experienceLevel: "3-10",
          jobTitle: "Chauffeur poids lourd",
          summary: "Profil fiable et opérationnel.",
        },
        sections: [
          { id: "hero-1", type: "hero", enabled: true, order: 0, content: { title: "Studio Amal", cta: "Me contacter" } },
          { id: "about-1", type: "about", enabled: true, order: 1, content: { title: "A propos" } },
          { id: "experience-1", type: "experience", enabled: true, order: 2, content: { items: [{ position: "Chauffeur", company: "Transit Pro" }] } },
          { id: "contact-1", type: "contact", enabled: true, order: 3, content: { email: "amal@example.com" } },
        ],
      },
    });

    expect(readiness.ready).toBe(true);
    expect(readiness.blockers).toEqual([]);
  });
});
