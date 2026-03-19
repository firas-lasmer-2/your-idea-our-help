import { describe, expect, it } from "vitest";
import {
  buildOnboardingChecklist,
  getChecklistProgress,
  getFunnelConversionRate,
  getRemainingAllowance,
  getResumeCompletionPercent,
  getUsageCards,
} from "@/lib/growth";

describe("growth helpers", () => {
  it("calculates resume completion from visible signals", () => {
    const score = getResumeCompletionPercent({
      id: "resume-1",
      current_step: 9,
      template: "signature",
      data: {
        personalInfo: { firstName: "Amel", email: "amel@example.com" },
        education: [{ school: "ESPRIT" }],
        experience: [{ company: "Acme" }],
        skillCategories: [{ id: "tech", skills: ["React"] }],
        summary: "Product-minded engineer",
      },
    });

    expect(score).toBe(100);
  });

  it("builds onboarding checklist with next best action", () => {
    const items = buildOnboardingChecklist(
      [{ id: "resume-1", current_step: 4 }],
      [],
    );

    const progress = getChecklistProgress(items);

    expect(items[0].done).toBe(true);
    expect(items[1].done).toBe(false);
    expect(progress.completed).toBe(1);
    expect(progress.nextItem?.key).toBe("resume-preview");
  });

  it("builds usage cards with safe remaining allowance", () => {
    const cards = getUsageCards(
      { pdf_monthly_limit: 3, website_limit: 1, ai_daily_limit: 20 },
      { pdf_downloads_count: 4, websites_published_count: 1, ai_requests_count: 7 },
    );

    expect(cards[0].limit).toBe(3);
    expect(cards[0].used).toBe(4);
    expect(getRemainingAllowance(cards[0].used, cards[0].limit)).toBe(0);
  });

  it("calculates funnel conversion defensively", () => {
    expect(getFunnelConversionRate(20, 5)).toBe(25);
    expect(getFunnelConversionRate(0, 5)).toBe(0);
  });
});
