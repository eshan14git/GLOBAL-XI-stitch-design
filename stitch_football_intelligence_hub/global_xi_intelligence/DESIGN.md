---
name: Global XI Intelligence
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#fff9ef'
  on-secondary: '#3a3000'
  secondary-container: '#ffdb3c'
  on-secondary-container: '#725f00'
  tertiary: '#cecece'
  on-tertiary: '#2f3131'
  tertiary-container: '#b2b3b3'
  on-tertiary-container: '#434546'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system for the Football Intelligence Hub is rooted in a **Luxury Sports Aesthetic**. It targets elite analysts, scouts, and enthusiasts who demand precision wrapped in a premium experience. The personality is authoritative, exclusive, and high-performance, evoking the feeling of a VIP sports executive suite.

The visual style blends **Minimalism** with **Tactile Gold accents**. We utilize a deep, monochromatic base to allow data visualizations and gold highlights to command attention. The interface avoids unnecessary clutter, focusing on high-contrast information density and subtle metallic textures that suggest quality and "gold standard" intelligence.

## Colors

The palette is strictly limited to create a high-end, cinematic atmosphere.
- **Deep Black (#050505):** The primary canvas. Use this for the main background to ensure absolute depth and high contrast.
- **Premium Gold (#D4AF37):** Used for primary actions, branding elements, and significant data highlights.
- **Vibrant Gold (#FFD700):** Reserved for interactive states (hover/active) and "championship" tier information.
- **Pure White (#FFFFFF):** Utilized for primary body text and critical data points to ensure maximum legibility against the dark background.
- **Metallic Surface (#1A1A1A):** A secondary neutral for card backgrounds and section containers to create subtle separation from the base.

## Typography

Typography focuses on a balance between "impact" and "utility."
- **Headlines:** Montserrat provides a bold, geometric, and modern sports feel. Titles should often be presented in uppercase for a more prestigious, authoritative look.
- **Body:** Hanken Grotesk offers exceptional readability for long-form scouting reports and player bios.
- **Data Labels:** JetBrains Mono is used for technical data, coordinates, and statistics to emphasize the "Intelligence Hub" aspect of the brand, providing a clean, tabular feel to numerical values.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **Information Density:** While the aesthetic is luxury, the content is data-driven. Use generous outer margins (64px) to frame the content like a gallery piece, but maintain tight, efficient spacing within data tables and dashboards.
- **Breakpoints:** 
  - Mobile: < 600px
  - Tablet: 600px - 1024px
  - Desktop: > 1024px

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Metallic Strokes** rather than heavy shadows.
- **Base Level:** Deep Black (#050505).
- **Surface Level:** Elevated cards use a slightly lighter grey (#121212) with a 1px solid or gradient border in Gold (#D4AF37) at 20-30% opacity.
- **Active Elevation:** When a card or element is focused, the border opacity increases to 100%, and a very soft, diffused gold outer glow (5-10% opacity) may be applied.
- **Glassmorphism:** Use sparingly for navigation overlays or modals. Use a heavy backdrop blur (20px) with a dark tint to maintain the premium feel.

## Shapes

The shape language is **Professional and Precise**. We use small corner radii to avoid the UI feeling too "soft" or consumer-grade, while avoiding the harshness of 0px corners.
- **Standard Radius:** 4px (Soft) for buttons, inputs, and small cards.
- **Large Radius:** 8px (Rounded-lg) for main dashboard containers.
- **Data Points:** Circles and hexagons are preferred for player avatars and defensive/offensive rating charts to echo the geometry of a football and traditional scouting radars.

## Components

### Buttons
- **Primary:** Solid Gold (#D4AF37) background with Black (#050505) text. Bold Montserrat caps.
- **Secondary:** Transparent background with a 1px Gold border and Gold text.
- **Tertiary:** Pure White text, no border, high-contrast hover state.

### Cards
- **Scouting Card:** Dark grey background, 1px subtle gold border, high-contrast white headlines. 
- **Metric Card:** Features large gold numerical data (JetBrains Mono) with small white labels.

### Input Fields
- Dark backgrounds with a bottom-only 1px white border that transitions to a gold border on focus. Labels should be small, JetBrains Mono, and placed above the field.

### Chips & Badges
- Used for player positions or status. Pill-shaped with a 1px gold border and gold text. For "Elite" status, use the Gold Gradient background with black text.

### Data Visualizations
- All charts should use Gold and White as the primary data colors. Use low-opacity gold for "area" fills in radar charts to maintain transparency and layering.