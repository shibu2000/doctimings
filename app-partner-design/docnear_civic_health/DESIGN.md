---
name: DocNear Civic Health
colors:
  surface: '#FFFFFF'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#216963'
  on-secondary: '#ffffff'
  secondary-container: '#a8ece5'
  on-secondary-container: '#266d68'
  tertiary: '#2d5951'
  on-tertiary: '#ffffff'
  tertiary-container: '#467169'
  on-tertiary-container: '#c5f3ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#abefe8'
  secondary-fixed-dim: '#8fd3cc'
  on-secondary-fixed: '#00201e'
  on-secondary-fixed-variant: '#00504b'
  tertiary-fixed: '#bdece2'
  tertiary-fixed-dim: '#a2d0c6'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#224e47'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  app-bg: '#F8FAFC'
  text-muted: '#475569'
  border-subtle: '#E2E8F0'
  status-success: '#16A34A'
  status-success-soft: '#DCFCE7'
  status-warning: '#D97706'
  status-warning-soft: '#FEF3C7'
  status-error: '#DC2626'
  status-error-soft: '#FEE2E2'
  status-info: '#2563EB'
  status-unknown: '#64748B'
typography:
  headline-xl:
    fontFamily: Noto Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Noto Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Noto Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a calm, accessible, and grounded healthcare experience crafted primarily for mobile-first patient discovery in regional, rural, and semi-urban communities, while scaling fluidly into operational, data-dense administration portals. 

The aesthetic is anchored in **Modern Functionalism with Low-Contrast Clarity**:
- **Trustworthy & Human:** Replaces sterile, institutional hospital blues with an earthy, restorative deep teal palette that conveys clinical capability and local approachability.
- **Utilitarian & Honest:** Avoids heavy gradients, synthetic blurs, or distracting decorative elements. Information architecture prioritizes the core healthcare quartet: *Who* (Doctor), *What* (Specialty), *Where* (Location/Distance), and *When* (Immediate real-time availability).
- **Low-Bandwidth & Device Resilient:** Engineered to remain razor-sharp and readable across low-cost mobile displays and under direct sunlight, respecting battery and network constraints through crisp typography and flat, structured surfaces.

## Colors

The palette is compact, deliberate, and optimized for high-contrast accessibility. Teal serves as the anchor, establishing fresh clarity without clinical coldness.

### Application Hierarchy
- **Primary Teal (`#0F766E`):** Reserved for primary interactive touchpoints, active states, key brand touchpoints, and verified affordances. Never overused on secondary actions to preserve visual urgency.
- **Deep Teal (`#115E59`):** Provides pressed feedback states for buttons, high-emphasis typographic accents over soft teal backdrops, and the foundational tone for administrative chrome/sidebars.
- **Soft Teal (`#CCFBF1`):** Applied to active filter pills, selected list records, and gentle highlighted regions.
- **Backgrounds & Neutrals:** `#F8FAFC` keeps the canvas comfortable under long reading sessions, while pure `#FFFFFF` elevates content cards and functional search containers with crisp `#E2E8F0` structural boundaries.
- **Availability & Semantic System:** Critical states (Available, Scheduled, Unknown, Not Available) must never rely purely on chroma. Every semantic badge combines tinted backgrounds (`-soft`) with high-contrast text and a geometric glyph or descriptive textual indicator.

## Typography

Typography relies on **Noto Sans** (with fallback parity to Noto Sans Bengali and Hind Siliguri) to ensure flawless legibility across diverse regional languages and scripts.

- **Vertical Proportion:** Line heights are maintained generously (`1.4` to `1.55`) to accommodate complex glyphs and ascenders/descenders common in multi-script deployments without visual overlap.
- **Hierarchy:** Weight steps are restrained primarily to Regular (`400`), Medium (`500`), and Semi-Bold (`600`), avoiding hyper-condensed display cuts or heavy black weights that distort on low-DPI displays.
- **Labels & Micro-copy:** Availability, verification stamps, and table metadata use `label-md` and `label-sm` with slightly heightened tracking to maintain legibility at glance speed.

## Layout & Spacing

The layout model adapts between a single-column, touch-optimized fluid layout on mobile and a 12-column structured data grid on administrative displays:

- **Mobile Viewport (<768px):** Uses an outer canvas margin of `1rem` (16px) with an edge-to-edge component cadence. Touch targets meet a minimum physical bounding box of 48×48px.
- **Desktop & Administrative Viewport (≥1024px):** Uses a persistent 260px administrative left rail with a fluid workspace utilizing `1.5rem` gutters and a maximum bounded layout container of 1440px.
- **Rhythm:** An 8pt spatial grid anchors all interior spacing tokens (`0.25rem`, `0.5rem`, `1rem`, `1.5rem`, `2rem`), maintaining predictable vertical alignment across cards, search stacks, and modal drawers.

## Elevation & Depth

This design system avoids heavy drop shadows and synthetic elevation, prioritizing **tonal surface hierarchy and crisp boundary lines**:

- **Low-Contrast Outlines:** Visual separation is formed by 1px solid borders using `border-subtle` (`#E2E8F0`) set against the `#F8FAFC` base application background.
- **Tonal Layering:** 
  - Level 0 (App Canvas): `#F8FAFC`
  - Level 1 (Cards, Search Panels, Data Tables): `#FFFFFF` with 1px border.
  - Level 2 (Selected Controls & Interactive Highlights): `#CCFBF1` with `#0F766E` border or fill.
  - Level 3 (Floating Action Bars / Fixed Mobile Navigation): `#FFFFFF` accompanied by an ultra-subtle ambient lift: `0px -2px 8px rgba(15, 23, 42, 0.04)` and top border `1px solid #E2E8F0`.
- **Modals & Drawers:** Mobile bottom-sheets use a 40% opacity dim overlay (`rgba(15, 23, 42, 0.40)`) with a clean surface break, ensuring background distractions are muted without GPU strain.

## Shapes

The geometric identity is defined by a balanced **Level 2 (Rounded)** curvature:
- **Buttons, Text Inputs, and Search:** Standard radius of `0.5rem` (8px), maintaining clean alignment with tabular content.
- **Cards and Modals:** `rounded-lg` of `1rem` (16px) provides soft containment that invites tap interaction without drifting into toy-like circularity.
- **Filter Chips & Status Indicators:** Use fully rounded pill caps (`9999px`) to immediately distinguish contextual interactive tags from structural content blocks.

## Components

### Buttons
- **Primary:** Background `#0F766E`, text `#FFFFFF`, border none. Minimum height 48px on mobile (`label-lg`). Pressed state shifts to `#115E59`.
- **Secondary / Outlined:** Background `#FFFFFF`, text `#0F766E`, border `1px solid #E2E8F0`. Pressed state shifts background to `#F8FAFC`.
- **Destructive:** Background `#DC2626`, text `#FFFFFF`. Reserved strictly for permanent record deletion or cancellation.

### Input Fields & Search Bar
- **Prominent Search:** Minimum height 52px, surface `#FFFFFF`, border `1px solid #E2E8F0`, padding `0 1rem`. Left icon in `#475569`. Active focus transitions border to `#0F766E` with a 2px outer outline ring at 20% opacity.
- **Inputs & Selects:** 48px height, typography `body-md` (`#0F172A`), placeholder text `#475569`. Error state applies border `#DC2626` and renders validation text using `label-sm`.

### Chips & Filter Pills
- **Unselected:** Background `#FFFFFF`, text `#475569`, border `1px solid #E2E8F0`.
- **Selected:** Background `#CCFBF1`, text `#115E59`, border `1px solid #0F766E`, semi-bold weight.

### Doctor Availability Cards
- White container (`#FFFFFF`) with `1px solid #E2E8F0` border and `1rem` internal padding.
- **Header:** Doctor name (`title-md`) and specialty (`body-md` in `#475569`).
- **Availability Flag:** Must combine an icon/bullet with explicit copy (e.g., `● Available today` in `#16A34A` over `#DCFCE7` pill container).
- **Proximity & Time:** Location name, distance (`4.2 km away`), and session times formatted in structured rows with consistent icon cues.
- **Actions:** Dual button row (Outlined "View Profile", Primary "Get Directions / Call").

### Data Tables & Status Badges (Admin Web)
- High-density rows with 44px height, light divider borders (`#E2E8F0`), and zebra hover highlighting (`#F8FAFC`).
- Status badges use pill containers with soft background matching status intent (`#DCFCE7`, `#FEF3C7`, `#FEE2E2`) paired with deep colored text (`#16A34A`, `#D97706`, `#DC2626`) and an accompanying status glyph.