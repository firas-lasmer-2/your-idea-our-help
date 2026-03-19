

# Comprehensive Analysis and Improvement Plan

## Current Architecture Overview

```text
┌─────────────────────────────────────────────────────┐
│  Landing Page (Index.tsx)                            │
│  Hero, Persona Cards, Features, Pricing, FAQ        │
├───────────┬───────────┬─────────────────────────────┤
│  Auth     │  Dashboard│  Admin Panel                │
│  Login    │  Resumes  │  Users, Analytics, Contacts  │
│  Signup   │  Websites │  Resumes, Websites           │
│  Reset PW │  Usage    │                              │
├───────────┴───────────┴─────────────────────────────┤
│  Resume Builder          │  Website Builder           │
│  SmartWizard → 8 Steps   │  WebsiteWizard → Editor    │
│  AI prefill, ATS score   │  Profile/Portfolio modes    │
│  5 templates             │  4 layout styles            │
│  Country-aware           │  Section-based              │
├──────────────────────────┴───────────────────────────┤
│  Supabase Backend                                    │
│  Tables: profiles, resumes, websites, user_roles,    │
│          contact_submissions                         │
│  Edge Functions: resume-ai, resume-score,            │
│    resume-import, cover-letter, website-ai,          │
│    website-contact                                   │
│  Auth: Email + Google OAuth                          │
└─────────────────────────────────────────────────────┘
```

## What Already Works Well

- **Smart Wizard**: Country-aware onboarding (Tunisia, France, Canada, USA, Gulf, Germany) with auto-configuration of photo rules, page limits, and preferred templates
- **Industry Adaptation**: 8 job categories with simplified mode for manual trades (hides GitHub/LinkedIn/projects for construction workers, drivers, etc.)
- **AI Integration**: Edge functions for bullet enhancement, summary generation, skill suggestions, job matching, and full resume pre-fill
- **5 Resume Templates**: Essentiel, Horizon, Trajectoire, Direction, Signature -- each with distinct visual identity
- **Website Builder**: Profile and Portfolio modes with 13 section types, drag-and-drop reordering, per-section styling, undo/redo
- **Growth Engine**: Onboarding checklist, usage tracking, freemium tiers (Free/Student/Pro) priced in TND
- **Admin Panel**: User management, analytics, contacts

## Gaps and Improvement Opportunities

### 1. UI/UX Improvements

**Landing Page**
- No Arabic language toggle despite targeting Tunisia (Arabic is primary language)
- Hero roles list is small (8 roles) -- should include more Tunisian-relevant professions
- Trust badges show "5,200+ CV" -- likely hardcoded/fake; needs real data or removal
- No mobile-optimized resume preview demo on landing page
- Missing social proof from Tunisian companies/universities

**Resume Builder**
- No live side-by-side preview while editing (only at step 9)
- Step 5 "Additional Sections" is skipped in simplified mode but references in data still exist
- No LinkedIn/PDF import flow visible in UI (edge function exists)
- Cover letter generator exists as edge function but no UI integration found
- No PDF export button visible in the step components (likely in StepPreview but needs verification)

**Website Builder**
- No real-time preview alongside editor
- Missing SEO fields (meta description, OG image exist in types but no UI)
- No analytics/visitor tracking for published sites

### 2. Tunisian Market Specific Gaps

- **No Arabic support**: All UI is French-only. Arabic RTL layout needed for domestic market
- **No "Service Militaire" field**: Required for male candidates in Tunisia
- **No SIVP/KARAMA/AMAL mentions**: Government employment programs Tunisian candidates reference
- **No CIN (Carte d'Identite Nationale) field**: Sometimes required on Tunisian CVs
- **Missing Tunisian job platforms integration**: Tanitjobs, Emploi.tn, Keejob sharing
- **No WhatsApp sharing**: Primary communication channel in Tunisia

### 3. Template Improvements

- Templates use inline styles (not Tailwind) -- good for PDF export but limits customization
- No dark mode variants
- Missing industry-specific templates (medical, legal, academic CV formats)
- No A4 page-break handling for multi-page CVs

---

## Implementation Plan (Prioritized)

### Phase 1: Critical UX Fixes (High Impact, Low Effort)

**1.1 Add Split-Screen Live Preview to Resume Builder**
- Add a responsive two-column layout in `ResumeBuilder.tsx` for desktop (form left, preview right)
- Use existing `ResumePreview` component
- Mobile: keep current step-based flow

**1.2 Integrate Cover Letter Generator UI**
- Create `src/pages/CoverLetterPage.tsx` or modal in Dashboard
- Wire to existing `cover-letter` edge function
- Allow generating from any saved resume

**1.3 Add WhatsApp Share Button**
- Add to `StepPreview.tsx` and `WebsiteBuilder.tsx` header
- `https://wa.me/?text=` with site URL

**1.4 Add Missing Tunisian Fields**
- Add `militaryService` (optional) to `PersonalInfo` type
- Add `cin` field (optional, hidden by default, shown for Tunisia)
- Update `StepPersonalInfo` to conditionally show based on `targetCountry`

### Phase 2: Multilingual Support (High Impact, Medium Effort)

**2.1 i18n Infrastructure**
- Install `react-i18next`
- Create `src/locales/fr.json` and `src/locales/ar.json`
- Extract all hardcoded French strings from components
- Add language switcher in navbar and settings

**2.2 RTL Layout Support**
- Add `dir="rtl"` toggle to `<html>` element
- Add Tailwind RTL plugin
- Test all components in RTL mode

### Phase 3: Template & Export Enhancements (Medium Impact, Medium Effort)

**3.1 New Industry Templates**
- **"Academique"**: For university applications (publications, research)
- **"Medical"**: For healthcare with certifications prominent
- **"Technique"**: For construction/manual trades with licenses/permits highlighted
- Add to `ResumePreview.tsx` template switch

**3.2 PDF Export Improvements**
- Add A4 page-break CSS with `@media print`
- Add watermark removal for paid plans
- Multi-page support with proper pagination

**3.3 Resume Import from LinkedIn/PDF**
- Add UI button in Dashboard "Importer un CV"
- Wire to existing `resume-import` edge function
- Parse and map to `ResumeData` structure

### Phase 4: SEO & Growth (Medium Impact, Low Effort)

**4.1 Public Website SEO**
- Add meta description editor in WebsiteEditor
- Add OG image upload (fields exist in types, need UI)
- Generate structured data (JSON-LD) for published sites
- Add `<title>` and `<meta>` via react-helmet

**4.2 Tunisian Job Platform Integration**
- Add "Partager sur Tanitjobs" / "Emploi.tn" buttons
- Deep links to create profiles on those platforms

**4.3 Analytics for Published Websites**
- Track page views per published site
- Show visitor count in Dashboard website cards
- Add simple analytics table in Supabase

### Phase 5: Advanced AI Features (High Impact, Higher Effort)

**5.1 AI Chat Assistant in Resume Builder**
- Floating chat widget using Lovable AI Gateway
- Context-aware: knows current step, user data, target country
- Can answer "How should I describe my experience at X?"

**5.2 Job Description Matching UI**
- Add "Coller une offre d'emploi" textarea in StepPreview
- Display match score, matched/missing keywords
- Wire to existing `match-job` action in resume-ai edge function

**5.3 AI-Powered Section Suggestions**
- After wizard completion, suggest which optional sections to enable
- Based on job field, experience level, and target country

---

## Technical Recommendations

- **Accessibility**: Add `aria-labels`, keyboard navigation for wizard cards, focus management between steps
- **Performance**: Lazy-load landing page sections below fold; code-split ResumeBuilder and WebsiteBuilder
- **Responsive**: Resume preview needs `transform: scale()` wrapper for mobile viewing
- **Testing**: Add Playwright tests for critical flows (wizard -> preview, publish website)
- **Security**: The `resume-ai` edge function uses `AI_API_KEY` env var -- should migrate to `LOVABLE_API_KEY` for consistency with Lovable AI Gateway

