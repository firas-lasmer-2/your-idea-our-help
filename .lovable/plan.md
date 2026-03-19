

# UX Polish & Workflow Cohesion Plan

## Problem Statement
The app has many features but they feel disconnected. The workflow between landing page, wizard, builder steps, and preview needs to be smoother. Several components have hardcoded French strings (not using i18n), the Dashboard is dense, and navigation between features lacks clear guidance.

## Key Issues Found

1. **Dashboard is overwhelming** -- 4 quick action cards + onboarding checklist + plan card + stats + resume list + website list all crammed together. New users don't know where to start.
2. **Resume Builder header is cluttered** -- save status, country badge, progress bar, readiness banner, blockers, section suggestions all stack vertically before any content.
3. **StepPreview is overloaded** -- ATS score, summary editor, job matching collapsible, tabs for CV+cover letter, export blockers all on one page.
4. **Many strings still hardcoded in French** -- Dashboard, Settings, StepExperience, StepEducation, StepSkills, StepPreview, SmartWizard, and all admin pages don't use `useTranslation`.
5. **No clear "next action" after completing a CV** -- user downloads PDF and then what? No prompt to create a website, share on LinkedIn, or match with jobs.
6. **Live preview panel scaling** -- `scale(0.5)` with `width: 200%` creates a confusing scrollable area that's hard to read.
7. **No loading/empty states** for several flows -- importing a CV from Dashboard stores to sessionStorage but the builder doesn't check for it.
8. **WhatsApp share in StepPreview** shares a generic message with no actual link -- not useful.

## Implementation Plan

### 1. Simplify Dashboard Layout
- Collapse onboarding checklist into a slim progress bar with expandable details (not always open)
- Move stats into the header area as compact badges
- Make quick actions more prominent with a "What do you want to do?" hero section
- Add "post-CV" nudge: after first complete CV, show "Create your public profile" CTA

### 2. Streamline Resume Builder Chrome
- Merge the readiness banner into the StepProgress component as a subtle indicator
- Remove the separate blocker list from the main content area (keep only in StepPreview)
- Make section suggestions a dismissible toast/banner instead of a full card
- Fix live preview: use `aspect-ratio` container with proper overflow hidden, increase scale to 0.55

### 3. Simplify StepPreview
- Move professional summary editor to Step 1 (personal info) -- it's more logical there
- Make ATS score a compact badge in the header instead of a full card
- Keep job matching and cover letter as secondary tabs
- Add clear "What's next?" section after download: create website, share on LinkedIn, match with jobs

### 4. Fix WhatsApp Share
- Generate a shareable link (public website URL if published, otherwise just the app URL)
- Include the user's name in the message

### 5. Complete i18n Coverage
- Add translation keys for: Dashboard, Settings, StepExperience, StepEducation, StepSkills, StepPreview, SmartWizard, StepCustomization, StepTemplate, StepAdditionalSections
- Update Arabic translations in parallel
- This is the largest task but critical for market fit

### 6. Add Post-Completion Flow
- After PDF download in StepPreview, show a "congratulations" card with 3 next actions:
  - "Create your public profile" (link to /website/new)
  - "Match with a job posting" (scroll to job matching section)
  - "Share on WhatsApp/LinkedIn"

### 7. Fix Import Flow
- In ResumeBuilder, check `sessionStorage` for imported resume data on mount
- If found, populate the form and clear sessionStorage
- Show a toast confirming import

### 8. Mobile Responsive Fixes
- Hide the live preview toggle on mobile (already done, but verify)
- Make StepPreview tabs full-width on mobile
- Ensure the AI chat button doesn't overlap with navigation buttons

## Technical Details

**Files to modify:**
- `src/pages/Dashboard.tsx` -- simplify layout, add post-CV nudge
- `src/pages/ResumeBuilder.tsx` -- streamline chrome, fix live preview scaling, handle import from sessionStorage
- `src/components/resume/steps/StepPreview.tsx` -- simplify, add post-download flow, fix WhatsApp
- `src/components/resume/steps/StepPersonalInfo.tsx` -- add summary field
- `src/components/resume/SectionSuggestions.tsx` -- convert to dismissible banner
- `src/locales/fr.json` + `src/locales/ar.json` -- add ~150 new translation keys
- Multiple step components -- add `useTranslation` hooks

**Estimated scope:** ~12 files modified, focused on UX cohesion rather than new features.

