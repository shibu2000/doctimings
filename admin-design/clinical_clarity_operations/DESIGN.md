---
name: Clinical Clarity & Operations
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
  border-subtle: '#E2E8F0'
  text-secondary: '#475569'
  status-unknown: '#64748B'
  success-green: '#16A34A'
  success-soft: '#DCFCE7'
  warning-amber: '#D97706'
  warning-soft: '#FEF3C7'
  error-red: '#DC2626'
  error-soft: '#FEE2E2'
  info-blue: '#2563EB'
typography:
  headline-xl:
    fontFamily: Noto Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-tabular:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system establishes a high-trust, functional, and rigorously operational atmosphere for healthcare data verification, doctor catalog governance, and availability tracking across semi-urban and rural regions. It eliminates marketing-driven visual clutter, subjective ratings, and hospital-generic blue tropes in favor of an institutional yet humanized presence.

### Tone and Personality
- **Operational & Precise:** Built for data stewards, ground verification agents, and operations managers who review clinic timings, credentials, and real-time availability.
- **Dignified & Pragmatic:** Prioritizes clarity, legibility, and high information throughput over decorative design patterns.
- **Reliable & Traceable:** Elevates timestamps, verification trails, and audit statuses to first-class visual citizens.

### Design Movement
The system implements **Corporate / Modern utilitarianism** accented with **Low-Contrast Structural Boundaries**. Interfaces rely on crisp 1px borders, subtle tonal layering, structured tables, and deliberate status pills rather than heavy elevation drops or blurry visual artifacts.

## Colors

The color palette centers around a distinct Teal scale, avoiding typical hospital-blue tropes while retaining clinical cleanliness and professional grounding.

### Hierarchy & Application
- **Primary Teal (`#0F766E`):** Primary operational CTAs, focused borders, active tabs, and positive validation triggers.
- **Deep Teal (`#115E59`):** Persistent administrative navigation rails, top app headers, dense command toolbars, and high-emphasis hover/pressed states.
- **Soft Teal (`#CCFBF1`):** Active table row selection, current navigation pill backgrounds, and primary badge containers.
- **Surface & Background:** `#F8FAFC` forms the outer canvas layer, while `#FFFFFF` defines data cards, inspection trays, table containers, and modal sheets.
- **Borders:** `#E2E8F0` defines all element bounding boxes, cell boundaries, and structural dividers.

### Verification & State Color Pairings
Every state pill or banner must pair an accessible foreground text/symbol color with its corresponding tinted soft container:
- **Verified / Available:** Success Green (`#16A34A`) on Success Soft (`#DCFCE7`).
- **Pending Review / Scheduled:** Warning Amber (`#D97706`) on Warning Soft (`#FEF3C7`).
- **Unavailable / Rejected / Flagged:** Error Red (`#DC2626`) on Error Soft (`#FEE2E2`).
- **Unverified / Stale / Unknown:** Status Unknown (`#64748B`) on Subtle Background (`#F1F5F9`).
- **System Information / Audit Notice:** Info Blue (`#2563EB`) on Light Blue (`#EFF6FF`).

## Typography

The typographic hierarchy uses **Noto Sans**, providing high cross-platform stability, broad Indic script parity (including native Bengali and Hindi support), and clear glyph distinction for medical registrations, registration numbers, and dates.

### Rules of Usage
- **Weight Restraint:** Limit weights strictly to Regular (400), Medium (500), SemiBold (600), and Bold (700 for page-level headers only). Avoid super-light or black weights.
- **Tabular Figures:** Timestamps, phone numbers, medical license IDs, and schedule hours use CSS `font-variant-numeric: tabular-nums` to maintain vertical alignment in tables.
- **Multilingual Resilience:** Line heights maintain a minimum of 1.4x for body and label scales to prevent vowel diacritics in Indic scripts from colliding or clipping.

## Layout & Spacing

The administration workspace utilizes a responsive fluid layout with a fixed high-contrast side navigation bar on desktop environments.

### Structure & Form Factors
- **Desktop (1024px+):** Fixed 260px sidebar navigation pinned to Deep Teal (`#115E59`). The workspace area spans fluidly with a maximum width cap of 1600px, flanked by 32px (`margin-desktop`) padding and 24px (`gutter-desktop`) inter-card grid gutters.
- **Tablet (768px – 1023px):** Sidebar collapses to an icon-only 64px rail. Content reflows into a single or dual-column configuration with 16px margins.
- **Mobile (Below 768px):** Navigation transitions to an off-canvas drawer with an operational top app bar. Data tables transition into structured field cards.

### Grid Rhythm
Components align to a base 4px/8px incremental scale. Operational data tables prioritize vertical scan density, utilizing 8px vertical cell padding and 12px horizontal cell padding.

## Elevation & Depth

To preserve an operational, low-latency, and glare-free aesthetic suited for varied office lighting and mobile field tablets, depth is communicated through **structural borders and tonal separation** rather than diffuse drop shadows.

### Elevation Hierarchy
- **Canvas Base:** Flat `#F8FAFC`.
- **Level 1 (Data Cards, Table Sheets, Toolbars):** `#FFFFFF` surface bounded by a crisp 1px solid `#E2E8F0` border. No shadow.
- **Level 2 (Dropdowns, Verification Flyouts, Filter Menus):** `#FFFFFF` background, 1px `#CBD5E1` border, reinforced by a directional micro-shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modals, Confirmation Sheets):** `#FFFFFF` surface surrounded by a 1px border and a grounded shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.06)`, anchored over a `#0F172A` backdrop scrim at 40% opacity.

## Shapes

The design system incorporates **Soft (Level 1)** geometric curvature, reinforcing a pragmatic, durable tool suitable for information density and precise alignment.

### Geometry Specs
- **Inputs, Buttons, and Table Controls:** 4px radius (`rounded`).
- **Cards, Panels, and Table Wrappers:** 8px radius (`rounded-lg`).
- **Status Pills, Badges, and Availability Indicators:** Fully rounded 9999px pill radius for instant peripheral recognition against square table cells.
- **Tab Dividers & Checkboxes:** 3px radius for controls.

## Components

### Buttons
- **Primary CTA:** Surface `#0F766E`, text `#FFFFFF`, border-radius 4px, height 36px (admin compact) or 44px (field/touch). Hover: `#115E59`. Active/Pressed: `#134E4A`.
- **Secondary / Outline:** Surface `#FFFFFF`, text `#0F766E`, border 1px solid `#E2E8F0`. Hover: `#F0FDFA` with border `#0F766E`.
- **Destructive:** Surface `#DC2626`, text `#FFFFFF`. Hover: `#B91C1C`.
- **Table Inline Action:** Text button, font size 12px, font weight 600, color `#0F766E`, hover underline or subtle `#CCFBF1` background tint.

### Badges & Verification Status Indicators
Verification status indicators are mandatory for all entity rows and header summaries:
- **Format:** Always include an explicit semantic icon, label text, and audit meta.
- **Verified:** Container `#DCFCE7`, text `#16A34A`, icon checkmark. Sub-caption below or inline tooltip: `"Verified · [DD Mon YYYY] by [Reviewer Name/ID]"`.
- **Pending Review:** Container `#FEF3C7`, text `#D97706`, icon alert-triangle. Label: `"Review Required"`.
- **Rejected / Stale:** Container `#FEE2E2`, text `#DC2626`, icon cross-circle. Label: `"Data Mismatch"`.
- **Scheduled / Shift Active:** Container `#F1F5F9`, text `#0F172A`, icon clock. Label: `"Today · [Start Time] - [End Time]"`.

### Form Fields & Inputs
- **Base Input:** Background `#FFFFFF`, border 1px solid `#E2E8F0`, padding 8px 12px, font size 14px, text `#0F172A`, placeholder `#94A3B8`.
- **Focus State:** 1px solid `#0F766E`, ring 2px soft teal (`rgba(15, 118, 110, 0.2)`).
- **Error State:** Border 1px solid `#DC2626`, accompanying helper text in `#DC2626`.

### Operational Data Tables
- **Container:** Full width, background `#FFFFFF`, border 1px solid `#E2E8F0`, border-radius 8px, overflow-x auto.
- **Header (`<thead>`):** Background `#F8FAFC`, bottom border 1px solid `#E2E8F0`, text 11px uppercase bold `#475569`, padding 10px 16px.
- **Row (`<tr>`):** Height 48px, border-bottom 1px solid `#F1F5F9`. Hover state `#F8FAFC`. Selected state `#F0FDFA` with a 2px left border accent in `#0F766E`.
- **Cell Content:** Left-aligned text; numerical metadata and license IDs set in tabular monospace/Noto Sans numerals.

### Reserved Future / Coming-Soon Spaces
- **Container:** Border 1px dashed `#CBD5E1`, background `#F8FAFC`, radius 8px, padding 24px.
- **Content:** Status tag `"Future Integration"`, neutral header, brief operational spec of planned capabilities (e.g., "Automated Tele-verification Feed"), explicitly devoid of promotional language.