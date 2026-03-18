import React, { useState, useEffect, useCallback } from 'react';

// ─── DEFAULT TOKEN VALUES (editable) ─────────────────────────────────────────
const DEFAULT_TOKENS = {
  colors: {
    accent: "#0891b2",
    success: "#059669",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#2563eb",
    purple: "#7c3aed",
    pink: "#db2777",
    // Light surfaces
    bg: "#f8f9fb",
    bgCard: "#ffffff",
    bgHover: "#f1f3f7",
    border: "#e5e7eb",
    text: "#1a1d23",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    // Dark surfaces
    darkBg: "#0a0e17",
    darkBgCard: "#111827",
    darkBorder: "#1e293b",
    darkText: "#e2e8f0",
    darkTextSecondary: "#8892a4",
    darkAccent: "#22d3ee",
    // Brand
    sixsense: "#0D9488",
    salesforce: "#1D4ED8",
    gong: "#059669",
    gainsight: "#7C3AED",
  },
  typography: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    xs: 11, sm: 12, base: 13, md: 14, lg: 15, xl: 18, "2xl": 22, "3xl": 28,
    weightNormal: 400, weightMedium: 500, weightSemibold: 600, weightBold: 700,
  },
  spacing: {
    unit: 4, // base unit in px
    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12],
  },
  radii: {
    sm: 4, md: 6, lg: 8, xl: 10, "2xl": 12, "3xl": 16,
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function hexToSubtle(hex, opacity = 0.08) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function hashColor(str) {
  let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  const c = ["#0891b2","#7c3aed","#059669","#d97706","#dc2626","#2563eb","#db2777","#0d9488"];
  return c[Math.abs(h) % c.length];
}

// ─── EDITABLE COLOR SWATCH ───────────────────────────────────────────────────
function ColorEditor({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <label style={{ position: "relative", cursor: "pointer" }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background: value, border: "2px solid rgba(0,0,0,0.1)", cursor: "pointer" }} />
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
      </label>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>{label}</div>
        <input value={value} onChange={e => onChange(e.target.value)}
          style={{ fontSize: 11, color: "#6b7280", background: "transparent", border: "none", outline: "none", fontFamily: "monospace", width: 80 }} />
      </div>
    </div>
  );
}

// ─── NUMBER SLIDER ───────────────────────────────────────────────────────────
function NumberEditor({ label, value, onChange, min = 0, max = 100, unit = "px" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 200 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23", marginBottom: 4 }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: "#0891b2" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0891b2", minWidth: 40 }}>{value}{unit}</span>
        </div>
      </div>
    </div>
  );
}

// ─── PREVIEW COMPONENTS (use live tokens) ────────────────────────────────────
function PreviewButton({ t, variant = "primary", children }) {
  const styles = {
    primary: { background: t.colors.accent, color: "#fff", border: "none" },
    secondary: { background: t.colors.bgCard, color: t.colors.textSecondary, border: `1px solid ${t.colors.border}` },
    ghost: { background: "transparent", color: t.colors.textSecondary, border: "1px solid transparent" },
    danger: { background: hexToSubtle(t.colors.danger), color: t.colors.danger, border: `1px solid ${hexToSubtle(t.colors.danger, 0.2)}` },
  };
  return (
    <button style={{
      padding: `${t.spacing.unit * 2}px ${t.spacing.unit * 4}px`,
      borderRadius: t.radii.lg, fontSize: t.typography.base, fontWeight: t.typography.weightSemibold,
      cursor: "pointer", fontFamily: t.typography.fontFamily, ...styles[variant],
    }}>{children}</button>
  );
}

function PreviewBadge({ t, color, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: `2px ${t.spacing.unit * 2}px`, borderRadius: 9999,
      fontSize: t.typography.xs, fontWeight: t.typography.weightSemibold,
      color: color, background: hexToSubtle(color),
    }}>{children}</span>
  );
}

function PreviewAvatar({ t, name, size = 32, shape = "square" }) {
  const c = hashColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: shape === "circle" ? "50%" : t.radii.lg,
      background: hexToSubtle(c, 0.12), border: `1.5px solid ${hexToSubtle(c, 0.2)}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: t.typography.weightBold, color: c,
    }}>{name.charAt(0)}</div>
  );
}

function PreviewScore({ t, value }) {
  const pct = value / 100;
  const color = pct > 0.7 ? t.colors.success : pct > 0.4 ? t.colors.warning : t.colors.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 60, height: 5, borderRadius: 9999, background: t.colors.border }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 9999, background: color }} />
      </div>
      <span style={{ fontSize: t.typography.sm, fontWeight: t.typography.weightSemibold, color }}>{value}</span>
    </div>
  );
}

// ─── EXPORT CODE GENERATOR ───────────────────────────────────────────────────
function generateCSS(t) {
  return `/* Generated Design Tokens */
@theme {
  --font-sans: ${t.typography.fontFamily};
${Object.entries({ xs: t.typography.xs, sm: t.typography.sm, base: t.typography.base, md: t.typography.md, lg: t.typography.lg, xl: t.typography.xl, "2xl": t.typography["2xl"], "3xl": t.typography["3xl"] }).map(([k, v]) => `  --font-size-${k}: ${v / 16}rem;`).join("\n")}
${t.spacing.scale.map(n => `  --spacing-${n}: ${n * t.spacing.unit}px;`).join("\n")}
${Object.entries(t.radii).map(([k, v]) => `  --radius-${k}: ${v}px;`).join("\n")}
  --color-accent: ${t.colors.accent};
  --color-success: ${t.colors.success};
  --color-warning: ${t.colors.warning};
  --color-danger: ${t.colors.danger};
  --color-info: ${t.colors.info};
  --color-purple: ${t.colors.purple};
  --color-pink: ${t.colors.pink};
  --color-bg: ${t.colors.bg};
  --color-bg-card: ${t.colors.bgCard};
  --color-bg-hover: ${t.colors.bgHover};
  --color-border: ${t.colors.border};
  --color-text: ${t.colors.text};
  --color-text-secondary: ${t.colors.textSecondary};
  --color-text-muted: ${t.colors.textMuted};
  --color-dark-bg: ${t.colors.darkBg};
  --color-dark-bg-card: ${t.colors.darkBgCard};
  --color-dark-border: ${t.colors.darkBorder};
  --color-dark-text: ${t.colors.darkText};
  --color-dark-accent: ${t.colors.darkAccent};
  --color-sixsense: ${t.colors.sixsense};
  --color-salesforce: ${t.colors.salesforce};
  --color-gong: ${t.colors.gong};
  --color-gainsight: ${t.colors.gainsight};
}`;
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────
function Section({ title, description, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1d23", margin: 0 }}>{title}</h2>
        {description && <span style={{ fontSize: 13, color: "#9ca3af" }}>{description}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── MAIN EDITOR ─────────────────────────────────────────────────────────────
export default function DesignShowcase() {
  const [t, setT] = useState(DEFAULT_TOKENS);
  const [tab, setTab] = useState("colors");
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);

  const update = useCallback((path, value) => {
    setT(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  }, []);

  const resetAll = () => setT(DEFAULT_TOKENS);

  const exportCode = generateCSS(t);
  const handleCopy = () => { navigator.clipboard.writeText(exportCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const tabs = [
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing & Radii" },
    { id: "components", label: "Components" },
  ];

  return (
    <div style={{ background: "#f8f9fb", minHeight: "100%", fontFamily: t.typography.fontFamily }}>
      {/* Header */}
      <div style={{ padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1d23" }}>Design System Editor</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>Edit tokens and see components update live. Export when done.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={resetAll} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Reset All</button>
          <button onClick={() => setShowExport(!showExport)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: showExport ? "#7c3aed" : "#0D9488", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {showExport ? "← Back to Editor" : "Export Code →"}
          </button>
        </div>
      </div>

      {/* Export panel */}
      {showExport && (
        <div style={{ padding: 32, background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Generated CSS Tokens</h3>
            <button onClick={handleCopy} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: copied ? "#059669" : "#0D9488", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {copied ? "✓ Copied!" : "Copy to Clipboard"}
            </button>
          </div>
          <pre style={{ padding: 20, borderRadius: 10, background: "#0a0e17", color: "#e2e8f0", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", overflow: "auto", maxHeight: 400, lineHeight: 1.6 }}>
            {exportCode}
          </pre>
          <p style={{ marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
            Paste this into <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>src/index.css</code> to apply your changes to the prototype.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding: "0 32px", background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 0 }}>
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            padding: "12px 20px", border: "none", borderBottom: tab === tb.id ? "2px solid #0D9488" : "2px solid transparent",
            background: "transparent", color: tab === tb.id ? "#0D9488" : "#6b7280",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
          }}>{tb.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 32, display: "grid", gridTemplateColumns: "380px 1fr", gap: 32, alignItems: "start" }}>
        {/* Left: Controls */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, position: "sticky", top: 16, maxHeight: "calc(100vh - 200px)", overflow: "auto" }}>
          {tab === "colors" && (
            <div>
              <Section title="Semantic Colors" description="Click swatches to edit">
                <div style={{ display: "grid", gap: 12 }}>
                  {[["accent","Accent"],["success","Success"],["warning","Warning"],["danger","Danger"],["info","Info"],["purple","Purple"],["pink","Pink"]].map(([key, label]) => (
                    <ColorEditor key={key} label={label} value={t.colors[key]} onChange={v => update(`colors.${key}`, v)} />
                  ))}
                </div>
              </Section>
              <Section title="Light Surfaces">
                <div style={{ display: "grid", gap: 12 }}>
                  {[["bg","Background"],["bgCard","Card"],["bgHover","Hover"],["border","Border"],["text","Text"],["textSecondary","Text Secondary"],["textMuted","Text Muted"]].map(([key, label]) => (
                    <ColorEditor key={key} label={label} value={t.colors[key]} onChange={v => update(`colors.${key}`, v)} />
                  ))}
                </div>
              </Section>
              <Section title="Dark Theme">
                <div style={{ display: "grid", gap: 12 }}>
                  {[["darkBg","Dark BG"],["darkBgCard","Dark Card"],["darkBorder","Dark Border"],["darkText","Dark Text"],["darkAccent","Dark Accent"]].map(([key, label]) => (
                    <ColorEditor key={key} label={label} value={t.colors[key]} onChange={v => update(`colors.${key}`, v)} />
                  ))}
                </div>
              </Section>
              <Section title="Brand / Source">
                <div style={{ display: "grid", gap: 12 }}>
                  {[["sixsense","6sense"],["salesforce","Salesforce"],["gong","Gong"],["gainsight","Gainsight"]].map(([key, label]) => (
                    <ColorEditor key={key} label={label} value={t.colors[key]} onChange={v => update(`colors.${key}`, v)} />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {tab === "typography" && (
            <div>
              <Section title="Font Scale" description="Size in pixels">
                <div style={{ display: "grid", gap: 12 }}>
                  {["xs","sm","base","md","lg","xl","2xl","3xl"].map(key => (
                    <NumberEditor key={key} label={key} value={t.typography[key]} onChange={v => update(`typography.${key}`, v)} min={8} max={48} />
                  ))}
                </div>
              </Section>
              <Section title="Font Weights">
                <div style={{ display: "grid", gap: 12 }}>
                  {[["weightNormal","Normal"],["weightMedium","Medium"],["weightSemibold","Semibold"],["weightBold","Bold"]].map(([key,label]) => (
                    <NumberEditor key={key} label={label} value={t.typography[key]} onChange={v => update(`typography.${key}`, v)} min={100} max={900} unit="" />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {tab === "spacing" && (
            <div>
              <Section title="Base Unit" description="All spacing is multiples of this">
                <NumberEditor label="Unit" value={t.spacing.unit} onChange={v => update("spacing.unit", v)} min={1} max={12} />
              </Section>
              <Section title="Border Radii" description="In pixels">
                <div style={{ display: "grid", gap: 12 }}>
                  {Object.entries(t.radii).map(([key, val]) => (
                    <NumberEditor key={key} label={key} value={val} onChange={v => update(`radii.${key}`, v)} min={0} max={32} />
                  ))}
                </div>
              </Section>
            </div>
          )}

          {tab === "components" && (
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
              <p style={{ marginBottom: 12 }}>Components use the tokens you've configured in the other tabs. Changes to colors, typography, spacing, and radii are reflected in the live preview on the right.</p>
              <p>To add or modify component variants, edit <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>src/ds/components.jsx</code></p>
            </div>
          )}
        </div>

        {/* Right: Live Preview */}
        <div>
          {/* Light preview */}
          <div style={{ background: t.colors.bgCard, borderRadius: 12, border: `1px solid ${t.colors.border}`, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Light Theme Preview</div>

            {/* Buttons */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 8 }}>Buttons</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <PreviewButton t={t} variant="primary">Primary</PreviewButton>
                <PreviewButton t={t} variant="secondary">Secondary</PreviewButton>
                <PreviewButton t={t} variant="ghost">Ghost</PreviewButton>
                <PreviewButton t={t} variant="danger">Danger</PreviewButton>
              </div>
            </div>

            {/* Badges */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 8 }}>Badges</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <PreviewBadge t={t} color={t.colors.accent}>Accent</PreviewBadge>
                <PreviewBadge t={t} color={t.colors.success}>Success</PreviewBadge>
                <PreviewBadge t={t} color={t.colors.warning}>Warning</PreviewBadge>
                <PreviewBadge t={t} color={t.colors.danger}>Danger</PreviewBadge>
                <PreviewBadge t={t} color={t.colors.info}>Info</PreviewBadge>
                <PreviewBadge t={t} color={t.colors.purple}>Purple</PreviewBadge>
              </div>
            </div>

            {/* Typography */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 8 }}>Typography</div>
              {["3xl","2xl","xl","lg","md","base","sm","xs"].map(key => (
                <div key={key} style={{ fontSize: t.typography[key], fontWeight: key === "3xl" || key === "2xl" ? t.typography.weightBold : t.typography.weightNormal, color: t.colors.text, marginBottom: 4, fontFamily: t.typography.fontFamily }}>
                  {key} — {t.typography[key]}px The quick brown fox
                </div>
              ))}
            </div>

            {/* Avatars + Scores */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 8 }}>Avatars & Scores</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <PreviewAvatar t={t} name="Vertexai" size={34} />
                <PreviewAvatar t={t} name="LiveRamp" size={34} />
                <PreviewAvatar t={t} name="Kim Chen" size={34} shape="circle" />
                <PreviewScore t={t} value={87} />
                <PreviewScore t={t} value={55} />
                <PreviewScore t={t} value={23} />
              </div>
            </div>

            {/* Table */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 8 }}>Table</div>
              <div style={{ borderRadius: t.radii["2xl"], border: `1px solid ${t.colors.border}`, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["Company","Industry","Score","Status"].map(h => (
                      <th key={h} style={{ padding: `${t.spacing.unit*3}px ${t.spacing.unit*4}px`, textAlign: "left", fontSize: t.typography.xs, fontWeight: t.typography.weightSemibold, color: t.colors.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${t.colors.border}`, background: t.colors.bgCard }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {[["Vertexai","SaaS",87,"success"],["LiveRamp","SaaS",55,"warning"],["MongoDB","Data",34,"danger"]].map(([name,ind,score,status]) => (
                      <tr key={name} style={{ borderBottom: `1px solid ${t.colors.border}` }}>
                        <td style={{ padding: `${t.spacing.unit*3}px ${t.spacing.unit*4}px` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: t.spacing.unit*2 }}>
                            <PreviewAvatar t={t} name={name} size={28} />
                            <span style={{ fontWeight: t.typography.weightSemibold, fontSize: t.typography.base, color: t.colors.text }}>{name}</span>
                          </div>
                        </td>
                        <td style={{ padding: `${t.spacing.unit*3}px ${t.spacing.unit*4}px`, color: t.colors.textSecondary, fontSize: t.typography.base }}>{ind}</td>
                        <td style={{ padding: `${t.spacing.unit*3}px ${t.spacing.unit*4}px` }}><PreviewScore t={t} value={score} /></td>
                        <td style={{ padding: `${t.spacing.unit*3}px ${t.spacing.unit*4}px` }}><PreviewBadge t={t} color={t.colors[status]}>{status}</PreviewBadge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Spacing */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.colors.textSecondary, marginBottom: 8 }}>Spacing ({t.spacing.unit}px grid)</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                {t.spacing.scale.filter(n => n > 0).map(n => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: n * t.spacing.unit, height: 20, background: t.colors.accent, borderRadius: 2, minWidth: 4 }} />
                    <span style={{ fontSize: 10, color: t.colors.textMuted }}>{n}×{t.spacing.unit}={n * t.spacing.unit}px</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dark preview */}
          <div style={{ background: t.colors.darkBgCard, borderRadius: 12, border: `1px solid ${t.colors.darkBorder}`, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Dark Theme Preview</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <button style={{ padding: `${t.spacing.unit*2}px ${t.spacing.unit*4}px`, borderRadius: t.radii.lg, border: "none", background: t.colors.darkAccent, color: t.colors.darkBgCard, fontSize: t.typography.base, fontWeight: t.typography.weightSemibold, cursor: "pointer", fontFamily: t.typography.fontFamily }}>Primary</button>
              <button style={{ padding: `${t.spacing.unit*2}px ${t.spacing.unit*4}px`, borderRadius: t.radii.lg, border: `1px solid ${t.colors.darkBorder}`, background: t.colors.darkBgCard, color: t.colors.darkText, fontSize: t.typography.base, fontWeight: t.typography.weightSemibold, cursor: "pointer", fontFamily: t.typography.fontFamily }}>Secondary</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              <PreviewBadge t={{...t, colors: {...t.colors, accent: t.colors.darkAccent}}} color={t.colors.darkAccent}>Accent</PreviewBadge>
              <PreviewBadge t={t} color="#34d399">Success</PreviewBadge>
              <PreviewBadge t={t} color="#f59e0b">Warning</PreviewBadge>
              <PreviewBadge t={t} color="#f87171">Danger</PreviewBadge>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <PreviewAvatar t={{...t, radii: t.radii}} name="Vertexai" size={34} />
              <div>
                <div style={{ fontSize: t.typography.md, fontWeight: t.typography.weightBold, color: t.colors.darkText }}>Vertexai</div>
                <div style={{ fontSize: t.typography.sm, color: "#8892a4" }}>SaaS · Decision · High Intent</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
