import React, { forwardRef } from 'react';
import { tokens, light, dark } from './tokens';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function cx(...args) { return args.filter(Boolean).join(" "); }
function pick(theme, variant) { return theme === "dark" ? dark : light; }

// ─── BUTTON ──────────────────────────────────────────────────────────────────
// Variants: primary, secondary, ghost, danger, accent
// Sizes: sm, md, lg
export function Button({ children, variant = "secondary", size = "md", theme = "light", disabled, className, style, ...props }) {
  const t = pick(theme);
  const sizeStyles = {
    sm: { padding: "4px 12px", fontSize: tokens.fontSize.sm, borderRadius: tokens.radius.md, gap: 4 },
    md: { padding: "8px 16px", fontSize: tokens.fontSize.base, borderRadius: tokens.radius.lg, gap: 6 },
    lg: { padding: "12px 24px", fontSize: tokens.fontSize.md, borderRadius: tokens.radius.lg, gap: 8 },
  }[size];

  const variantStyles = {
    primary: { background: t.accent, color: t.textInverse || "#fff", border: "none", fontWeight: tokens.fontWeight.bold },
    secondary: { background: theme === "dark" ? t.bgCard : t.bgCard, color: t.textSecondary, border: `1px solid ${theme === "dark" ? "var(--color-dark-border)" : "var(--color-border)"}`, fontWeight: tokens.fontWeight.semibold },
    ghost: { background: "transparent", color: t.textSecondary, border: "1px solid transparent", fontWeight: tokens.fontWeight.semibold },
    danger: { background: t.dangerSubtle || t.danger, color: t.danger, border: `1px solid ${t.danger}30`, fontWeight: tokens.fontWeight.semibold },
    accent: { background: `linear-gradient(135deg, var(--color-sixsense), var(--color-purple))`, color: "#fff", border: "none", fontWeight: tokens.fontWeight.bold },
  }[variant];

  return (
    <button
      disabled={disabled}
      className={className}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "default" : "pointer", fontFamily: tokens.font.sans,
        opacity: disabled ? 0.5 : 1, transition: "all 0.15s", whiteSpace: "nowrap",
        ...sizeStyles, ...variantStyles, ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
// Variants: default, success, warning, danger, info, purple, accent, muted
// Sizes: sm, md
export function Badge({ children, variant = "default", size = "sm", dot, className, style }) {
  const colorMap = {
    default: { color: light.textSecondary, bg: light.bgPanel },
    success: { color: "var(--color-success)", bg: "var(--color-success-subtle)" },
    warning: { color: "var(--color-warning)", bg: "var(--color-warning-subtle)" },
    danger: { color: "var(--color-danger)", bg: "var(--color-danger-subtle)" },
    info: { color: "var(--color-info)", bg: "var(--color-info-subtle)" },
    purple: { color: "var(--color-purple)", bg: "var(--color-purple-subtle)" },
    accent: { color: "var(--color-accent)", bg: "var(--color-accent-subtle)" },
    muted: { color: light.textMuted, bg: light.bgHover },
  };
  const c = colorMap[variant] || colorMap.default;
  const s = size === "sm"
    ? { padding: "2px 8px", fontSize: tokens.fontSize.xs }
    : { padding: "4px 12px", fontSize: tokens.fontSize.sm };

  return (
    <span className={className} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      borderRadius: tokens.radius.full, fontWeight: tokens.fontWeight.semibold,
      color: c.color, background: c.bg, whiteSpace: "nowrap",
      ...s, ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />}
      {children}
    </span>
  );
}

// ─── INPUT ───────────────────────────────────────────────────────────────────
export const Input = forwardRef(function Input({ icon, theme = "light", size = "md", className, style, ...props }, ref) {
  const t = pick(theme);
  const s = size === "sm"
    ? { padding: "6px 10px", fontSize: tokens.fontSize.sm }
    : { padding: "8px 12px", fontSize: tokens.fontSize.base };
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", ...style }}>
      {icon && <span style={{ position: "absolute", left: 10, color: t.textMuted, pointerEvents: "none", display: "flex" }}>{icon}</span>}
      <input
        ref={ref}
        style={{
          width: "100%", borderRadius: tokens.radius.lg,
          border: `1px solid ${theme === "dark" ? "var(--color-dark-border)" : "var(--color-border)"}`,
          background: theme === "dark" ? t.bgPanel : t.bg,
          color: t.text, fontFamily: tokens.font.sans, outline: "none",
          paddingLeft: icon ? 34 : undefined,
          ...s,
        }}
        {...props}
      />
    </div>
  );
});

// ─── SELECT ──────────────────────────────────────────────────────────────────
export function Select({ options, theme = "light", size = "md", className, style, ...props }) {
  const t = pick(theme);
  const s = size === "sm"
    ? { padding: "6px 10px", fontSize: tokens.fontSize.sm }
    : { padding: "8px 12px", fontSize: tokens.fontSize.base };
  return (
    <select
      className={className}
      style={{
        borderRadius: tokens.radius.lg,
        border: `1px solid ${theme === "dark" ? "var(--color-dark-border)" : "var(--color-border)"}`,
        background: theme === "dark" ? t.bgPanel : t.bgCard,
        color: t.textSecondary, fontFamily: tokens.font.sans, outline: "none",
        ...s, ...style,
      }}
      {...props}
    >
      {(options || []).map(opt => {
        if (typeof opt === "string") return <option key={opt} value={opt}>{opt}</option>;
        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
      })}
    </select>
  );
}

// ─── CARD ────────────────────────────────────────────────────────────────────
export function Card({ children, theme = "light", hover, padding = "md", className, style, ...props }) {
  const t = pick(theme);
  const p = { none: 0, sm: tokens.space[3], md: tokens.space[5], lg: tokens.space[6] }[padding];
  return (
    <div
      className={className}
      style={{
        background: t.bgCard, borderRadius: tokens.radius["2xl"],
        border: `1px solid ${theme === "dark" ? "var(--color-dark-border)" : "var(--color-border)"}`,
        padding: p, transition: hover ? "border-color 0.15s" : undefined,
        cursor: hover ? "pointer" : undefined,
        ...style,
      }}
      onMouseEnter={hover ? e => e.currentTarget.style.borderColor = (theme === "dark" ? "var(--color-dark-accent)" : "var(--color-accent)") + "60" : undefined}
      onMouseLeave={hover ? e => e.currentTarget.style.borderColor = (theme === "dark" ? "var(--color-dark-border)" : "var(--color-border)") : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────────────────
export function TabList({ children, theme = "light", style }) {
  return <div style={{ display: "flex", gap: tokens.space[2], ...style }}>{children}</div>;
}

export function Tab({ children, active, theme = "light", style, ...props }) {
  const t = pick(theme);
  return (
    <button
      style={{
        padding: `${tokens.space[2]} ${tokens.space[3]}`,
        borderRadius: tokens.radius.md, border: "none",
        background: active ? (theme === "dark" ? t.accent + "18" : t.accentSubtle || t.accent + "12") : "transparent",
        color: active ? (theme === "dark" ? t.accent : t.accent) : t.textSecondary,
        fontSize: tokens.fontSize.sm, fontWeight: active ? tokens.fontWeight.bold : tokens.fontWeight.semibold,
        cursor: "pointer", fontFamily: tokens.font.sans, transition: "all 0.15s",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────
// Shape: square (company) or circle (person)
export function Avatar({ name, size = 32, shape = "square", color, style }) {
  // Deterministic color from name
  if (!color) {
    let h = 0;
    for (let i = 0; i < (name || "").length; i++) h = (name || "").charCodeAt(i) + ((h << 5) - h);
    const colors = ["#0891b2","#7c3aed","#059669","#d97706","#dc2626","#2563eb","#db2777","#0d9488","#4f46e5","#ca8a04"];
    color = colors[Math.abs(h) % colors.length];
  }
  return (
    <div style={{
      width: size, height: size,
      borderRadius: shape === "circle" ? "50%" : tokens.radius.lg,
      background: color + "18", border: `1.5px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: tokens.fontWeight.bold, color,
      flexShrink: 0, ...style,
    }}>
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

// ─── SCORE BAR ───────────────────────────────────────────────────────────────
export function ScoreBar({ value, max = 100, width = 60, showLabel = true, style }) {
  const pct = Math.min(value / max, 1);
  const color = pct > 0.7 ? "var(--color-success)" : pct > 0.4 ? "var(--color-warning)" : "var(--color-danger)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: tokens.space[2], ...style }}>
      <div style={{ width, height: 5, borderRadius: tokens.radius.full, background: "var(--color-border)" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", borderRadius: tokens.radius.full, background: color, transition: "width 0.3s" }} />
      </div>
      {showLabel && <span style={{ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.semibold, color, minWidth: 24 }}>{value}</span>}
    </div>
  );
}

// ─── STAT ────────────────────────────────────────────────────────────────────
export function Stat({ label, value, sub, color, theme = "light" }) {
  const t = pick(theme);
  return (
    <div>
      <div style={{ fontSize: tokens.fontSize["2xl"], fontWeight: tokens.fontWeight.bold, color: color || t.text, lineHeight: tokens.lineHeight.tight }}>{value}</div>
      <div style={{ fontSize: tokens.fontSize.sm, color: t.textSecondary }}>{label}</div>
      {sub && <div style={{ fontSize: tokens.fontSize.xs, color: t.textMuted }}>{sub}</div>}
    </div>
  );
}

// ─── SECTION LABEL ───────────────────────────────────────────────────────────
export function SectionLabel({ children, theme = "light" }) {
  const t = pick(theme);
  return (
    <div style={{
      fontSize: tokens.fontSize.xs, fontWeight: tokens.fontWeight.semibold,
      color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em",
      marginBottom: tokens.space[2],
    }}>
      {children}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
export function Modal({ children, title, onClose, wide, theme = "dark" }) {
  const t = pick(theme);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: wide ? "min(90vw, 960px)" : "min(90vw, 560px)",
        maxHeight: "85vh", overflow: "auto", zIndex: 1001,
        background: t.bgCard, borderRadius: tokens.radius["3xl"],
        border: `1px solid ${theme === "dark" ? "var(--color-dark-border)" : "var(--color-border)"}`,
        boxShadow: theme === "dark" ? tokens.shadow.darkLg : tokens.shadow.xl,
        padding: tokens.space[6],
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: tokens.space[5] }}>
          <h3 style={{ margin: 0, fontSize: tokens.fontSize.xl, fontWeight: tokens.fontWeight.bold, color: t.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        {children}
      </div>
    </>
  );
}

// ─── TABLE PRIMITIVES ────────────────────────────────────────────────────────
export function TH({ children, active, theme = "light", onClick, style, ...props }) {
  const t = pick(theme);
  return (
    <th onClick={onClick} style={{
      padding: `${tokens.space[3]} ${tokens.space[4]}`, textAlign: "left",
      fontSize: tokens.fontSize.xs, fontWeight: tokens.fontWeight.semibold,
      color: active ? t.accent : t.textMuted,
      textTransform: "uppercase", letterSpacing: "0.04em",
      borderBottom: `1px solid ${theme === "dark" ? "var(--color-dark-border)" : "var(--color-border)"}`,
      cursor: onClick ? "pointer" : "default", userSelect: "none",
      position: "sticky", top: 0,
      background: t.bgCard, zIndex: 1, whiteSpace: "nowrap",
      ...style,
    }} {...props}>
      {children}
    </th>
  );
}

export function TR({ children, theme = "light", onClick, style, ...props }) {
  const t = pick(theme);
  return (
    <tr
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", borderBottom: `1px solid ${theme === "dark" ? "var(--color-dark-border)" : "var(--color-border)"}`, ...style }}
      onMouseEnter={e => e.currentTarget.style.background = theme === "dark" ? "var(--color-dark-bg-hover)" : "var(--color-bg-hover)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TD({ children, style, ...props }) {
  return <td style={{ padding: `${tokens.space[3]} ${tokens.space[4]}`, fontSize: tokens.fontSize.base, ...style }} {...props}>{children}</td>;
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export function EmptyState({ text, icon, theme = "light" }) {
  const t = pick(theme);
  return (
    <div style={{
      padding: tokens.space[10], textAlign: "center",
      color: t.textMuted, fontSize: tokens.fontSize.base,
    }}>
      {icon && <div style={{ fontSize: 32, marginBottom: tokens.space[3], opacity: 0.5 }}>{icon}</div>}
      {text}
    </div>
  );
}

// ─── PAGE SHELL ──────────────────────────────────────────────────────────────
// Layout wrapper for a light-themed page with header
export function PageShell({ title, count, actions, children, theme = "light" }) {
  const t = pick(theme);
  return (
    <div style={{ background: t.bg, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: `${tokens.space[4]} ${tokens.space[6]}`,
        background: t.bgCard, borderBottom: `1px solid ${theme === "dark" ? "var(--color-dark-border)" : "var(--color-border)"}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: tokens.space[2] }}>
          <h1 style={{ margin: 0, fontSize: tokens.fontSize["2xl"], fontWeight: tokens.fontWeight.bold, color: t.text }}>{title}</h1>
          {count != null && <span style={{ fontSize: tokens.fontSize.lg, fontWeight: tokens.fontWeight.medium, color: t.textMuted }}>{count}</span>}
        </div>
        {actions && <div style={{ display: "flex", gap: tokens.space[2], alignItems: "center" }}>{actions}</div>}
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
