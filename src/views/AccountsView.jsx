import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { L } from '../components/ui/theme';
import { CONTENT_ITEMS, SIGNAL_CONFIGS_DEFAULT, COMPETITORS } from '../data/constants';
import { rand, randInt } from '../data/generators';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui-shadcn/table';
import { Badge } from '../components/ui-shadcn/badge';
import { Button } from '../components/ui-shadcn/button';
import { cn } from '../lib/utils';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SOURCES = {
  sixsense: { name: "6sense", color: "var(--color-sixsense)", icon: "6" },
  salesforce: { name: "Salesforce", color: "var(--color-salesforce)", icon: "SF" },
  gong: { name: "Gong", color: "var(--color-success)", icon: "G" },
  gainsight: { name: "Gainsight", color: "var(--color-purple)", icon: "GS" },
  hubspot: { name: "HubSpot", color: "var(--color-warning)", icon: "HS" },
  marketo: { name: "Marketo", color: "var(--color-purple)", icon: "MK" },
  linkedin: { name: "LinkedIn", color: "var(--color-info)", icon: "in" },
  clearbit: { name: "Clearbit", color: "var(--color-info)", icon: "CB" },
  bombora: { name: "Bombora", color: "var(--color-warning)", icon: "B" },
  g2: { name: "G2", color: "var(--color-danger)", icon: "G2" },
  usergems: { name: "UserGems", color: "var(--color-purple)", icon: "UG" },
  commonroom: { name: "CommonRoom", color: "var(--color-pink)", icon: "CR" },
  signals: { name: "Signals", color: "var(--color-info)", icon: "📡" },
  revvyai: { name: "RevvyAI", color: "var(--color-purple)", icon: "✦" },
};

function SrcIcon({ sourceId, size = 14 }) {
  const s = SOURCES[sourceId] || SOURCES.sixsense;
  const px = size + 4;
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 rounded font-extrabold leading-none"
      style={{ width: px, height: px, background: s.color + "18", color: s.color, fontSize: size * 0.65 }}
    >
      {s.icon}
    </span>
  );
}

// Native columns (always present, non-removable)
const NATIVE_COLS = [
  { id: "tech", label: "Technographics", source: "sixsense", getValue: a => a.techStack?.slice(0, 3).join(", ") || "—" },
  { id: "intent_kw", label: "Intent Keywords", source: "sixsense", getValue: a => a.keywordActivity?.slice(0, 2).map(k => k.keyword).join(", ") || "—" },
  { id: "buying_stage", label: "Buying Stage", source: "sixsense", getValue: a => a.stage },
  { id: "comp_risk", label: "Competitive Risk", source: "sixsense", getValue: a => { const s = a.scoring?.["PROD-001"]; return s?.competitiveRisk !== "None" ? `${s.competitiveRisk} — ${s.competitor}` : "None"; } },
];

// Default integration columns
const DEFAULT_INTEGRATION_COLS = [
  { id: "crm_owner", label: "CRM Owner", source: "salesforce", getValue: a => { const names = ["Sarah Chen","Mike Johnson","Alex Rivera","Jamie Lee","Pat Morgan","Taylor Kim","Jordan Smith"]; let h = 0; for (let i = 0; i < a.name.length; i++) h = a.name.charCodeAt(i) + ((h << 5) - h); return names[Math.abs(h) % names.length]; } },
  { id: "gong_competitor", label: "Competitor Mentioned", source: "gong", getValue: a => { const s = a.scoring?.["PROD-001"]; if (s?.competitiveRisk === "High") return `Yes — ${s.competitor}`; if (s?.competitiveRisk === "Medium") return `Yes — ${s.competitor}`; return "No"; } },
  { id: "health_score", label: "Health Score", source: "gainsight", getValue: a => a.stage === "Customer" ? randInt(40, 95) : "—" },
];

// Marketplace items
const FAVORITES = [
  { id: "linkedin_insights", source: "linkedin", label: "LinkedIn Insights", desc: "Hiring signals, org changes, employee growth" },
  { id: "gong_talk_time", source: "gong", label: "Gong — Talk Time", desc: "How much time reps spend on each account" },
  { id: "clearbit_enrich", source: "clearbit", label: "Clearbit Enrichment", desc: "Firmographics, technographics, traffic data" },
];
const DISCOVER = [
  { id: "bombora_intent", source: "bombora", label: "Bombora Intent", desc: "Surge scores and topic-level intent data" },
  { id: "g2_intent", source: "g2", label: "G2 Buyer Intent", desc: "G2 profile visits and comparison activity" },
  { id: "usergems_jc", source: "usergems", label: "UserGems Job Changes", desc: "Champion and contact job change tracking" },
  { id: "commonroom_signals", source: "commonroom", label: "CommonRoom Signals", desc: "Community, social, and product signals" },
];
const INTEGRATIONS = [
  { id: "sf_custom", source: "salesforce", label: "Salesforce — Custom Field", desc: "Map any Salesforce field to this column" },
  { id: "hs_deal", source: "hubspot", label: "HubSpot — Deal Stage", desc: "Current deal stage from HubSpot CRM" },
  { id: "gong_next", source: "gong", label: "Gong — Next Step", desc: "Most recent next step from Gong calls" },
  { id: "marketo_lead", source: "marketo", label: "Marketo — Lead Score", desc: "Current Marketo lead score for key contacts" },
];

function generateSampleData(srcId, accounts) {
  const data = {};
  accounts.forEach(a => {
    if (srcId === "linkedin_insights") data[a.id] = `+${randInt(2, 15)}% headcount · ${randInt(1, 8)} new hires`;
    else if (srcId === "gong_talk_time") data[a.id] = `${randInt(0, 12)}h ${randInt(0, 59)}m`;
    else if (srcId === "clearbit_enrich") data[a.id] = `${a.industry} · ${a.size} employees`;
    else if (srcId === "bombora_intent") data[a.id] = `Surge: ${randInt(40, 95)}`;
    else if (srcId === "g2_intent") data[a.id] = randInt(0, 5) > 2 ? `${randInt(1, 8)} profile visits` : "—";
    else if (srcId === "usergems_jc") data[a.id] = a.signalFields?.job_change ? "✓ Champion moved" : "—";
    else if (srcId === "commonroom_signals") data[a.id] = randInt(0, 4) > 2 ? `${randInt(1, 12)} community mentions` : "—";
    else if (srcId === "sf_custom") data[a.id] = rand(["Enterprise", "Mid-Market", "SMB", "Strategic"]);
    else if (srcId === "hs_deal") data[a.id] = rand(["Qualified", "Proposal", "Negotiation", "Closed Won", "—"]);
    else if (srcId === "gong_next") data[a.id] = rand(["Schedule demo", "Send proposal", "Follow up Q1", "Intro to VP", "—"]);
    else if (srcId === "marketo_lead") data[a.id] = randInt(0, 100);
    else data[a.id] = rand(["Active", "Engaged", "Monitoring", "—"]);
  });
  return data;
}

function hashColor(str) {
  let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  const c = ["var(--color-accent)","var(--color-purple)","var(--color-success)","var(--color-warning)","var(--color-danger)","var(--color-info)","var(--color-pink)","var(--color-sixsense)","var(--color-info)","var(--color-warning)"];
  return c[Math.abs(h) % c.length];
}

// ─── CELL EDIT POPOVER ───────────────────────────────────────────────────────
function CellEditor({ colLabel, accountName, value, onSave, onCancel, anchorRect }) {
  const [val, setVal] = useState(value || "");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const top = Math.min(anchorRect.bottom + 4, window.innerHeight - 200);
  const left = Math.min(anchorRect.left, window.innerWidth - 320);
  return (
    <>
      <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 999 }} />
      <div style={{ position: "fixed", top, left, zIndex: 1000, width: 300, background: "var(--color-bg-card)", border: "1px solid #e5e7eb", borderRadius: "var(--radius-xl)", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", padding: 16 }}>
        <div style={{ fontSize: "var(--font-size-xs)", color: L.textDim, marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>{colLabel} · {accountName}</div>
        <textarea ref={ref} value={val} onChange={e => setVal(e.target.value)} rows={3} style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-md)", border: "1px solid #e5e7eb", fontSize: "var(--font-size-base)", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "6px 14px", borderRadius: "var(--radius-md)", border: "1px solid #e5e7eb", background: "var(--color-bg-card)", color: L.textMuted, fontSize: "var(--font-size-sm)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={() => onSave(val)} style={{ padding: "6px 14px", borderRadius: "var(--radius-md)", border: "none", background: "var(--color-sixsense)", color: "var(--color-bg-card)", fontSize: "var(--font-size-sm)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
        </div>
      </div>
    </>
  );
}

// ─── DATA MARKETPLACE DRAWER ─────────────────────────────────────────────────
function DataMarketplaceDrawer({ onClose, onAddColumn, existingCols, accounts }) {
  const [tab, setTab] = useState("favorites");
  const [selected, setSelected] = useState(null);
  // RevvyAI state
  const [aiName, setAiName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFormat, setAiFormat] = useState("Free text");
  const [aiModel, setAiModel] = useState("RevvyAI");
  const promptRef = useRef(null);

  const tabs = [
    { id: "favorites", label: "☆ Favorites" },
    { id: "discover", label: "⊞ Discover" },
    { id: "integrations", label: "⟲ Integrations" },
    { id: "signals", label: "📡 Signals" },
    { id: "revvyai", label: "✦ RevvyAI" },
  ];

  const items = tab === "favorites" ? FAVORITES : tab === "discover" ? DISCOVER : tab === "integrations" ? INTEGRATIONS : [];

  const signalItems = SIGNAL_CONFIGS_DEFAULT.map(s => ({
    id: `sig_${s.id}`, source: "signals", label: s.name, desc: s.description, signalId: s.id
  }));

  const handleAdd = () => {
    if (!selected) return;
    const allItems = [...FAVORITES, ...DISCOVER, ...INTEGRATIONS, ...signalItems];
    const item = allItems.find(i => i.id === selected);
    if (!item) return;
    const data = {};
    if (item.signalId) {
      // Signal column
      accounts.forEach(a => {
        const hasSig = a.signals.some(s => s.signalConfig === item.label.split(" (")[0]);
        if (hasSig) {
          const sig = a.signals.find(s => s.signalConfig === item.label.split(" (")[0]);
          data[a.id] = `✓ Triggered · ${sig.detail.slice(0, 50)}`;
        } else {
          data[a.id] = "— Not triggered";
        }
      });
    } else {
      const gen = generateSampleData(item.id, accounts);
      Object.assign(data, gen);
    }
    onAddColumn({ id: item.id, label: item.label, source: item.source, data });
    onClose();
  };

  const handleGenerateAI = () => {
    if (!aiName || !aiPrompt) return;
    const data = {};
    accounts.forEach(a => {
      if (aiFormat === "High / Medium / Low") data[a.id] = rand(["High", "Medium", "Low"]);
      else if (aiFormat === "Score (0–100)") data[a.id] = randInt(10, 95);
      else if (aiFormat === "Yes / No") data[a.id] = rand(["Yes", "No"]);
      else if (aiFormat === "Short label") data[a.id] = rand(["Expand", "Retain", "Upsell", "At Risk", "New Opp", "Monitor"]);
      else {
        const stage = a.stage, intent = a.intentLevel;
        if (intent === "High" && stage === "Decision") data[a.id] = "High likelihood — active evaluation with strong signals.";
        else if (intent === "High") data[a.id] = "Medium — high intent but early in journey. Nurture recommended.";
        else if (stage === "Customer") data[a.id] = "Existing customer. Monitor for expansion signals.";
        else data[a.id] = "Low — limited engagement. Consider awareness campaign.";
      }
    });
    onAddColumn({ id: `ai_${Date.now()}`, label: aiName, source: "revvyai", data });
    onClose();
  };

  const insertRef = (colName) => {
    const el = promptRef.current;
    if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const text = aiPrompt;
    const insert = `{{${colName}}}`;
    setAiPrompt(text.slice(0, start) + insert + text.slice(end));
    setTimeout(() => { el.selectionStart = el.selectionEnd = start + insert.length; el.focus(); }, 0);
  };

  // Preview
  const showPreview = tab === "revvyai" && aiPrompt.length > 10;
  const previewAccounts = accounts.slice(0, 3);
  const refs = (aiPrompt.match(/\{\{(.*?)\}\}/g) || []).map(r => r.replace(/[{}]/g, ""));

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.3)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 540, zIndex: 999, background: "var(--color-bg-card)", borderLeft: "1px solid #e5e7eb", boxShadow: "-8px 0 40px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {<SrcIcon sourceId="sixsense" size={16} />}
            <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: L.text }}>Add Data Column</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "var(--font-size-xl)", color: L.textDim, cursor: "pointer" }}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }} style={{
              flex: 1, padding: "10px 8px", border: "none", borderBottom: tab === t.id ? "2px solid #0D9488" : "2px solid transparent",
              background: "transparent", color: tab === t.id ? "var(--color-sixsense)" : L.textMuted, fontSize: "var(--font-size-sm)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
            }}>{t.label}</button>
          ))}
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {/* Favorites / Discover / Integrations */}
          {(tab === "favorites" || tab === "discover" || tab === "integrations") && (
            <div style={{ display: "grid", gap: 8 }}>
              {items.map(item => {
                const isSelected = selected === item.id;
                const alreadyAdded = existingCols.some(c => c.id === item.id);
                return (
                  <div key={item.id} onClick={() => !alreadyAdded && setSelected(isSelected ? null : item.id)} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: "var(--radius-lg)",
                    border: `2px solid ${isSelected ? "var(--color-success)" : alreadyAdded ? "var(--color-border)" : "var(--color-border)"}`,
                    background: isSelected ? "var(--color-success-subtle)" : alreadyAdded ? "var(--color-bg-hover)" : "var(--color-bg-card)",
                    cursor: alreadyAdded ? "default" : "pointer", opacity: alreadyAdded ? 0.5 : 1
                  }}>
                    <SrcIcon sourceId={item.source} size={18} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: L.text }}>{item.label}</div>
                      <div style={{ fontSize: "var(--font-size-sm)", color: L.textMuted }}>{item.desc}</div>
                    </div>
                    {alreadyAdded && <span style={{ fontSize: "var(--font-size-xs)", color: L.textDim }}>Added</span>}
                    {isSelected && <span style={{ color: "var(--color-success)", fontWeight: 700, fontSize: 16 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Signals */}
          {tab === "signals" && (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: "var(--font-size-sm)", color: L.textMuted, marginBottom: 4 }}>Active signals from your Signals Builder. Add as a column to see trigger status per account.</div>
              {signalItems.map(item => {
                const isSelected = selected === item.id;
                const alreadyAdded = existingCols.some(c => c.id === item.id);
                return (
                  <div key={item.id} onClick={() => !alreadyAdded && setSelected(isSelected ? null : item.id)} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: "var(--radius-lg)",
                    border: `2px solid ${isSelected ? "var(--color-success)" : "var(--color-border)"}`,
                    background: isSelected ? "var(--color-success-subtle)" : "var(--color-bg-card)",
                    cursor: alreadyAdded ? "default" : "pointer", opacity: alreadyAdded ? 0.5 : 1
                  }}>
                    {<SrcIcon sourceId="signals" size={18} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: L.text }}>{item.label}</div>
                      <div style={{ fontSize: "var(--font-size-sm)", color: L.textMuted }}>{item.desc}</div>
                    </div>
                    <span style={{ fontSize: "var(--font-size-xs)", padding: "2px 8px", borderRadius: "var(--radius-xl)", background: "var(--color-success-subtle)", color: "var(--color-success)", fontWeight: 600 }}>Active</span>
                    {alreadyAdded && <span style={{ fontSize: "var(--font-size-xs)", color: L.textDim }}>Added</span>}
                    {isSelected && <span style={{ color: "var(--color-success)", fontWeight: 700, fontSize: 16 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* RevvyAI */}
          {tab === "revvyai" && (
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ fontSize: "var(--font-size-xs)", color: L.textMuted, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>Column Name *</label>
                <input value={aiName} onChange={e => setAiName(e.target.value)} placeholder="e.g. Expansion Likelihood, Next Best Action…" style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e5e7eb", fontSize: "var(--font-size-base)", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "var(--font-size-xs)", color: L.textMuted, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>Reference Columns <span style={{ fontWeight: 400, textTransform: "none" }}>— click to insert</span></label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[...NATIVE_COLS.map(c => c.label), ...DEFAULT_INTEGRATION_COLS.map(c => c.label), ...existingCols.map(c => c.label)].map(name => (
                    <button key={name} onClick={() => insertRef(name)} style={{
                      padding: "4px 10px", borderRadius: "var(--radius-md)", border: "1px solid #E9D5FF", background: "var(--color-purple-subtle)",
                      color: "var(--color-purple)", fontSize: "var(--font-size-xs)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                    }}>
                      {`{{`} {name} {`}}`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: "var(--font-size-xs)", color: L.textMuted, textTransform: "uppercase", fontWeight: 600 }}>Prompt *</label>
                  {aiPrompt && <button onClick={() => setAiPrompt("")} style={{ background: "none", border: "none", color: L.textDim, fontSize: "var(--font-size-xs)", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>}
                </div>
                <textarea ref={promptRef} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={5} placeholder='e.g. Based on {{Buying Stage}} and {{Intent Keywords}}, what is the likelihood of expansion in the next 90 days? If {{Competitor Mentioned}} contains Yes, flag as high risk. Respond: High / Medium / Low + one-sentence reason.' style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e5e7eb", fontSize: "var(--font-size-base)", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                <div style={{ fontSize: "var(--font-size-xs)", color: L.textDim, marginTop: 4 }}>Use {"{{Column Name}}"} to reference any column in your prompt</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "var(--font-size-xs)", color: L.textMuted, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>Output Format</label>
                  <select value={aiFormat} onChange={e => setAiFormat(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e5e7eb", fontSize: "var(--font-size-base)", fontFamily: "inherit", outline: "none" }}>
                    {["Free text","High / Medium / Low","Score (0–100)","Yes / No","Short label"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "var(--font-size-xs)", color: L.textMuted, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>Model</label>
                  <select value={aiModel} onChange={e => setAiModel(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e5e7eb", fontSize: "var(--font-size-base)", fontFamily: "inherit", outline: "none" }}>
                    {["RevvyAI","GPT-4o","GPT-5","Claude 3.5","Gemini 1.5 Pro"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              {showPreview && (
                <div style={{ padding: 16, borderRadius: "var(--radius-lg)", background: "var(--color-purple-subtle)", border: "1px solid #E9D5FF" }}>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-purple)", fontWeight: 700, marginBottom: 4 }}>✦ LIVE PREVIEW — FIRST 3 ACCOUNTS {refs.length > 0 && <span style={{ fontWeight: 400, marginLeft: 8 }}>Using: {refs.map(r => `{{${r}}}`).join(", ")}</span>}</div>
                  <div style={{ borderTop: "1px solid #E9D5FF", marginTop: 8, paddingTop: 8, display: "grid", gap: 6 }}>
                    {previewAccounts.map(a => {
                      let val;
                      if (aiFormat === "High / Medium / Low") val = a.intentLevel === "High" ? "High" : a.intentLevel === "Medium" ? "Medium" : "Low";
                      else if (aiFormat === "Score (0–100)") val = a.sixsenseScore;
                      else val = a.intentLevel === "High" ? `High — Active ${a.stage.toLowerCase()} with strong intent signals.` : `Low — Early stage, limited engagement detected.`;
                      return (
                        <div key={a.id} style={{ display: "flex", gap: 12, fontSize: "var(--font-size-sm)" }}>
                          <span style={{ fontWeight: 600, color: L.text, minWidth: 100 }}>{a.name}</span>
                          <span style={{ color: "var(--color-purple)" }}>{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Action bar */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>
          {tab === "revvyai" ? (
            <button onClick={handleGenerateAI} disabled={!aiName || !aiPrompt} style={{
              width: "100%", padding: "12px", borderRadius: "var(--radius-lg)", border: "none",
              background: aiName && aiPrompt ? "linear-gradient(135deg, #7C3AED, #0D9488)" : "var(--color-border)",
              color: aiName && aiPrompt ? "var(--color-bg-card)" : "var(--color-text-muted)", fontSize: "var(--font-size-md)", fontWeight: 700, cursor: aiName && aiPrompt ? "pointer" : "default", fontFamily: "inherit"
            }}>✦ Generate Column with RevvyAI</button>
          ) : (
            <button onClick={handleAdd} disabled={!selected} style={{
              width: "100%", padding: "12px", borderRadius: "var(--radius-lg)", border: "none",
              background: selected ? "var(--color-sixsense)" : "var(--color-border)",
              color: selected ? "var(--color-bg-card)" : "var(--color-text-muted)", fontSize: "var(--font-size-md)", fontWeight: 700, cursor: selected ? "pointer" : "default", fontFamily: "inherit"
            }}>Add Column →</button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── MAIN ACCOUNTS VIEW ──────────────────────────────────────────────────────
export default function AccountsView({ accounts, search, onSearch, onAccountClick, onEnrich, extCols, onToggleMode, demoDrawerOpen }) {
  const [customCols, setCustomCols] = useState([]);
  const [cellData, setCellData] = useState({});
  const [colOrder, setColOrder] = useState(null); // null = default order
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [dragCol, setDragCol] = useState(null);
  const [filterStage, setFilterStage] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Demo can open the drawer
  useEffect(() => {
    if (demoDrawerOpen && !drawerOpen) setDrawerOpen(true);
  }, [demoDrawerOpen]);

  const allDynamicCols = [...DEFAULT_INTEGRATION_COLS, ...customCols];
  const orderedCols = colOrder || [...NATIVE_COLS.map(c => c.id), ...allDynamicCols.map(c => c.id)];

  // Rebuild order when cols change
  useEffect(() => {
    if (colOrder) {
      const newIds = allDynamicCols.map(c => c.id).filter(id => !colOrder.includes(id));
      if (newIds.length > 0) setColOrder([...colOrder, ...newIds]);
    }
  }, [customCols.length]);

  const getCol = (id) => NATIVE_COLS.find(c => c.id === id) || allDynamicCols.find(c => c.id === id);

  const filteredAccounts = useMemo(() => {
    let list = [...accounts];
    if (search) list = list.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    if (filterStage !== "all") list = list.filter(a => a.stage === filterStage);
    if (filterType !== "all") {
      if (filterType === "Customer") list = list.filter(a => a.stage === "Customer");
      else if (filterType === "Prospect") list = list.filter(a => a.stage !== "Customer");
    }
    return list;
  }, [accounts, search, filterStage, filterType]);

  const handleAddColumn = (col) => {
    setCustomCols(prev => [...prev, col]);
  };

  const handleRemoveCol = (colId) => {
    setCustomCols(prev => prev.filter(c => c.id !== colId));
    if (colOrder) setColOrder(prev => prev.filter(id => id !== colId));
  };

  const handleDragStart = (e, colId) => { setDragCol(colId); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    if (!dragCol || dragCol === targetColId) return;
    const order = colOrder || [...NATIVE_COLS.map(c => c.id), ...allDynamicCols.map(c => c.id)];
    const fromIdx = order.indexOf(dragCol), toIdx = order.indexOf(targetColId);
    if (fromIdx < 0 || toIdx < 0) return;
    const newOrder = [...order];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragCol);
    setColOrder(newOrder);
    setDragCol(null);
  };

  const getCellValue = (colId, account) => {
    const override = cellData[`${colId}_${account.id}`];
    if (override !== undefined) return override;
    const col = getCol(colId);
    if (!col) return "—";
    if (col.getValue) return col.getValue(account);
    if (col.data) return col.data[account.id] || "—";
    return "—";
  };

  const isNative = (colId) => NATIVE_COLS.some(c => c.id === colId);

  const stageVariant = (v) => v === "Decision" ? "success" : v === "Consideration" ? "warning" : v === "Awareness" ? "info" : v === "Customer" ? "sixsense" : "muted";
  const riskVariant = (v) => { if (typeof v !== "string") return "default"; if (v.startsWith("High")) return "danger"; if (v.startsWith("Medium")) return "warning"; if (v.startsWith("Low")) return "success"; return "muted"; };

  const renderCellContent = (colId, value) => {
    if (colId === "buying_stage") return <Badge variant={stageVariant(value)} size="md">{value}</Badge>;
    if (colId === "comp_risk" && value !== "None") return <Badge variant={riskVariant(value)} size="sm">{value}</Badge>;
    if (colId === "comp_risk") return <span className="text-[var(--color-text-muted)]">None</span>;
    if (colId === "health_score" && value !== "—") {
      const n = parseInt(value); const variant = n > 70 ? "success" : n > 40 ? "warning" : "danger";
      return <Badge variant={variant} size="sm">{value}</Badge>;
    }
    if (colId === "gong_competitor") {
      if (typeof value === "string" && value.startsWith("Yes")) return <Badge variant="danger" size="sm">{value}</Badge>;
      return <span className="text-[var(--color-text-muted)]">{value}</span>;
    }
    if (typeof value === "string" && value.startsWith("✓")) return <Badge variant="success" size="sm" dot>{value.replace("✓ ", "")}</Badge>;
    if (value === "— Not triggered") return <span className="text-[var(--color-text-muted)]">{value}</span>;
    return <span className="text-[var(--color-text)]">{value || "—"}</span>;
  };

  // Collect unique sources for footer
  const activeSources = useMemo(() => {
    const ids = new Set(["sixsense", ...DEFAULT_INTEGRATION_COLS.map(c => c.source), ...customCols.map(c => c.source)]);
    return [...ids].map(id => SOURCES[id]).filter(Boolean);
  }, [customCols]);

  const displayCols = (colOrder || [...NATIVE_COLS.map(c => c.id), ...allDynamicCols.map(c => c.id)]).filter(id => getCol(id));

  return (
    <div className="bg-[var(--color-bg)] h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SrcIcon sourceId="sixsense" size={18} />
          <span className="text-[length:var(--font-size-md)] text-[var(--color-text-secondary)]">Sales Intelligence ›</span>
          <span className="text-[length:var(--font-size-md)] font-bold text-[var(--color-text)]">Account Intelligence View</span>
          <Badge variant="purple" size="sm">BYOD PROTOTYPE</Badge>
        </div>
        <div className="flex gap-2 items-center">
          {onToggleMode && <Button variant="secondary" size="sm" onClick={onToggleMode}>🌙 Dark View</Button>}
          <Button variant="default" size="sm" onClick={() => setDrawerOpen(true)} data-demo="add-col-btn">+ Add Data Column</Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 py-2.5 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] flex items-center gap-3">
        <div className="relative flex-1 max-w-[300px]">
          <span className="absolute left-2.5 top-2 text-[var(--color-text-muted)]">🔍</span>
          <input
            value={search} onChange={e => onSearch(e.target.value)} placeholder="Search accounts…"
            className="w-full py-2 px-3 pl-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] text-[length:var(--font-size-base)] font-[family-name:var(--font-sans)] outline-none bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
          />
        </div>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
          className="py-2 px-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] text-[length:var(--font-size-sm)] font-[family-name:var(--font-sans)] outline-none text-[var(--color-text-secondary)] bg-[var(--color-bg-card)]"
        >
          <option value="all">All Buying Stages</option>
          {["Decision","Consideration","Awareness","Customer"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="py-2 px-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] text-[length:var(--font-size-sm)] font-[family-name:var(--font-sans)] outline-none text-[var(--color-text-secondary)] bg-[var(--color-bg-card)]"
        >
          <option value="all">All Account Types</option>
          <option value="Customer">Customer</option>
          <option value="Prospect">Prospect</option>
        </select>
        <span className="ml-auto text-[length:var(--font-size-sm)] text-[var(--color-text-muted)]">Showing {filteredAccounts.length} accounts</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto light-scroll">
        <Table style={{ minWidth: 800 + displayCols.length * 160 }}>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              {/* Sticky company col header */}
              <TableHead
                className="sticky left-0 z-10 min-w-[240px] bg-[var(--color-bg-card)] border-t-[3px] border-t-[var(--color-sixsense)]"
              >
                <span className="inline-flex items-center gap-1.5">
                  <SrcIcon sourceId="sixsense" size={12} /> Company
                </span>
              </TableHead>
              {displayCols.map(colId => {
                const col = getCol(colId);
                if (!col) return null;
                const src = SOURCES[col.source] || SOURCES.sixsense;
                const native = isNative(colId);
                return (
                  <TableHead
                    key={colId}
                    draggable
                    onDragStart={e => handleDragStart(e, colId)}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, colId)}
                    data-col={colId}
                    className={cn(
                      "min-w-[150px] cursor-grab select-none relative border-t-[3px]",
                      dragCol === colId ? "bg-[var(--color-success-subtle)]" : "bg-[var(--color-bg-card)]"
                    )}
                    style={{ borderTopColor: src.color }}
                  >
                    <div className="flex items-center gap-1.5">
                      <SrcIcon sourceId={col.source} size={12} />
                      <div>
                        <div className="text-[length:var(--font-size-sm)] font-semibold text-[var(--color-text)] normal-case">{col.label}</div>
                        <div className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase">{src.name}</div>
                      </div>
                    </div>
                    {!native && (
                      <button
                        onClick={e => { e.stopPropagation(); handleRemoveCol(colId); }}
                        className="absolute top-1 right-1.5 bg-transparent border-none text-[var(--color-text-muted)] text-sm cursor-pointer leading-none hover:text-[var(--color-danger)] transition-colors"
                        title="Remove column"
                      >×</button>
                    )}
                  </TableHead>
                );
              })}
              {/* Add column header */}
              <TableHead
                onClick={() => setDrawerOpen(true)}
                className="text-center min-w-[120px] font-bold cursor-pointer text-[var(--color-success)] text-[length:var(--font-size-sm)] bg-[var(--color-success-subtle)] border-t-[3px] border-t-[var(--color-success)]"
              >
                ＋ Add Column
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.map(a => (
              <TableRow key={a.id} className="cursor-pointer">
                {/* Sticky company cell */}
                <TableCell
                  onClick={() => onAccountClick(a)}
                  className="sticky left-0 z-[5] cursor-pointer bg-[var(--color-bg-card)] group-hover:bg-[var(--color-bg-hover)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex items-center justify-center shrink-0 font-bold text-[length:var(--font-size-sm)]"
                      style={{
                        width: 28, height: 28, borderRadius: "var(--radius-md)",
                        background: hashColor(a.name) + "18",
                        border: `1.5px solid ${hashColor(a.name)}30`,
                        color: hashColor(a.name),
                      }}
                    >{a.name.charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-[length:var(--font-size-base)] text-[var(--color-text)]">{a.name}</div>
                      <div className="text-[length:var(--font-size-xs)] text-[var(--color-text-muted)]">{a.stage === "Customer" ? "Customer" : "Prospect"} · {a.revenue}</div>
                    </div>
                  </div>
                </TableCell>
                {displayCols.map(colId => {
                  const value = getCellValue(colId, a);
                  return (
                    <TableCell
                      key={colId}
                      onClick={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const col = getCol(colId);
                        setEditingCell({ colId, accountId: a.id, accountName: a.name, colLabel: col?.label || colId, value: String(value), rect });
                      }}
                      className="cursor-pointer"
                    >
                      {renderCellContent(colId, value)}
                    </TableCell>
                  );
                })}
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer legend */}
      <div className="px-6 py-2.5 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] flex items-center gap-4 text-[length:var(--font-size-xs)] text-[var(--color-text-muted)]">
        {activeSources.map(s => (
          <div key={s.name} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
            {s.name}
          </div>
        ))}
        {customCols.filter(c => c.source === "signals").length > 0 && <span>📡 Signals ({customCols.filter(c => c.source === "signals").length})</span>}
        {customCols.filter(c => c.source === "revvyai").length > 0 && <span>✦ RevvyAI ({customCols.filter(c => c.source === "revvyai").length})</span>}
        <span className="ml-auto text-[var(--color-text-muted)]">Click any cell to edit · Drag column headers to reorder · + Add Data Column to bring your own data</span>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <DataMarketplaceDrawer
          onClose={() => setDrawerOpen(false)}
          onAddColumn={handleAddColumn}
          existingCols={customCols}
          accounts={filteredAccounts}
        />
      )}

      {/* Cell editor */}
      {editingCell && (
        <CellEditor
          colLabel={editingCell.colLabel}
          accountName={editingCell.accountName}
          value={editingCell.value}
          anchorRect={editingCell.rect}
          onSave={val => {
            setCellData(prev => ({ ...prev, [`${editingCell.colId}_${editingCell.accountId}`]: val }));
            setEditingCell(null);
          }}
          onCancel={() => setEditingCell(null)}
        />
      )}
    </div>
  );
}
