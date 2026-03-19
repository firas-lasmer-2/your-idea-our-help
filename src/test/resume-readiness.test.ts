import { describe, expect, it } from "vitest";
import { defaultCustomization, defaultResumeData } from "@/types/resume";
import { getResumeReadiness } from "@/lib/resume-readiness";

describe("resume readiness", () => {
  it("flags missing required resume inputs", () => {
    const readiness = getResumeReadiness(defaultResumeData, defaultCustomization, "");

    expect(readiness.stepStatus[1].complete).toBe(false);
    expect(readiness.stepStatus[4].complete).toBe(false);
    expect(readiness.exportBlockers.length).toBeGreaterThan(0);
  });

  it("treats a filled resume as export ready", () => {
    const readiness = getResumeReadiness(
      {
        ...defaultResumeData,
        jobTitle: "Developpeur Full Stack",
        experienceLevel: "1-3",
        personalInfo: {
          ...defaultResumeData.personalInfo,
          firstName: "Amel",
          lastName: "Ben Ali",
          email: "amel@example.com",
        },
        experience: [
          {
            id: "exp-1",
            company: "Acme",
            position: "Developpeuse",
            startDate: "2024-01",
            endDate: "",
            current: true,
            bullets: ["Developpement front-end"],
          },
        ],
        education: [
          {
            id: "edu-1",
            institution: "ESPRIT",
            degree: "Ingenieur",
            field: "Info",
            startDate: "2020-01",
            endDate: "2023-01",
            current: false,
            description: "",
          },
        ],
        skillCategories: [
          { id: "tech", name: "Tech", skills: ["React", "TypeScript", "Node.js"] },
          { id: "soft", name: "Soft", skills: [] },
          { id: "tools", name: "Tools", skills: [] },
        ],
      },
      defaultCustomization,
      "horizon",
    );

    expect(readiness.exportBlockers).toEqual([]);
    expect(readiness.stepStatus[9].complete).toBe(true);
    expect(readiness.completionPercent).toBe(100);
  });
});
