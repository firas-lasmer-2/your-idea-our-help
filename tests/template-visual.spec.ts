import { expect, test } from "@playwright/test";

const resumeTemplates = ["essentiel", "horizon", "trajectoire", "direction", "signature"] as const;
const websiteTemplates = ["profile-clean", "route-pro", "executive-profile", "casefile", "showcase"] as const;

test.describe("resume template visuals", () => {
  for (const template of resumeTemplates) {
    test(`resume ${template}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1800 });
      await page.goto(`/__preview/templates?kind=resume&template=${template}`);
      await page.locator("[data-visual-root]").scrollIntoViewIfNeeded();
      await expect(page.locator("[data-visual-root]")).toHaveScreenshot(`resume-${template}.png`, {
        animations: "disabled",
      });
    });
  }
});

test.describe("website template visuals", () => {
  for (const template of websiteTemplates) {
    test(`website ${template} desktop`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 2200 });
      await page.goto(`/__preview/templates?kind=website&template=${template}`);
      await page.locator("[data-visual-root]").scrollIntoViewIfNeeded();
      await expect(page.locator("[data-visual-root]")).toHaveScreenshot(`website-${template}-desktop.png`, {
        animations: "disabled",
      });
    });

    test(`website ${template} mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 430, height: 2000 });
      await page.goto(`/__preview/templates?kind=website&template=${template}&mobile=1`);
      await page.locator("[data-visual-root]").scrollIntoViewIfNeeded();
      await expect(page.locator("[data-visual-root]")).toHaveScreenshot(`website-${template}-mobile.png`, {
        animations: "disabled",
      });
    });
  }
});
