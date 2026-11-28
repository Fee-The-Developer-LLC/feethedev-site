---
version: 2.0
name: 'Fee The Developer Signal System (Aether)'
description: 'A deep-space studio and client portal: glass panels, plasma-cyan signals, clear status, and published facts only.'
colors:
  void: '#05070E'
  card: '#0A0D18'
  silver: '#F3F6FA'
  muted: '#94A3B8'
  steel: '#64748B'
  plasma: '#00F0FF'
  electric: '#3B82F6'
  emerald: '#10B981'
  coral: '#FF6B4A'
typography:
  display:
    fontFamily: 'Plus Jakarta Sans, sans-serif'
  sans:
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
  mono:
    fontFamily: 'Geist, ui-monospace, monospace'
rounded:
  DEFAULT: '1rem'
  sm: '0.5rem'
  md: '1.25rem'
  lg: '2rem'
  full: '9999px'
spacing:
  section-gap: '4rem'
  page-max: '80rem'
components:
  button: {}
  card: {}
  navigation: {}
  status: {}
---

# Fee The Developer Design System

## Overview

### Creative North Star

The interface behaves like a calm systems console: connected signals, legible status, and selective illumination show clients where their work stands without turning the product into a sci-fi prop.

### Product context and register

- **Audience and primary job:** Prospective clients compare services and prices; signed-in clients orient themselves, reach project resources, and join Fee The Developer communities.
- **Target market:** United States service businesses and operators, based on maintained site configuration and copy.
- **Locale:** English (`en-US`).
- **Usage scene:** Mobile and desktop, occasional client check-ins, low-to-medium information density.
- **Register:** Hybrid. Public routes are brand-led; `/dashboard` is product-led and quieter.
- **Memorable signature:** A signal rail that turns service, project, and community touchpoints into one connected path. External learning records are presented as individual continuing education, never as company certification or platform endorsement.
- **Restraint:** Client data, navigation, status, and calls to action remain familiar, stable, and easy to scan.
- **Anti-references:** Generic white SaaS dashboards; excessive neon decoration; fake metrics or unsupported client activity.
- **Token ownership/runtime mapping:** This file documents the canonical values implemented in `tailwind.config.ts` and `styles/globals.css`. Runtime token changes must update this document in the same change.

## Colors

Adopted 2026-11-28 from the Stitch "Aether Cybernetic" handoff (dynamic 3D service pages). The canvas is void (`#05070E`) with off-center cyan, blue and coral mesh glows; panels are card navy (`#0A0D18`) glass. Plasma cyan (`#00F0FF`) is the primary signal: active states, key chips, focus rings, primary-pill bloom. Electric blue (`#3B82F6`) is structural. Coral (`#FF6B4A`) marks emphasis and the veteran-discount price. Emerald (`#10B981`) means live/ready (pulse dots). White titles, slate (`#94A3B8`) body, steel (`#64748B`) metadata. Legacy Tailwind names (`greenglow`, `redglow`, `cyan`, `electric`, `background`, `panel`) now resolve to these values so older pages follow the palette; new work uses `void`, `card`, `plasma`, `emerald`, `coral`, `steel`.

## Typography

Plus Jakarta Sans (`font-display`, applied to h1–h3) carries headings with tight negative tracking. Inter (`font-sans`) carries body copy. Geist (`font-mono`, `.label-mono`) carries uppercase metadata labels, chips and pill buttons. Punchlines may use `.ftd-gradient-text` (coral → blue → cyan) or `.ftd-cyan-text`. Numeric prices use tabular alignment.

## Layout

Public pages use the shared 80rem shell and generous section rhythm. The dashboard uses a compact product header, a two-column desktop grid, and a single-column mobile flow. Content owns document scrolling; panels do not trap scroll. Persistent geometry is reserved for loading and empty states.

## Elevation & Depth

Glass primitives live in `styles/globals.css`: `.aether-card` (Level 1 glass, 16px blur, hairline rim, cyan top-edge light; `--coral` / `--emerald` variants), `.aether-card--interactive` (Level 2 cyan rim and aura on hover), `.pill-primary` (white pill, void text, plasma bloom), `.pill-glass` (outline pill), `.status-chip`, `.pulse-dot`, and `.orbit-node` (numbered step node tinted by the `--node` RGB variable). Hierarchy also comes from tonal panels, one-pixel translucent borders, limited blur, and soft shadows. Interactive cards may lift slightly; operational dashboard cards do not scale so scanning remains stable. Public media cards may add a pointer-driven perspective tilt (`components/Tilt3D.tsx`, at most about 6°) with a soft following glare; it is limited to fine-pointer devices, never applies to dashboard surfaces, and is removed under reduced motion.

## Shapes

Pills are reserved for status and short actions. Content panels use 1.25–1.5rem radii. Small controls use 0.75–1rem radii. Borders remain thin and quiet.

## Components

### Foundational visual states

Interactive elements provide default, hover, focus-visible, active, disabled, and busy states. Empty states explain the next useful action. Loading uses a stable app-owned indicator. Motion is removed under reduced-motion preferences.

### Buttons and actions

Primary actions use solid or luminous treatments; secondary actions use quiet outlined surfaces. Labels describe the outcome. External destinations include an external-link cue in text or accessible naming.

### Navigation and data display

Public navigation is kept short: a glass pill nav with Services, Pricing, Work and How we build (current page marked through `components/NavLink.tsx`), plus sign-in and a primary pill. The footer lists every service line, company links and contact. The home page shows only catalog-derived facts (published pricing, lowest starter price, veteran discount, service count). The services page leads with category chips (with live counts), three featured builds, the full catalog with veteran prices computed from `lib/pricing-catalog.json`, and a three-step engagement rail. Design mockup metrics (uptime, pipeline value, delivery days, case-study numbers) are not used because no source backs them. Each service has its own page at `/services/<slug>` with a Stripe checkout call to action. Credentials, program pages, and the Client portal are linked from the footer. The `/stack` page (How we build) lists the platforms FTD uses and the five-step workflow; the homepage carries a short text-only "Built with" strip that links to it. Vendor names appear as plain text, never logos, until each owner grants written permission, and they never imply endorsement or partnership. Keep vendor names out of metadata keywords; the source of truth and brand rules live in `lib/stack.ts`. Product navigation marks the current destination. Lists favor semantic markup and explicit statuses over decorative charts.

### Forms and overlays

Clerk owns authentication fields and validation. App forms use visible labels, app-owned errors, and `noValidate`. No browser-native alert, confirm, or prompt dialogs are used.

### Iconography

Icons are simple inline SVG strokes at 20–24px. Text labels remain present for primary navigation and actions.

### Motion

Motion suggests signal flow and state change. The public homepage uses one continuous signal-current composition: a deliberate hero entrance, a scroll-progress rail, scrubbed statement text, and scale/fade media transitions. GSAP owns this page-level choreography; routine component transitions remain 180–700ms with custom ease-out curves. The homepage hero adds a decorative 3D signal field (`components/three/`): a brand-colored node network with packets travelling along its links, slow pointer parallax, and a scroll-linked drift. It is plain three.js loaded after hydration, stays quiet behind the headline via a contrast mask, pauses off-screen, and is not rendered for reduced-motion visitors or browsers without WebGL. The home hero frames the brand globe clip inside a glass console (`components/GlobeConsole.tsx`) with brand-only corner labels (never live system data) and the Build · Automate · Create · Scale chips; reduced-motion visitors get the still frame. The home page middle section is a barber ad reel (`components/BarberAdReel.tsx`, data in `lib/barber-ads.ts`): vertical ads in phone frames, each ending on its catalog buy button, with an "Ad in production" label until footage lands and an AI-generated label whenever a generated person is on screen. Home page products are a tabbed shelf, one tab per catalog line, each product a card with price, a buy button and a details link (`components/ProductShelf.tsx`). Ambient audio is optional, starts only after a visitor activates the labeled control, and never autoplays. Routine dashboard interaction remains quiet. Reduced-motion users receive static states.

### Content and data visualization

The voice is direct, specific, and client-centered. Status copy never implies live project data or connected services unless backed by a real source.

## Do's and Don'ts

- **Do:** Keep public and portal routes recognizably part of the same signal system.
- **Do:** Label unavailable or unconfigured destinations honestly.
- **Don't:** Invent project progress, subscriber counts, testimonials, or financial terms.
- **Don't:** Trade navigation clarity or contrast for atmospheric effects.
