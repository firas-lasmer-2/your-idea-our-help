

# Comprehensive System Improvement Plan

## Current Feature Inventory & Gap Analysis

### Features Audit

| Feature | Status | Issues |
|---------|--------|--------|
| Landing Page (Index) | Good | Well-structured with i18n |
| Auth (Login/Signup) | Good | Has Google OAuth, i18n |
| ForgotPassword / ResetPassword | Hardcoded French | No i18n, no LanguageSwitcher |
| Dashboard | Improved | Works but could use empty states |
| Resume Wizard (SmartWizard) | Good | Has i18n |
| Resume Builder (9 steps) | Good | Import flow added |
| StepJobTarget | Unused/orphaned | Hardcoded French, not in visible steps |
| Resume Import (PDF) | Functional | Hardcoded French in dialog |
| AI Chat Assistant | New | Needs testing |
| Section Suggestions | New | Needs testing |
| ATS Score Gauge | Functional | OK |
| Cover Letter Generator | Functional | Needs i18n check |
| Job Matching | Functional | OK |
| Onboarding Tour | Functional | Hardcoded French, outdated content |
| Website Wizard | Functional | Hardcoded French throughout |
| Website Editor | Functional | Hardcoded French throughout |
| Website Preview / Public Site | Functional | Basic SEO, no analytics |
| Settings | Good | Has i18n |
| Admin Panel (6 pages) | Functional | All hardcoded French, no i18n |
| NotFound (404) | Hardcoded French | No i18n |
| StepPreview summary editor | Duplicated | Still in StepPreview AND StepPersonalInfo |

---

## Phase 1: Fix Broken/Inconsistent Elements (Critical)

**Goal:** Ensure nothing is broken and the app feels consistent.

### 1.1 Remove duplicate summary editor
The professional summary editor exists in both `StepPreview.tsx` (lines 247-280) and `StepPersonalInfo.tsx`. Remove it from StepPreview since it was moved to StepPersonalInfo per the previous plan.

### 1.2 i18n for remaining hardcoded pages
These pages still have zero i18n:
- `ForgotPassword.tsx` -- 8 hardcoded strings
- `ResetPassword.tsx` -- 6 hardcoded strings
- `NotFound.tsx` -- 4 hardcoded strings
- `ResumeImportDialog.tsx` -- 6 hardcoded strings
- `OnboardingTour.tsx` -- 8 hardcoded strings (tour step titles/descriptions)
- `StepJobTarget.tsx` -- 5 hardcoded strings (though this component may be orphaned)

### 1.3 Add LanguageSwitcher to ForgotPassword and ResetPassword
Login and Signup have it, but the password recovery flow does not.

### 1.4 WebsiteBuilder full i18n
`WebsiteBuilder.tsx` has ~20 hardcoded French strings (save status, slug, publish buttons, checklist labels). `WebsiteWizard.tsx` has ~30 hardcoded strings (mode cards, experience options, form labels).

**Files:** `ForgotPassword.tsx`, `ResetPassword.tsx`, `NotFound.tsx`, `ResumeImportDialog.tsx`, `OnboardingTour.tsx`, `WebsiteBuilder.tsx`, `WebsiteWizard.tsx`, `StepPreview.tsx`, `fr.json`, `ar.json`

---

## Phase 2: Dashboard & Navigation Improvements

**Goal:** Make the dashboard the command center with clear guidance for every user state.

### 2.1 Empty states
- When user has 0 resumes: show a friendly illustration + single CTA "Create your first CV"
- When user has 0 websites: show a nudge card explaining what public profiles do
- When user has resumes but none complete: show progress indicators on resume cards

### 2.2 Resume card improvements
- Show template name/thumbnail on each card
- Show completion percentage as a visual progress ring
- Add "Continue editing" as the primary action instead of just "Edit"

### 2.3 Website card improvements
- Show published/draft status more prominently
- Show public URL directly on card if published
- Add "View live" quick action

### 2.4 Global navigation consistency
- Add a consistent breadcrumb or back-navigation pattern across all builder pages
- The brand name "Resume" appears everywhere but doesn't reflect the product well for the website builder -- consider context-aware header

**Files:** `Dashboard.tsx`, `fr.json`, `ar.json`

---

## Phase 3: Website Builder UX Overhaul

**Goal:** The website builder has the most hardcoded strings and the least polished UX.

### 3.1 WebsiteWizard i18n and UX
- All mode cards, labels, experience options use hardcoded French
- The wizard is 620 lines -- it needs clearer step indicators
- Add AI-powered content suggestions (like resume wizard has)

### 3.2 WebsiteEditor improvements
- Add a "Preview" mode toggle to see the site as visitors would
- The editor/preview split needs better responsive behavior
- Section editing should have inline help text

### 3.3 Publishing flow
- After publishing, show a success modal with shareable links (WhatsApp, LinkedIn, copy URL)
- Add a QR code generator for the public URL
- Show visitor count on the dashboard card (the tracking event `website_viewed` exists but isn't surfaced)

**Files:** `WebsiteWizard.tsx`, `WebsiteEditor.tsx`, `WebsiteBuilder.tsx`, `WebsitePreview.tsx`, `fr.json`, `ar.json`

---

## Phase 4: Onboarding & First-Time User Experience

**Goal:** New users should know exactly what to do within 10 seconds.

### 4.1 Modernize OnboardingTour
- Current tour content is outdated (references 3 templates: "Classique, Moderne, Creatif" but actual templates are "essentiel, horizon, signature")
- Replace with a contextual tooltip-style tour instead of a modal overlay
- Make it i18n-compatible

### 4.2 Smart Dashboard for new users
- First-time users (0 resumes, 0 websites) should see a different dashboard layout:
  - Large hero: "Welcome! Let's build your first CV in 5 minutes"
  - Two clear paths: "Create from scratch" vs "Import existing PDF"
  - Skip the checklist/plan card entirely for first visit

### 4.3 Post-signup redirect
- After signup, redirect to `/resume/new` instead of `/dashboard` if user has no resumes
- Or show a choice modal: "What do you want to do first?"

**Files:** `OnboardingTour.tsx`, `Dashboard.tsx`, `Signup.tsx`

---

## Phase 5: Cross-Feature Workflow Connections

**Goal:** Features should flow into each other naturally.

### 5.1 Resume to Website bridge
- After completing a resume, the "Create your public profile" button in the post-download card should pre-populate the website wizard with resume data (it already has `buildWebsiteProfileFromResume` in the website system -- just need to pass the resume ID)

### 5.2 Website to Resume bridge
- In the website builder, if user has no resume, show a CTA: "Create a CV first to auto-fill your profile"

### 5.3 Feedback loop
- The `FeedbackCard` component exists in dashboard but is it actually useful? Add a simple NPS-style rating after first PDF download

### 5.4 Share flow unification
- Create a reusable `ShareDialog` component used by both Resume (WhatsApp share) and Website (publish share)
- Include: Copy URL, WhatsApp, LinkedIn, QR code

**Files:** New `ShareDialog.tsx`, `StepPreview.tsx`, `WebsiteBuilder.tsx`, `Dashboard.tsx`

---

## Phase 6: Admin Panel Polish

**Goal:** Admin pages are entirely in hardcoded French with no i18n.

### 6.1 Admin i18n
- `AdminDashboard.tsx`, `AdminUsers.tsx`, `AdminResumes.tsx`, `AdminWebsites.tsx`, `AdminAnalytics.tsx`, `AdminContacts.tsx`, `AdminLayout.tsx` -- all have hardcoded French
- Lower priority since admin is internal, but should be consistent

### 6.2 Admin UX
- Add search/filter to user and resume lists
- Add bulk actions (delete multiple)
- Add export to CSV functionality

**Files:** All admin pages, `fr.json`, `ar.json`

---

## Recommended Implementation Order

1. **Phase 1** (Critical fixes) -- removes duplicates, fixes broken i18n, ensures consistency
2. **Phase 4** (Onboarding) -- improves first impression for new users
3. **Phase 2** (Dashboard) -- better home base experience
4. **Phase 5** (Cross-feature) -- connects features into workflows
5. **Phase 3** (Website Builder) -- polishes the second major feature
6. **Phase 6** (Admin) -- lowest priority, internal tool

## Technical Notes

- Total new translation keys needed: ~80 across phases 1-5
- StepJobTarget component appears orphaned (not in `getVisibleSteps` results) -- consider removing or integrating
- The `CoverLetterGenerator` component needs an i18n audit
- The `ATSScoreGauge` component needs an i18n audit
- `timeAgo` function in Dashboard still formats dates with `fr-FR` locale -- should use i18n locale

