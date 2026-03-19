

# CV & Website Builder — Full Workflow Redesign

## Current State Summary

The app has a solid foundation: a 3-step smart wizard leading into an 8-step resume builder, AI-powered features (chat, bullet enhancement, skill suggestions, ATS scoring, job matching), and a separate website builder with its own wizard. However, several friction points exist across the entire journey.

---

## Problem Areas Identified

### Resume Builder Issues

1. **Too many steps (8)** — Steps 5 (Additional Sections), 6 (Template), and 7 (Customization) could be merged. Users lose momentum crossing 8 steps for what should feel like a 4-5 step process.

2. **Step labels are hardcoded French** — `RESUME_STEPS` in `types/resume.ts` (line 256-264) uses hardcoded French labels like "Infos personnelles", "Expérience". These never go through i18n.

3. **Readiness blockers are hardcoded French** — `resume-readiness.ts` has strings like "Ajoutez votre prenom" that bypass i18n entirely.

4. **ResumePreview placeholder text is hardcoded** — "Votre CV apparaitra ici" on line 27 of `ResumePreview.tsx`.

5. **No drag-to-reorder for experience/education entries** — Users cannot reorder their items, only add/delete.

6. **StepAdditionalSections is a dead-end toggle** — Users toggle sections ON but never actually fill content for projects, certifications, languages, or interests in that step. They have to go back or find those fields elsewhere.

7. **AI Chat Assistant has hardcoded French prompts and labels** — `stepLabels` and `QUICK_PROMPTS` in `AiChatAssistant.tsx` are not translated.

8. **SectionSuggestions labels are hardcoded French** — `SECTION_LABELS` and `SECTION_ICONS` in `SectionSuggestions.tsx`.

9. **Section titles in ResumePreview are hardcoded** — "Experience", "Formation", "Competences", "Langues", etc. appear directly in the rendered PDF without i18n.

10. **No mobile-friendly step navigation** — The horizontal step bar overflows on small screens with just number circles; no swipe gesture support.

### Website Builder Issues

11. **Wizard-to-editor transition is jarring** — After the 4-step wizard, users land in a complex split-pane editor with no guidance.

12. **No "quick preview" in website wizard** — Users pick a template from thumbnails but can't see how their actual content would look before committing.

### Cross-Workflow Issues

13. **Dashboard resume cards lack quick actions** — No one-tap "Download PDF" or "Duplicate" from the dashboard.

14. **No resume duplication feature** — Users who want variants for different job applications must start from scratch.

---

## Implementation Plan

### Phase A: Streamline Resume Steps (High Impact)

**Merge steps 5+6+7 into a single "Design" step** that combines template selection, customization (colors/fonts/spacing), and additional section toggles in a tabbed interface. This reduces the flow from 8 steps to 6.

New step flow:
```text
1. Personal Info + Summary
2. Experience
3. Education
4. Skills
5. Design (Template + Customization + Additional Sections)
6. Preview & Export
```

Files: `types/resume.ts` (RESUME_STEPS), `ResumeBuilder.tsx` (renderStep, visibleSteps), `country-standards.ts` (getVisibleSteps), create new `StepDesign.tsx` merging Template + Customization + AdditionalSections with tabs.

### Phase B: i18n for All Remaining Hardcoded Strings

1. **RESUME_STEPS labels** — Replace hardcoded strings with i18n keys.
2. **resume-readiness.ts blockers** — All blocker strings through `t()` (requires passing i18n or using a factory pattern).
3. **ResumePreview section titles** — "Experience", "Formation", etc. should use translated strings passed as props or context.
4. **AiChatAssistant** — Translate `stepLabels`, `QUICK_PROMPTS`.
5. **SectionSuggestions** — Translate `SECTION_LABELS`.

Files: `types/resume.ts`, `resume-readiness.ts`, `ResumePreview.tsx`, `AiChatAssistant.tsx`, `SectionSuggestions.tsx`, `StepProgress.tsx`, `fr.json`, `ar.json`.

### Phase C: Fill Additional Section Content Inline

When users enable "Projects", "Certifications", "Languages", or "Interests" in the new Design tab, show inline editors for those sections immediately below the toggle. Currently, toggling them on does nothing visible — users never get prompted to add the actual data.

For each toggle:
- **Languages**: Inline name + level rows (already exists in data model)
- **Interests**: Tag input (already exists in data model)
- **Projects**: Card-based editor with name, description, technologies, URL
- **Certifications**: Card-based editor with name, issuer, date, URL

Files: New sub-components in `steps/`, update the merged `StepDesign.tsx`.

### Phase D: Resume Duplication + Quick Dashboard Actions

1. **Duplicate resume** — Add "Duplicate" to the dashboard dropdown menu. Creates a copy with "(Copy)" appended to the title.
2. **Quick PDF download** from dashboard — Add a download button directly on each resume card (calls the same html2pdf logic).

Files: `Dashboard.tsx`.

### Phase E: Mobile Step Navigation

Replace the horizontal scrolling step bar with a compact dropdown/stepper on mobile:
- Show current step name + "Step X of Y" label
- Tap to open a bottom sheet with all steps listed vertically
- Each step shows completion status icon

Files: `StepProgress.tsx`, possibly a new `MobileStepNav.tsx`.

### Phase F: Website Builder Onboarding

After the website wizard completes and the editor loads, show a brief 3-step tooltip tour highlighting:
1. The section list sidebar (where to edit content)
2. The preview panel (how it looks live)
3. The publish button (when ready)

Files: `WebsiteEditor.tsx`, new `WebsiteOnboarding.tsx`.

---

## Recommended Implementation Order

1. **Phase B** (i18n cleanup) — Quick wins, fixes broken translations in PDF output
2. **Phase A** (merge steps) — Biggest UX improvement, reduces cognitive load
3. **Phase C** (inline section editors) — Completes the merged step experience
4. **Phase D** (dashboard actions) — Quality-of-life improvements
5. **Phase E** (mobile nav) — Mobile UX polish
6. **Phase F** (website onboarding) — Guides new users in the editor

## Technical Notes

- `getVisibleSteps()` in `country-standards.ts` needs updating to reflect the new step numbers
- The `resume-readiness.ts` step status keys must be remapped
- `ResumePreview.tsx` is 872 lines — section title translation requires updating all 8 template layout functions
- The merged "Design" step should use shadcn `Tabs` component with 3 tabs: Template, Style, Sections
- Resume duplication is a simple Supabase insert with `user_id` preserved and new UUID

