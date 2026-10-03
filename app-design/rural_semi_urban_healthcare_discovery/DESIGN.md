---
name: Rural & Semi-Urban Healthcare Discovery
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
  error: '#DC2626'
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
  bg-canvas: '#F8FAFC'
  text-muted: '#475569'
  border-subtle: '#E2E8F0'
  success: '#16A34A'
  success-soft: '#DCFCE7'
  warning: '#D97706'
  warning-soft: '#FEF3C7'
  error-soft: '#FEE2E2'
  info: '#2563EB'
  status-unknown: '#64748B'
typography:
  headline-xl:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Noto Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-md:
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
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  label-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-sm: 0.75rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system is tailored for healthcare discovery across rural, semi-urban, and localized communities. The primary goal is delivering immediate clarity on four critical dimensions: **Who** (Doctor identity & specialty), **What** (Health problem match), **Where** (Practice location, verified landmark, & distance), and **When** (Real-time availability & daily timings).

The brand personality centers on:
- **Calm & Trustworthy:** Replacing intimidating clinical tropes or generic hospital-blue branding with a fresh, restorative, and dependable atmosphere.
- **Approachable & Human:** Warm, welcoming, and intuitive for users navigating anxiety-inducing health situations or operating basic mobile devices with varied literacy levels.
- **Practical & Purpose-Driven:** Utilitarian, highly readable, low-latency, and devoid of performative gradients or heavy assets.

The visual style blends **Modern Utilitarian Minimalism** with **Tactile Clarity**:
- **Clean Light Hierarchy:** Grounded in a crisp canvas, high text-to-surface contrast ratios (exceeding WCAG AAA for key copy), and purposeful negative space.
- **Low-Bandwidth Resilience:** Built to load effortlessly across 2G/3G networks, prioritizing system typography, clean vector lines, and semantic color-coded chips over rich media and complex blurs.

## Colors

The color palette intentionally avoids typical harsh hospital blues in favor of a balanced botanical teal structure. Teal conveys clinical hygiene, freshness, calmness, and community healthcare.

### Functional Roles & Guidelines

- **Primary Teal (`#0F766E`):** Reserved for high-value interactive drivers—primary action buttons, main search triggers, key interactive links, and brand landmarks. Avoid overusing it on static containers.
- **Deep Teal (`#115E59`):** Provides physical press feedback for touch states, high-contrast text on soft teal containers, and solid foundation surfaces in admin layouts.
- **Soft Teal (`#CCFBF1`):** Applied exclusively as a restful, low-glare background for selected filters, active pill states, and current navigation indicators.
- **Neutrals (`#F8FAFC`, `#FFFFFF`, `#0F172A`, `#475569`, `#E2E8F0`):** Build a layered, glare-resistant interface. `#F8FAFC` anchors the page canvas, while `#FFFFFF` brings cards forward without heavy drop shadows. High-contrast Slate text ensures effortless reading under bright outdoor sunlight.

### Strict Color Independence Rule
Never communicate clinical availability or critical status through color alone. Every badge, indicator dot, or status banner must pair its chromatic token with an explicit text label and supporting icon symbol (e.g., `● Available today`, `▲ Schedule may have changed`).

## Typography

Typography is powered by `Noto Sans` paired natively with `Noto Sans Bengali` (with `Hind Siliguri` as a localized alternative). This stack provides clean conjunct rendering, balanced diacritics, and open counters.

### Script & Line-Height Adaptation
- **Expanded Vertical Clearance:** Complex non-Latin scripts such as Bengali require generous line spacing to prevent vowel matras and conjunct ascenders/descenders from clipping. Line heights must never drop below 1.4× the font size on body copy.
- **Horizontal Elasticity:** Translated strings often run 20% to 35% wider than their Latin counterparts. Typography styles avoid tight tracking and preserve room for wrapping without breaking actionable layouts.
- **Weight Restraint:** Maintain a deliberate two-tier balance: regular (`400`) for descriptive copy and semibold/bold (`600`/`700`) for interactive labels, doctor titles, and availability indicators. Avoid ultra-thin or ultra-black weights.

## Layout & Spacing

The layout system enforces an 8pt architectural rhythm (with a 4pt sub-grid for badges and compact form elements). It balances two core contexts: a single-column, touch-first mobile experience for patients, and an expansive data workspace for portal administrators.

### Layout Mechanics & Breakpoints
- **Mobile Handheld (320px – 639px):** 4-column fluid system. Canvas margin is `1rem` (16px), with a `0.75rem` gutter between grid elements. Touch-first elements stretch edge-to-edge within comfortable side insets.
- **Tablet / Phablet (640px – 1023px):** 8-column layout with `1.5rem` margins and `1rem` gutters. Useful for counter-top pharmacy setups or triage receptionists.
- **Desktop Admin (1024px+):** 12-column layout with a fixed `115E59` primary sidebar navigation (260px) and a fluid work surface. Canvas margins scale to `2rem`.

### Ergonomic Touch Sizing
Any interactive target on mobile patient layouts—search bars, filter chips, call triggers, direction buttons, language switchers—must respect a minimum touch target area of **48px × 48px** to remain accessible for elderly users and one-handed operation.

## Elevation & Depth

To remain fast and legible on low-tier screens in direct outdoor sunlight, this design system avoids heavy drop shadows, diffused skeuomorphic gradients, and GPU-intensive multi-stage blurs.

### Surface Hierarchy & Contrast Outlines
Depth is structured strictly through **tonal separation** and **crisp 1px border containment**:
- **Layer 0 (Canvas):** The base `#F8FAFC` foundation provides a neutral, glare-free backdrop.
- **Layer 1 (Card & Content Blocks):** Solid `#FFFFFF` surfaces bounded by a continuous `1px solid #E2E8F0` border. This delivers clear boundary definitions on washed-out budget displays.
- **Layer 2 (State & Emphasis Blocks):** Tinted flat surfaces (`#CCFBF1`, `#DCFCE7`, `#FEF3C7`, `#FEE2E2`) set directly on Layer 1 cards to highlight availability, warning callouts, and active selection without requiring elevation steps.
- **Layer 3 (Modals & Bottom Action Sheets):** Floating elements use a clean structural border accompanied only by a subtle grounding shadow: `0 4px 16px -2px rgba(15, 23, 42, 0.08)`. Overlays use a solid semi-transparent wash: `rgba(15, 23, 42, 0.5)`.

## Shapes

The design system uses standard **Rounded (Level 2)** geometry, balancing clinical confidence with a friendly, welcoming neighborhood feel.

- **Base Radius (0.5rem / 8px):** Standard containers, input fields, search wrappers, alerts, and doctor result cards.
- **Large Radius (`rounded-lg`, 1rem / 16px):** Bottom action sheets, modal dialogs, and primary triage grouping frames.
- **Full Radius (`rounded-full`):** Category pill chips, verification check capsules, and floating call/action icon rings.

Avoid sharp corners (`0px`), which appear harsh and clinical, as well as oversized hyper-curved elements, which consume valuable screen real estate needed for localized multi-line text.

## Components

### Buttons
- **Primary Action:** Solid `#0F766E` background with `#FFFFFF` text. Minimum height `48px` on mobile with `1rem` horizontal padding. Pressed state deepens to `#115E59`. Focused state adds a `2px` offset outline using `#0F766E`.
- **Secondary / Outlined:** `#FFFFFF` background, `1px solid #E2E8F0` border, and `#0F766E` text. Pressed state transitions background to `#F8FAFC`.
- **Destructive:** `#DC2626` background with `#FFFFFF` text. Reserved strictly for non-reversible modifications (e.g., deleting doctor verification records).

### Chips & Filter Pills
- **Unselected:** `#FFFFFF` background, `1px solid #E2E8F0`, and `#475569` text.
- **Selected:** `#CCFBF1` background, `1px solid #0F766E`, and `#115E59` bold text. Height is `36px` to maintain comfortable tap density in horizontal scrolling rails.

### Doctor Availability Cards
- White `#FFFFFF` container with `1px solid #E2E8F0` border and `1rem` internal padding.
- **Header:** Doctor Name (`headline-md`, `#0F172A`) paired with specialty badge (`body-md`, `#475569`).
- **Availability Pill:** Prominently placed with an icon and full status copy (e.g., `● Available today` using `#DCFCE7` background, `#16A34A` text; `▲ Scheduled today` using `#FEF3C7` background, `#D97706` text; `■ Not available today` using `#FEE2E2` background, `#DC2626` text).
- **Location & Distance Context:** Landmark and physical store name (e.g., *Maa Medical Store*) with distance in kilometers (`body-sm`, `#475569`) and today's visiting window.
- **Action Strip:** Dual button row featuring a secondary **View Profile** button and a primary teal **Call / Directions** trigger.

### Input Fields & Search
- Background `#FFFFFF`, border `1px solid #E2E8F0`, corner radius `8px`, and `14px` padding. Text is `#0F172A` with `#475569` placeholder copy.
- **Active Focus:** Border transitions to `2px solid #0F766E` without layout shift.
- The home discovery search bar has prominent prominence with a leading search icon, quick location switcher, and clear voice/text affordances.

### Checkboxes & Radio Buttons
- `20px × 20px` target size within a `48px` padded touch zone.
- Unchecked: `#FFFFFF` with `2px solid #E2E8F0`.
- Checked: `#0F766E` fill with an inset `#FFFFFF` glyph.

### Verification & Data Freshness Badges
- Verified status displays as an inline pill: `✓ Verified Recently` with last verified timestamp (e.g., `Last verified: Today, 3:30 PM`) in `label-sm` text.
- Stale or unverified alerts show an explicit warning box: `#FEF3C7` background, `#D97706` border and text, warning that clinic timings may have changed.