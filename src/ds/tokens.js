// Design tokens — JS access to CSS custom properties.
// Use these in inline styles. The CSS variables in index.css are the source of truth.
// This file mirrors them for JS consumption and adds computed helpers.

export const tokens = {
  // Typography
  font: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
  fontSize: {
    xs: "var(--font-size-xs)",      // 11px
    sm: "var(--font-size-sm)",      // 12px
    base: "var(--font-size-base)",  // 13px
    md: "var(--font-size-md)",      // 14px
    lg: "var(--font-size-lg)",      // 15px
    xl: "var(--font-size-xl)",      // 18px
    "2xl": "var(--font-size-2xl)",  // 22px
    "3xl": "var(--font-size-3xl)",  // 28px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.65,
    loose: 1.8,
  },

  // Spacing (4px grid)
  space: {
    0: "var(--spacing-0)",
    1: "var(--spacing-1)",   // 4px
    2: "var(--spacing-2)",   // 8px
    3: "var(--spacing-3)",   // 12px
    4: "var(--spacing-4)",   // 16px
    5: "var(--spacing-5)",   // 20px
    6: "var(--spacing-6)",   // 24px
    8: "var(--spacing-8)",   // 32px
    10: "var(--spacing-10)", // 40px
    12: "var(--spacing-12)", // 48px
  },

  // Radii
  radius: {
    sm: "var(--radius-sm)",     // 4px
    md: "var(--radius-md)",     // 6px
    lg: "var(--radius-lg)",     // 8px
    xl: "var(--radius-xl)",     // 10px
    "2xl": "var(--radius-2xl)", // 12px
    "3xl": "var(--radius-3xl)", // 16px
    full: "var(--radius-full)", // pill
  },

  // Shadows
  shadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    xl: "var(--shadow-xl)",
    darkMd: "var(--shadow-dark-md)",
    darkLg: "var(--shadow-dark-lg)",
  },
};

// ── Theme Colors ─────────────────────────────────────────────────────────────
// Light theme (for main content)
export const light = {
  bg: "var(--color-bg)",
  bgCard: "var(--color-bg-card)",
  bgHover: "var(--color-bg-hover)",
  bgPanel: "var(--color-bg-panel)",
  bgMuted: "var(--color-bg-muted)",
  border: "var(--color-border)",
  borderStrong: "var(--color-border-strong)",
  text: "var(--color-text)",
  textSecondary: "var(--color-text-secondary)",
  textMuted: "var(--color-text-muted)",
  textInverse: "var(--color-text-inverse)",
  accent: "var(--color-accent)",
  accentHover: "var(--color-accent-hover)",
  accentSubtle: "var(--color-accent-subtle)",
  success: "var(--color-success)",
  successSubtle: "var(--color-success-subtle)",
  warning: "var(--color-warning)",
  warningSubtle: "var(--color-warning-subtle)",
  danger: "var(--color-danger)",
  dangerSubtle: "var(--color-danger-subtle)",
  info: "var(--color-info)",
  infoSubtle: "var(--color-info-subtle)",
  purple: "var(--color-purple)",
  purpleSubtle: "var(--color-purple-subtle)",
  pink: "var(--color-pink)",
  pinkSubtle: "var(--color-pink-subtle)",
};

// Dark theme (for sidebar, dark mode)
export const dark = {
  bg: "var(--color-dark-bg)",
  bgCard: "var(--color-dark-bg-card)",
  bgHover: "var(--color-dark-bg-hover)",
  bgPanel: "var(--color-dark-bg-panel)",
  border: "var(--color-dark-border)",
  borderLight: "var(--color-dark-border-light)",
  text: "var(--color-dark-text)",
  textSecondary: "var(--color-dark-text-secondary)",
  textMuted: "var(--color-dark-text-muted)",
  accent: "var(--color-dark-accent)",
  success: "var(--color-dark-success)",
  warning: "var(--color-dark-warning)",
  danger: "var(--color-dark-danger)",
  purple: "var(--color-dark-purple)",
  info: "var(--color-dark-info)",
  pink: "var(--color-dark-pink)",
};

// Source/brand colors
export const brand = {
  sixsense: "var(--color-sixsense)",
  salesforce: "var(--color-salesforce)",
  gong: "var(--color-gong)",
  gainsight: "var(--color-gainsight)",
  hubspot: "var(--color-hubspot)",
};
