import React, { useState, useMemo } from 'react';
import { L, C } from '../components/ui/theme';
import { Icons } from '../components/Icons';

// Deterministic color from string
function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#0891b2","#7c3aed","#059669","#d97706","#dc2626","#2563eb","#db2777","#0d9488","#4f46e5","#ca8a04","#be185d","#0369a1"];
  return colors[Math.abs(hash) % colors.length];
}

// Company icon with first letter
function CompanyAvatar({ name, size = 34 }) {
  const bg = hashColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, background: bg + "18",
      border: `1.5px solid ${bg}30`, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, color: bg, flexShrink: 0
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// Light badge
function LBadge({ children, color = L.accent, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, color,
      background: bg || color + "14",
      whiteSpace: "nowrap"
    }}>
      {children}
    </span>
  );
}

// Score pill
function ScorePill({ value, max = 100 }) {
  const pct = value / max;
  const color = pct > 0.7 ? L.green : pct > 0.4 ? L.orange : L.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 60, height: 5, borderRadius: 3, background: L.border }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 3, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 24 }}>{value}</span>
    </div>
  );
}

export default function AccountsView({ accounts, search, onSearch, onAccountClick, onEnrich, extCols, onToggleMode }) {
  const [sortField, setSortField] = useState("sixsenseScore");
  const [sortDir, setSortDir] = useState("desc");
  const [tableCols, setTableCols] = useState(["name","industry","abmTier","intentLevel","sixsenseScore","stage","lastActivity"]);
  const [addColOpen, setAddColOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // list | compact

  const allCols = [
    { key: "name", label: "Company Name" },
    { key: "industry", label: "Industry" },
    { key: "size", label: "Size" },
    { key: "revenue", label: "Revenue" },
    { key: "location", label: "Location" },
    { key: "abmTier", label: "ABM Tier" },
    { key: "intentLevel", label: "Intent" },
    { key: "sixsenseScore", label: "6sense Score" },
    { key: "stage", label: "Stage" },
    { key: "lastActivity", label: "Last Activity" },
    { key: "contactCount", label: "Contacts" },
    { key: "buyingGroupCoverage", label: "BG Coverage" },
    ...(extCols || []).map(ec => ({ key: ec.key, label: `${ec.key} (${ec.source})`, external: true }))
  ];

  const filteredAccounts = useMemo(() => {
    let list = [...accounts];
    if (search) list = list.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.industry.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      if (typeof av === "number") return sortDir === "desc" ? bv - av : av - bv;
      return sortDir === "desc" ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    });
    return list;
  }, [accounts, search, sortField, sortDir]);

  const toggleSort = (f) => {
    if (sortField === f) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortField(f); setSortDir("desc"); }
  };

  const intentColor = (level) => level === "High" ? L.green : level === "Medium" ? L.orange : level === "Low" ? L.red : L.textDim;
  const stageColor = (stage) => stage === "Decision" ? L.orange : stage === "Customer" ? L.green : stage === "Consideration" ? L.purple : L.blue;
  const abmColor = (tier) => tier === "1:1" ? L.accent : tier === "1:Few" ? L.purple : L.textDim;

  const renderCell = (a, col) => {
    if (col === "name") return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <CompanyAvatar name={a.name} />
        <div>
          <div style={{ fontWeight: 600, color: L.text, fontSize: 13 }}>{a.name}</div>
          <div style={{ fontSize: 11, color: L.textDim }}>{a.domain}</div>
        </div>
      </div>
    );
    if (col === "intentLevel") return <LBadge color={intentColor(a.intentLevel)} bg={intentColor(a.intentLevel) + "12"}>{a.intentLevel}</LBadge>;
    if (col === "sixsenseScore") return <ScorePill value={a.sixsenseScore} />;
    if (col === "stage") return <LBadge color={stageColor(a.stage)} bg={stageColor(a.stage) + "12"}>{a.stage}</LBadge>;
    if (col === "abmTier") return <LBadge color={abmColor(a.abmTier)} bg={abmColor(a.abmTier) + "12"}>{a.abmTier}</LBadge>;
    if (col === "buyingGroupCoverage") return <ScorePill value={a.buyingGroupCoverage} />;
    if (col === "lastActivity") return <span style={{ color: L.textMuted, fontSize: 12 }}>{a.lastActivity}</span>;
    const colDef = allCols.find(c => c.key === col);
    if (colDef?.external) return <span style={{ color: L.textMuted, fontSize: 12 }}>—</span>;
    return <span style={{ color: L.textMuted, fontSize: 13 }}>{a[col] ?? "—"}</span>;
  };

  return (
    <div style={{ background: L.bg, minHeight: "100%", padding: "0" }}>
      {/* Header */}
      <div style={{ padding: "24px 32px 0", background: L.bgCard, borderBottom: `1px solid ${L.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: L.text, letterSpacing: "-0.02em" }}>
              Accounts <span style={{ fontSize: 16, fontWeight: 500, color: L.textDim, marginLeft: 8 }}>{filteredAccounts.length}</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={L.textDim} strokeWidth="2" style={{ position: "absolute", left: 10, top: 9 }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search accounts..."
                style={{ padding: "8px 12px 8px 34px", borderRadius: 8, border: `1px solid ${L.border}`, background: L.bg, color: L.text, fontSize: 13, fontFamily: "inherit", outline: "none", width: 240 }}
              />
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1px solid ${L.border}`, background: L.bgCard, color: L.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
              Sort
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1px solid ${L.border}`, background: L.bgCard, color: L.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter
            </button>
            <div style={{ width: 1, height: 28, background: L.border, margin: "0 4px" }} />
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1px solid ${L.border}`, background: L.bgCard, color: L.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              ≡ List View
            </button>
            {onToggleMode && (
              <button onClick={onToggleMode} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1px solid ${L.border}`, background: L.bgCard, color: L.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                🌙 Dark View
              </button>
            )}
            <button onClick={onEnrich} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", background: L.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              + Add Column
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 24, paddingBottom: 16 }}>
          {[
            { label: "Total", value: accounts.length, color: L.text },
            { label: "High Intent", value: accounts.filter(a => a.intentLevel === "High").length, color: L.green },
            { label: "1:1 Named", value: accounts.filter(a => a.abmTier === "1:1").length, color: L.accent },
            { label: "Active Signals", value: accounts.reduce((s, a) => s + a.signals.length, 0), color: L.orange },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, color: L.textMuted }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: "0 32px 32px" }}>
        <div style={{ background: L.bgCard, borderRadius: "0 0 12px 12px", border: `1px solid ${L.border}`, borderTop: "none", overflow: "auto", maxHeight: "calc(100vh - 220px)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "12px 16px", textAlign: "left", color: L.textDim, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", position: "sticky", top: 0, background: L.bgCard, borderBottom: `1px solid ${L.border}`, zIndex: 1, width: 40 }}>#</th>
                {tableCols.map(col => {
                  const colDef = allCols.find(c => c.key === col);
                  return (
                    <th key={col} onClick={() => toggleSort(col)} style={{
                      padding: "12px 16px", textAlign: "left",
                      color: sortField === col ? L.accent : L.textDim,
                      fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em",
                      cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
                      position: "sticky", top: 0, background: L.bgCard,
                      borderBottom: `1px solid ${L.border}`, zIndex: 1
                    }}>
                      {colDef?.label || col}
                      {sortField === col && <span style={{ marginLeft: 4 }}>{sortDir === "desc" ? "↓" : "↑"}</span>}
                    </th>
                  );
                })}
                {/* Add column button */}
                <th style={{ padding: "12px 8px", position: "sticky", top: 0, background: L.bgCard, borderBottom: `1px solid ${L.border}`, zIndex: 1, width: 40 }}>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setAddColOpen(!addColOpen)} style={{
                      width: 28, height: 28, borderRadius: 6, border: `1px solid ${L.border}`,
                      background: L.bg, color: L.textDim, cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 16
                    }}>+</button>
                    {addColOpen && (
                      <div style={{
                        position: "absolute", top: 36, right: 0, zIndex: 100,
                        background: L.bgCard, border: `1px solid ${L.border}`, borderRadius: 10,
                        padding: 8, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", minWidth: 200
                      }}>
                        <div style={{ padding: "6px 12px", fontSize: 11, color: L.textDim, fontWeight: 600, textTransform: "uppercase" }}>Add Column</div>
                        {allCols.filter(c => !tableCols.includes(c.key)).map(c => (
                          <div key={c.key} onClick={() => { setTableCols([...tableCols, c.key]); setAddColOpen(false); }}
                            style={{ padding: "8px 12px", fontSize: 13, color: L.text, cursor: "pointer", borderRadius: 6 }}
                            onMouseEnter={e => e.currentTarget.style.background = L.bgHover}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            {c.label}
                          </div>
                        ))}
                        <div style={{ borderTop: `1px solid ${L.border}`, margin: "4px 0" }} />
                        <div onClick={onEnrich} style={{ padding: "8px 12px", fontSize: 13, color: L.accent, cursor: "pointer", borderRadius: 6, fontWeight: 600 }}
                          onMouseEnter={e => e.currentTarget.style.background = L.bgHover}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          ↗ Enrich from External System
                        </div>
                      </div>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((a, idx) => (
                <tr key={a.id} onClick={() => onAccountClick(a)}
                  style={{ cursor: "pointer", borderBottom: `1px solid ${L.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = L.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", fontSize: 12, color: L.textDim, fontWeight: 500 }}>{idx + 1}</td>
                  {tableCols.map(col => (
                    <td key={col} style={{ padding: "14px 16px" }}>
                      {renderCell(a, col)}
                    </td>
                  ))}
                  <td style={{ padding: "14px 8px" }} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
