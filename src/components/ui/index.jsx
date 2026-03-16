import React from 'react';
import { C } from './theme';

export function Badge({ children, color = C.accent, small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: small ? "1px 6px" : "2px 10px",
      borderRadius: 4, fontSize: small ? 10 : 11, fontWeight: 600,
      color, background: color + "18",
      letterSpacing: "0.03em", textTransform: "uppercase", whiteSpace: "nowrap"
    }}>
      {children}
    </span>
  );
}

export function Btn({ children, onClick, primary, small, disabled, style: sx }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: small ? "5px 12px" : "8px 18px",
      borderRadius: 6, border: primary ? "none" : `1px solid ${C.borderLight}`,
      background: primary ? C.accent : "transparent",
      color: primary ? C.bg : C.text,
      fontSize: small ? 12 : 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1, transition: "all 0.15s",
      fontFamily: "inherit", ...sx
    }}>
      {children}
    </button>
  );
}

export function Tab({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 6, border: "none",
      background: active ? C.accent + "20" : "transparent",
      color: active ? C.accent : C.textMuted,
      fontSize: 13, fontWeight: 600, cursor: "pointer",
      fontFamily: "inherit", transition: "all 0.15s"
    }}>
      {children}
    </button>
  );
}

export function Inp({ value, onChange, placeholder, icon, style: sx }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", ...sx }}>
      {icon && <span style={{ position: "absolute", left: 10, color: C.textDim }}>{icon}</span>}
      <input
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: "8px 12px", paddingLeft: icon ? 34 : 12,
          borderRadius: 6, border: `1px solid ${C.border}`,
          background: C.bgPanel, color: C.text,
          fontSize: 13, fontFamily: "inherit", outline: "none"
        }}
      />
    </div>
  );
}

export function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: "7px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
      background: C.bgPanel, color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none"
    }}>
      {options.map(o => (
        <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
          {typeof o === "string" ? o : o.label}
        </option>
      ))}
    </select>
  );
}

export function Stat({ label, value, sub, color = C.accent }) {
  return (
    <div style={{
      padding: "16px 20px", borderRadius: 8, border: `1px solid ${C.border}`,
      background: C.bgCard, minWidth: 130
    }}>
      <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function Score({ value, max = 100 }) {
  const pct = (value / max) * 100;
  const color = pct > 70 ? C.green : pct > 40 ? C.orange : C.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: C.border }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: color, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 28, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)"
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 12, width: wide ? "92%" : 640,
        maxWidth: wide ? 1200 : 640, maxHeight: "88vh",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)"
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 24px", borderBottom: `1px solid ${C.border}`
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{ padding: 24, overflow: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

export function SectionLabel({ children }) {
  return <h4 style={{ color: C.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, marginTop: 0 }}>{children}</h4>;
}

export function FieldGrid({ data }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "8px 16px", fontSize: 13 }}>
      {data.map(([k, v]) => (
        <React.Fragment key={k}>
          <span style={{ color: C.textMuted }}>{k}</span>
          <span style={{ color: C.text, wordBreak: "break-all" }}>{v}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

export function TH({ children, onClick, active }) {
  return (
    <th onClick={onClick} style={{
      padding: "8px 12px", textAlign: "left",
      color: active ? C.accent : C.textMuted,
      fontWeight: 600, fontSize: 11, textTransform: "uppercase",
      letterSpacing: "0.04em", cursor: onClick ? "pointer" : "default",
      userSelect: "none", whiteSpace: "nowrap", position: "sticky", top: 0,
      background: C.bgCard, borderBottom: `1px solid ${C.border}`, zIndex: 1
    }}>
      {children}
    </th>
  );
}

export function TR({ children, onClick }) {
  return (
    <tr onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", borderBottom: `1px solid ${C.border}20` }}
      onMouseEnter={e => e.currentTarget.style.background = C.bgHover}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {children}
    </tr>
  );
}

export function TD({ children, style: sx }) {
  return <td style={{ padding: "8px 12px", fontSize: 13, ...sx }}>{children}</td>;
}

export function EmptyState({ text }) {
  return <div style={{ padding: 40, textAlign: "center", color: C.textMuted, fontSize: 13 }}>{text}</div>;
}

export function SignalFieldsPanel({ fields }) {
  const entries = Object.entries(fields || {});
  if (entries.length === 0) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <SectionLabel>Signal-Derived Fields</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 4,
            background: C.accent + "10", border: `1px solid ${C.accent}20`, fontSize: 11
          }}>
            <span style={{ color: C.accent, fontFamily: "monospace" }}>{k}</span>
            <span style={{ color: C.textDim }}>=</span>
            <span style={{ color: C.text }}>{String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
