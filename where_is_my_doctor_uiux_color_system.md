# Where Is My Doctor? — UI/UX Color System

## 1. Visual Direction

The visual system should communicate:

- Calm
- Trustworthy
- Friendly
- Local
- Practical
- Accessible

The design should feel appropriate for a healthcare discovery platform used by people in rural and semi-urban areas.

### Avoid

- Generic hospital-blue branding
- Heavy gradients
- Excessive colors
- Medical clichés
- Dense patient interfaces

### Design Mode

- Light mode first
- Clear hierarchy
- High contrast
- Simple, readable interfaces
- Mobile-first patient experience
- Operational and denser admin experience

---

# 2. Color Philosophy

The primary brand color is **Teal**, chosen to communicate healthcare, trust, freshness, and approachability without relying on the typical hospital-blue visual language.

The palette is intentionally compact so that semantic colors remain meaningful.

### Primary Brand

| Color | Hex | Usage |
|---|---|---|
| Primary Teal | `#0F766E` | Primary actions, links, brand elements |
| Deep Teal | `#115E59` | Pressed states, dark surfaces, strong emphasis |
| Soft Teal | `#CCFBF1` | Selected states, subtle backgrounds, chips |

---

# 3. Semantic Colors

Semantic colors should communicate system states consistently across the patient app and admin web.

| Color | Hex | Usage |
|---|---|---|
| Success Green | `#16A34A` | Available, verified, successful actions |
| Success Light | `#DCFCE7` | Success backgrounds |
| Warning Amber | `#D97706` | Scheduled, caution, attention required |
| Warning Light | `#FEF3C7` | Warning backgrounds |
| Error Red | `#DC2626` | Unavailable, errors, destructive actions |
| Error Light | `#FEE2E2` | Error backgrounds |
| Info Blue | `#2563EB` | Informational states and supporting UI |

---

# 4. Neutral Colors

| Color | Hex | Usage |
|---|---|---|
| Background | `#F8FAFC` | Main application background |
| Surface | `#FFFFFF` | Cards, modals, tables, panels |
| Text | `#0F172A` | Primary text |
| Secondary Text | `#475569` | Supporting text, descriptions |
| Border | `#E2E8F0` | Dividers, inputs, card borders |

---

# 5. Patient App Color System

The patient app should remain visually simple and low-density.

| UI Element | Color |
|---|---|
| App Background | `#F8FAFC` |
| Cards | `#FFFFFF` |
| Primary CTA | `#0F766E` |
| CTA Pressed | `#115E59` |
| Selected Chip | `#CCFBF1` |
| Primary Text | `#0F172A` |
| Secondary Text | `#475569` |
| Borders | `#E2E8F0` |

### Example Usage

Primary buttons:

```text
Background: #0F766E
Text:       #FFFFFF
Pressed:    #115E59
```

Selected filter/chip:

```text
Background: #CCFBF1
Text:       #115E59
```

---

# 6. Availability Colors

Availability is one of the most important UI concepts in the product.

| Status | Color | Hex |
|---|---|---|
| Available Today | Green | `#16A34A` |
| Scheduled Today | Amber | `#D97706` |
| Unknown | Slate | `#64748B` |
| Not Available | Red | `#DC2626` |

### User-Facing Labels

```text
🟢 Available today
🟡 Scheduled today
⚪ Availability unknown
🔴 Not available today
```

### Important Accessibility Rule

Do **not** communicate availability using color alone.

Always combine color with:

- Text label
- Icon where appropriate
- Clear status wording

For example:

```text
● Available today
```

is preferable to showing only a green dot.

---

# 7. Admin Web Color System

The admin interface is more operational and information-dense than the patient app.

| UI Element | Color |
|---|---|
| Sidebar | `#115E59` |
| Workspace | `#F8FAFC` |
| Cards / Tables | `#FFFFFF` |
| Primary Actions | `#0F766E` |
| Active Sidebar Background | `#CCFBF1` |
| Active Sidebar Text | `#115E59` |

The same semantic colors should be reused for:

- Success
- Warning
- Error
- Information
- Availability
- Verification states
- Report states

This keeps the two products visually consistent.

---

# 8. Suggested Admin Status Mapping

| Status | Color |
|---|---|
| Verified | `#16A34A` |
| Pending Review | `#D97706` |
| Needs Attention | `#D97706` |
| Rejected | `#DC2626` |
| Inactive | `#64748B` |
| Information | `#2563EB` |

Use text labels in addition to colors.

---

# 9. Typography

## Primary Font

Recommended:

```css
font-family: "Noto Sans Bengali", "Noto Sans", sans-serif;
```

This provides good support for both Bengali and Latin text.

## Alternative Bengali Font

```text
Hind Siliguri
```

### Typography Principles

- Use medium/semibold weight for labels and actions.
- Avoid excessive bold text.
- Keep body text highly readable.
- Maintain comfortable line height for Bengali text.
- Test typography on actual mobile devices.
- Avoid overly condensed fonts.

---

# 10. Color Usage Rules

## Primary Teal

Use for:

- Main CTA buttons
- Important links
- Active controls
- Brand elements
- Search actions
- Primary navigation actions

Do not use it for every interactive element. Too much teal reduces visual hierarchy.

## Deep Teal

Use for:

- Pressed states
- Strong navigation surfaces
- Admin sidebar
- High-emphasis text on light teal backgrounds

## Soft Teal

Use for:

- Selected chips
- Selected filters
- Active navigation backgrounds
- Subtle brand highlights
- Supporting surfaces

---

# 11. Semantic Color Rules

### Green

Use for:

- Available today
- Verified
- Successful operation
- Completed state

### Amber

Use for:

- Scheduled today
- Pending review
- Needs confirmation
- Important caution

### Red

Use for:

- Not available
- Errors
- Destructive actions
- Rejected states

### Slate

Use for:

- Unknown
- Inactive
- Neutral status

### Blue

Use for:

- Informational messages
- Help information
- Non-critical system guidance

---

# 12. Background and Surface Hierarchy

Recommended hierarchy:

```text
Application
└── Background: #F8FAFC
    │
    ├── Card
    │   └── Surface: #FFFFFF
    │
    ├── Input
    │   └── Surface: #FFFFFF
    │
    ├── Selected
    │   └── Soft Teal: #CCFBF1
    │
    └── Status
        ├── Success Light: #DCFCE7
        ├── Warning Light: #FEF3C7
        └── Error Light: #FEE2E2
```

This creates separation without relying heavily on shadows.

---

# 13. Borders and Dividers

Primary border:

```text
#E2E8F0
```

Use borders for:

- Cards
- Inputs
- Tables
- Dividers
- Search fields
- Filter controls

Avoid excessively dark borders.

---

# 14. Buttons

## Primary Button

```text
Background: #0F766E
Text:       #FFFFFF
Pressed:    #115E59
```

Use for:

- Search
- Find Doctor
- Save
- Confirm
- Submit
- Main admin actions

## Secondary Button

```text
Background: #FFFFFF
Text:       #0F766E
Border:     #E2E8F0
```

## Destructive Button

```text
Background: #DC2626
Text:       #FFFFFF
```

Use only for actions that genuinely remove or permanently change data.

---

# 15. Inputs and Search

Default:

```text
Background: #FFFFFF
Border:     #E2E8F0
Text:       #0F172A
Placeholder:#475569
```

Focused state:

```text
Border:     #0F766E
```

The search field is a primary product interaction and should have strong visual prominence.

---

# 16. Cards

Recommended:

```text
Background: #FFFFFF
Border:     #E2E8F0
```

Cards should contain enough whitespace to remain easy to scan.

For doctor cards, prioritize:

1. Doctor name
2. Specialty
3. Availability
4. Distance
5. Practice location
6. Schedule
7. Primary action

---

# 17. Doctor Availability Card Example

Conceptually:

```text
┌────────────────────────────────────┐
│ Dr. Amit Das                       │
│ Dermatologist                      │
│                                    │
│ 🟢 Available today                 │
│ Maa Medical Store                  │
│ 4.2 km away                        │
│                                    │
│ Today · 5:00 PM – 8:00 PM          │
│                                    │
│ [ View Profile ]  [ Directions ]   │
└────────────────────────────────────┘
```

The availability status should be visually prominent but should not dominate the doctor's identity and core information.

---

# 18. Verification Indicators

Verification should use both iconography and text.

Example:

```text
✓ Verified recently
```

or:

```text
✓ Verified
Last verified: 12 Sep 2026
```

Avoid relying on a green checkmark alone.

---

# 19. Data Freshness

Suggested presentation:

```text
✓ Verified recently
Last verified: 12 Sep 2026
```

For uncertain information:

```text
⚠ Schedule may have changed
Please confirm before visiting.
```

Recommended warning color:

```text
#D97706
```

Background:

```text
#FEF3C7
```

---

# 20. Report Status Colors

| Report Status | Color |
|---|---|
| Pending | `#D97706` |
| Reviewing | `#2563EB` |
| Resolved | `#16A34A` |
| Rejected | `#DC2626` |

Example:

```text
Pending      → Amber
Reviewing    → Blue
Resolved     → Green
Rejected     → Red
```

---

# 21. Accessibility Requirements

## Contrast

Maintain strong text/background contrast.

Primary text:

```text
#0F172A
```

Secondary text:

```text
#475569
```

Avoid using very light gray for important information.

## Color Independence

Never communicate meaning through color alone.

For example:

Bad:

```text
🟢
```

Better:

```text
🟢 Available today
```

## Touch Targets

Patient app controls should use sufficiently large touch targets, especially:

- Search
- Doctor cards
- Call buttons
- Directions
- Filters
- Language switcher
- Report actions

## Bengali

Test all important UI components using real Bengali content.

Some Bengali strings can become significantly wider than English equivalents.

---

# 22. Low-Bandwidth Considerations

The visual system should work well even under slow network conditions.

Avoid:

- Large decorative images
- Heavy gradients
- Unnecessary animations
- Video backgrounds
- Excessive shadows
- Large icon bundles

Prefer:

- Lightweight icons
- Simple surfaces
- Text-first information
- Progressive image loading
- Skeleton states
- Clear loading indicators

---

# 23. Iconography

Use a consistent icon set.

Icons should:

- Be simple
- Have clear meaning
- Work at small sizes
- Support accessibility labels
- Not replace important text

Potential icon concepts:

```text
Search       → magnifying glass
Location     → map pin
Doctor       → person/medical profile
Hospital     → building
Schedule     → calendar/clock
Available    → check/circle
Warning      → triangle
Report       → flag
Directions   → navigation arrow
Phone        → phone
```

---

# 24. Logo Direction

Suggested logo concept:

> **Location Pin + Doctor / Person**

The logo should visually communicate:

- Healthcare
- Location
- Discovery

Primary logo color:

```text
#0F766E
```

Supporting dark color:

```text
#115E59
```

Keep the logo simple enough to remain recognizable as an app icon.

---

# 25. Design Tokens

A practical token structure:

```css
:root {
  --color-primary: #0F766E;
  --color-primary-dark: #115E59;
  --color-primary-soft: #CCFBF1;

  --color-success: #16A34A;
  --color-success-soft: #DCFCE7;

  --color-warning: #D97706;
  --color-warning-soft: #FEF3C7;

  --color-error: #DC2626;
  --color-error-soft: #FEE2E2;

  --color-info: #2563EB;

  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text: #0F172A;
  --color-text-secondary: #475569;
  --color-border: #E2E8F0;

  --color-status-unknown: #64748B;
}
```

---

# 26. Tailwind Mapping

Suggested semantic naming:

```text
primary
primary-dark
primary-soft

success
success-soft

warning
warning-soft

error
error-soft

info

background
surface
foreground
muted
border
unknown
```

This allows the application to avoid hardcoding hex values throughout components.

---

# 27. Component State Guidelines

Every important component should define:

```text
Default
Hover
Pressed
Focused
Disabled
Loading
Success
Error
```

For mobile-first components, prioritize:

```text
Default
Pressed
Focused
Disabled
Loading
```

Hover states are mainly relevant to the admin web application.

---

# 28. Patient vs Admin Visual Density

## Patient App

Prioritize:

- Large touch targets
- Large search field
- Simple cards
- Minimal navigation
- Clear availability
- Strong location context
- Phone-first actions

## Admin Web

Prioritize:

- Data tables
- Filters
- Status badges
- Verification workflows
- Dense information
- Bulk actions
- Audit/history information

Both should share the same core color tokens.

---

# 29. Recommended Design Principle

The visual system should always support the product's primary goal:

> **Find the right doctor, nearby, at the right time.**

The interface should make these four pieces of information immediately understandable:

```text
WHO?
Doctor

WHAT?
Specialty / health problem

WHERE?
Practice location / distance

WHEN?
Schedule / availability
```

---

# 30. Final Color Reference

## Brand

```text
Primary Teal      #0F766E
Deep Teal         #115E59
Soft Teal         #CCFBF1
```

## Semantic

```text
Success           #16A34A
Success Light     #DCFCE7

Warning           #D97706
Warning Light     #FEF3C7

Error             #DC2626
Error Light       #FEE2E2

Info              #2563EB
Unknown           #64748B
```

## Neutral

```text
Background        #F8FAFC
Surface           #FFFFFF
Text              #0F172A
Secondary Text    #475569
Border            #E2E8F0
```

## Typography

```text
Primary:
"Noto Sans Bengali", "Noto Sans", sans-serif

Alternative:
"Hind Siliguri"
```

---

# 31. Final Design Direction

**Where Is My Doctor?** should look:

> **Trustworthy without looking clinical.  
> Friendly without looking childish.  
> Local without looking outdated.  
> Simple without feeling incomplete.**

The design system should prioritize clarity, accessibility, data freshness, and fast healthcare discovery over decorative visual complexity.
