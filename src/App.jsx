import React, { useState, useMemo } from 'react';
import { C, L } from './components/ui/theme';
import { Badge, Btn, Inp, Stat, Score, TH, TR, TD, EmptyState, SectionLabel } from './components/ui';
import { Icons } from './components/Icons';
import { generateAccounts, generateContacts, getSignalEvents, getAllActivities, rand, randInt, randDate } from './data/generators';
import { SIGNAL_CONFIGS_DEFAULT, AUDIENCES_DEFAULT, WORKFLOWS_DEFAULT, CONTENT_ITEMS, EXT_SYSTEMS } from './data/constants';
import AccountDetail from './modals/AccountDetail';
import AccountsView from './views/AccountsView';
import ContactDetail from './modals/ContactDetail';
import ContentDetail from './modals/ContentDetail';
import { SignalConfigModal, AudienceBuilder, EnrichModal } from './modals/SharedModals';
import WorkflowBuilder from './modals/WorkflowBuilder';
import IntelligenceView from './views/IntelligenceView';
import RevvyAI from './modals/RevvyAI';

export default function App() {
  const [accounts] = useState(() => generateAccounts(100));
  const [contacts] = useState(() => generateContacts(accounts));
  const signalEvents = getSignalEvents();
  const allActivities = getAllActivities();

  const [section, setSection] = useState("accounts");
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [signalModal, setSignalModal] = useState(null);
  const [newSignal, setNewSignal] = useState(false);
  const [signalDetailView, setSignalDetailView] = useState(null);
  const [audienceBuilder, setAudienceBuilder] = useState(false);
  const [enrichModal, setEnrichModal] = useState(false);
  const [workflowBuilder, setWorkflowBuilder] = useState(false);
  const [revvyOpen, setRevvyOpen] = useState(false);
  const [signalConfigs, setSignalConfigs] = useState(SIGNAL_CONFIGS_DEFAULT);
  const [sortField, setSortField] = useState("sixsenseScore");
  const [sortDir, setSortDir] = useState("desc");
  const [tableCols, setTableCols] = useState(["name","industry","abmTier","intentLevel","sixsenseScore","stage","lastActivity"]);
  const [addColOpen, setAddColOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState("All");
  const [actDateFrom, setActDateFrom] = useState("");
  const [actDateTo, setActDateTo] = useState("");
  const [audienceView, setAudienceView] = useState(null);
  const [audTableCols, setAudTableCols] = useState(["name","industry","intentLevel","sixsenseScore","abmTier","lastActivity"]);
  const [audAddCol, setAudAddCol] = useState(false);
  const [extCols, setExtCols] = useState([]);
  const [uiMode, setUiMode] = useState("light"); // "light" = new Crisp style, "dark" = original

  const nav = [
    { key: "accounts", icon: Icons.accounts, label: "Accounts" },
    { key: "contacts", icon: Icons.contacts, label: "Contacts" },
    { key: "signals", icon: Icons.signals, label: "Signals" },
    { key: "audiences", icon: Icons.audiences, label: "Audiences" },
    { key: "activities", icon: Icons.activity, label: "Activities" },
    { key: "content", icon: Icons.content, label: "Content" },
    { key: "workflows", icon: Icons.workflows, label: "Workflows" },
    { key: "graph", icon: Icons.graph, label: "Intelligence" },
    { key: "revvy", icon: Icons.revvy, label: "RevvyAI" },
  ];

  const allCols = [
    { key: "name", label: "Account" },{ key: "industry", label: "Industry" },{ key: "size", label: "Size" },
    { key: "revenue", label: "Revenue" },{ key: "location", label: "Location" },{ key: "abmTier", label: "ABM Tier" },
    { key: "intentLevel", label: "Intent" },{ key: "sixsenseScore", label: "6sense Score" },{ key: "stage", label: "Stage" },
    { key: "lastActivity", label: "Last Activity" },{ key: "contactCount", label: "Contacts" },
    { key: "buyingGroupCoverage", label: "BG Coverage" },{ key: "techStack", label: "Tech Stack" },
    ...extCols.map(ec => ({ key: ec.key, label: `${ec.key} (${ec.source})`, external: true }))
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

  const filteredContacts = useMemo(() => {
    let list = contacts.filter(c => !c.isHidden);
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.accountName.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => b.score - a.score);
  }, [contacts, search]);

  const filteredActivities = useMemo(() => {
    let list = [...allActivities];
    if (activityFilter !== "All") list = list.filter(a => a.type === activityFilter);
    if (actDateFrom) list = list.filter(a => a.date >= actDateFrom);
    if (actDateTo) list = list.filter(a => a.date <= actDateTo);
    if (search) list = list.filter(a => a.detail.toLowerCase().includes(search.toLowerCase()) || a.entityName.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [allActivities, activityFilter, actDateFrom, actDateTo, search]);

  const toggleSort = (f) => { if (sortField === f) setSortDir(d => d === "desc" ? "asc" : "desc"); else { setSortField(f); setSortDir("desc"); } };

  const renderCell = (a, col) => {
    if (col === "name") return <div><div style={{ fontWeight: 600, color: C.text }}>{a.name}</div><div style={{ fontSize: 11, color: C.textDim }}>{a.domain}</div></div>;
    if (col === "intentLevel") return <Badge color={a.intentLevel === "High" ? C.green : a.intentLevel === "Medium" ? C.orange : a.intentLevel === "Low" ? C.red : C.textDim} small>{a.intentLevel}</Badge>;
    if (col === "sixsenseScore") return <Score value={a.sixsenseScore} />;
    if (col === "stage") return <Badge color={C.blue} small>{a.stage}</Badge>;
    if (col === "abmTier") return <Badge color={a.abmTier === "1:1" ? C.accent : a.abmTier === "1:Few" ? C.purple : C.textMuted} small>{a.abmTier}</Badge>;
    if (col === "buyingGroupCoverage") return <Score value={a.buyingGroupCoverage} />;
    if (col === "joinedDate") { const aud = a.audiences?.find(au => audienceView && au.name === audienceView.name); return <span style={{ color: C.textDim }}>{aud?.joinedDate || "—"}</span>; }
    if (col === "techStack") return <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{a.techStack.slice(0, 3).map(t => <Badge key={t} color={C.purple} small>{t}</Badge>)}{a.techStack.length > 3 && <Badge color={C.textDim} small>+{a.techStack.length - 3}</Badge>}</div>;
    const colDef = allCols.find(c => c.key === col);
    if (colDef?.external) return <span style={{ color: C.textMuted, fontSize: 12 }}>{col.includes("Score") || col.includes("%") ? randInt(10, 99) + "%" : col.includes("Date") ? randDate(30) : col.includes("$") || col.includes("ARR") || col.includes("Amount") ? "$" + randInt(10, 500) + "K" : rand(["Active","Engaged","MQL","SQL","Opportunity"])}</span>;
    return <span style={{ color: C.textMuted }}>{a[col] ?? "—"}</span>;
  };

  const actColor = (type) => type.includes("Signal") ? C.orange : type.includes("Email") ? C.blue : type.includes("Sync") ? C.purple : type.includes("Ad") ? C.pink : type.includes("Agent") ? C.accent : type.includes("Content") ? C.green : type.includes("Workflow") ? C.orange : C.textMuted;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Satoshi', system-ui, sans-serif", background: C.bg, color: C.text, fontSize: 13, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: 220, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", background: C.bgPanel, flexShrink: 0 }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`, fontSize: 16, fontWeight: 800 }}>6</div>
            <div><div style={{ fontSize: 15, fontWeight: 700 }}>6sense</div><div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Revenue AI</div></div>
          </div>
        </div>
        <nav style={{ padding: "12px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map(n => (
            <button key={n.key} onClick={() => { if (n.key === "revvy") setRevvyOpen(true); else { setSection(n.key); setSignalDetailView(null); setAudienceView(null); } }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, border: "none", width: "100%", textAlign: "left",
              background: section === n.key ? C.accent + "15" : "transparent", color: section === n.key ? C.accent : C.textMuted,
              fontSize: 13, fontWeight: section === n.key ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s"
            }}>
              {n.icon}{n.label}{n.key === "revvy" && <Badge color={C.accent} small>AI</Badge>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.textDim }}>Prototype · Sample Data</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: (section === "accounts" && uiMode === "light") ? L.bg : C.bg }}>
        {/* Header - hidden for accounts light mode (has its own) */}
        {!(section === "accounts" && uiMode === "light") && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: `1px solid ${C.border}`, background: C.bgPanel }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>{nav.find(n => n.key === section)?.label}</h2>
              <Inp value={search} onChange={setSearch} placeholder="Search..." icon={Icons.search} style={{ width: 280 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {section === "signals" && !signalDetailView && <Btn primary small onClick={() => setNewSignal(true)}>{Icons.plus} New Signal</Btn>}
              {section === "audiences" && !audienceView && <Btn primary small onClick={() => setAudienceBuilder(true)}>{Icons.plus} Create Audience</Btn>}
              {section === "workflows" && <Btn primary small onClick={() => setWorkflowBuilder("new")}>{Icons.plus} New Workflow</Btn>}
              <Btn small onClick={() => setRevvyOpen(true)}>{Icons.bot} RevvyAI</Btn>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, overflow: "auto", padding: (section === "accounts" && uiMode === "light") ? 0 : 24 }}>

          {/* ── ACCOUNTS ── */}
          {section === "accounts" && uiMode === "light" && (
            <AccountsView
              accounts={accounts}
              search={search}
              onSearch={setSearch}
              onAccountClick={a => setSelectedAccount(a)}
              onEnrich={() => setEnrichModal(true)}
              extCols={extCols}
              onToggleMode={() => setUiMode("dark")}
            />
          )}
          {section === "accounts" && uiMode === "dark" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <Stat label="Total" value={accounts.length} />
                  <Stat label="High Intent" value={accounts.filter(a => a.intentLevel === "High").length} color={C.green} />
                  <Stat label="1:1 Accounts" value={accounts.filter(a => a.abmTier === "1:1").length} color={C.accent} sub="Named" />
                  <Stat label="Active Signals" value={accounts.reduce((s, a) => s + a.signals.length, 0)} color={C.orange} />
                </div>
                <button onClick={() => setUiMode("light")} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.borderLight}`, background: "transparent", color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Switch to Light View ↗
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", position: "relative", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: C.textMuted }}>Columns:</span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {tableCols.map(c => <Badge key={c} color={C.accent} small>{allCols.find(ac => ac.key === c)?.label || c}<button onClick={() => setTableCols(tableCols.filter(x => x !== c))} style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", padding: 0, marginLeft: 4, fontSize: 12, fontFamily: "inherit" }}>×</button></Badge>)}
                </div>
                <Btn small onClick={() => setAddColOpen(!addColOpen)}>{Icons.plus} Column</Btn>
                <Btn small onClick={() => setEnrichModal(true)}>{Icons.ext} Enrich</Btn>
                {addColOpen && <div style={{ position: "absolute", top: "100%", right: 80, zIndex: 100, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", minWidth: 160 }}>
                  {allCols.filter(c => !tableCols.includes(c.key)).map(c => <div key={c.key} onClick={() => { setTableCols([...tableCols, c.key]); setAddColOpen(false); }} style={{ padding: "6px 12px", fontSize: 12, color: C.text, cursor: "pointer", borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = C.bgHover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{c.label}</div>)}
                </div>}
              </div>
              <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard, maxHeight: "calc(100vh - 300px)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{tableCols.map(col => <TH key={col} onClick={() => toggleSort(col)} active={sortField === col}>{allCols.find(c => c.key === col)?.label || col} {sortField === col && (sortDir === "desc" ? "↓" : "↑")}</TH>)}</tr></thead>
                  <tbody>{filteredAccounts.map(a => <TR key={a.id} onClick={() => setSelectedAccount(a)}>{tableCols.map(col => <TD key={col}>{renderCell(a, col)}</TD>)}</TR>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CONTACTS ── */}
          {section === "contacts" && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                <Stat label="Total" value={contacts.length} />
                <Stat label="Visible" value={contacts.filter(c => !c.isHidden).length} color={C.green} />
                <Stat label="Hidden" value={contacts.filter(c => c.isHidden).length} color={C.orange} sub="Unlock" />
                <Stat label="Buying Group" value={contacts.filter(c => c.isBuyingGroup).length} color={C.purple} />
              </div>
              <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard, maxHeight: "calc(100vh - 300px)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Name","Title","Account","Archetype","Signal Fields","Score","Last Active"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
                  <tbody>{filteredContacts.slice(0, 50).map(c => (
                    <TR key={c.id} onClick={() => setSelectedContact(c)}>
                      <TD><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: "50%", background: C.accent + "20", color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{c.name.split(" ").map(n => n[0]).join("")}</div><div><div style={{ fontWeight: 600, color: C.text }}>{c.name}</div><div style={{ fontSize: 11, color: C.textDim }}>{c.email}</div></div></div></TD>
                      <TD><span style={{ color: C.textMuted }}>{c.title}</span></TD>
                      <TD><span style={{ color: C.textMuted }}>{c.accountName}</span></TD>
                      <TD>{c.archetype ? <Badge color={c.archetype === "Champion" ? C.green : c.archetype === "Detractor" ? C.red : c.archetype === "Economic Buyer" ? C.orange : c.archetype === "Influencer" ? C.purple : C.blue} small>{c.archetype}</Badge> : <span style={{ color: C.textDim }}>—</span>}</TD>
                      <TD><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{Object.keys(c.signalFields || {}).slice(0, 2).map(k => <Badge key={k} color={C.accent} small>{k}</Badge>)}{Object.keys(c.signalFields || {}).length > 2 && <Badge color={C.textDim} small>+{Object.keys(c.signalFields).length - 2}</Badge>}</div></TD>
                      <TD><Score value={c.score} /></TD>
                      <TD><span style={{ color: C.textDim }}>{c.lastActive}</span></TD>
                    </TR>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SIGNALS (list) ── */}
          {section === "signals" && !signalDetailView && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                <Stat label="Configured" value={signalConfigs.length} />
                <Stat label="Events" value={signalEvents.length} color={C.green} />
                <Stat label="Accounts" value={accounts.filter(a => a.signals.length > 0).length} color={C.orange} />
                <Stat label="Contacts (Direct)" value={contacts.filter(c => c.signals.length > 0).length} color={C.purple} />
              </div>
              <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgCard, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>Signal Taxonomy</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 12, color: C.textMuted }}>
                  <div><div style={{ display: "flex", gap: 6, marginBottom: 4 }}><Badge color={C.accent} small>Direct</Badge> vs <Badge color={C.purple} small>Derived</Badge></div>Direct: on entity. Derived: inferred on related entities.</div>
                  <div><div style={{ display: "flex", gap: 6, marginBottom: 4 }}><Badge color={C.orange} small>Event</Badge> vs <Badge color={C.blue} small>Trend</Badge></div>Event: discrete point in time. Trend: change over period.</div>
                  <div><div style={{ display: "flex", gap: 6, marginBottom: 4 }}><Badge color={C.textMuted} small>Qualitative</Badge> vs <Badge color={C.textMuted} small>Quantitative</Badge></div>Qualitative: descriptive. Quantitative: numeric.</div>
                </div>
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                {signalConfigs.map(s => {
                  const events = signalEvents.filter(e => e.signalConfig === s.name.split(" (")[0]);
                  const acctCount = accounts.filter(a => a.signals.some(sig => sig.signalConfig === s.name.split(" (")[0])).length;
                  const contactCount = contacts.filter(c => c.signals.some(sig => sig.signalConfig === s.name.split(" (")[0])).length;
                  return (
                    <div key={s.id} onClick={() => setSignalDetailView(s)} style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgCard, cursor: "pointer", transition: "border-color 0.15s" }} onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + "60"} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{s.name}</span><Badge color={C.green} small>{s.status}</Badge></div>
                        <div style={{ display: "flex", gap: 6 }}><Badge color={s.type === "Direct" ? C.accent : C.purple} small>{s.type}</Badge><Badge color={s.nature === "Event" ? C.orange : C.blue} small>{s.nature}</Badge><Badge color={C.textMuted} small>{s.measure}</Badge></div>
                      </div>
                      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>{s.description}</div>
                      <div style={{ display: "flex", gap: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{events.length}</span><span style={{ fontSize: 12, color: C.textMuted }}>events</span></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 20, fontWeight: 700, color: C.orange }}>{acctCount}</span><span style={{ fontSize: 12, color: C.textMuted }}>accounts</span></div>
                        {contactCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 20, fontWeight: 700, color: C.purple }}>{contactCount}</span><span style={{ fontSize: 12, color: C.textMuted }}>contacts</span></div>}
                        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}><Btn small onClick={e => { e.stopPropagation(); setSignalModal(s); }}>Edit</Btn><Btn small primary onClick={e => { e.stopPropagation(); setSignalDetailView(s); }}>Details {Icons.arrow}</Btn></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SIGNAL DETAIL ── */}
          {section === "signals" && signalDetailView && (() => {
            const cfg = signalDetailView, cfgType = cfg.name.split(" (")[0];
            const events = signalEvents.filter(e => e.signalConfig === cfgType);
            const affAcct = accounts.filter(a => a.signals.some(s => s.signalConfig === cfgType));
            const affCon = contacts.filter(c => c.signals.some(s => s.signalConfig === cfgType));
            const isJC = cfgType === "Job Change";
            return (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <button onClick={() => setSignalDetailView(null)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textMuted, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>← Back</button>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{cfg.name}</h3>
                  <div style={{ display: "flex", gap: 6 }}><Badge color={cfg.type === "Direct" ? C.accent : C.purple}>{cfg.type}</Badge><Badge color={cfg.nature === "Event" ? C.orange : C.blue}>{cfg.nature}</Badge></div>
                </div>
                {isJC && (
                  <div style={{ padding: 20, borderRadius: 8, marginBottom: 20, border: `1px solid ${C.accent}25`, background: `linear-gradient(135deg, ${C.accent}06, ${C.purple}06)` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 10 }}>How Job Change Signals Work</div>
                    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}><Badge color={C.accent}>Direct → Person</Badge><div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>Kim changes jobs. A <b style={{ color: C.accent }}>Direct</b> signal fires on her contact record.</div></div>
                      <div style={{ color: C.textDim, fontSize: 20, paddingTop: 8 }}>→</div>
                      <div style={{ flex: 1 }}><Badge color={C.purple}>Derived → From Account</Badge><div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>LiveRamp gets a <b style={{ color: C.purple }}>Derived</b> signal: "CPO recently departed."</div></div>
                      <div style={{ color: C.textDim, fontSize: 20, paddingTop: 8 }}>→</div>
                      <div style={{ flex: 1 }}><Badge color={C.purple}>Derived → To Account</Badge><div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>6sense gets a <b style={{ color: C.purple }}>Derived</b> signal: "New CPO recently hired."</div></div>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}><Stat label="Events" value={events.length} /><Stat label="Accounts" value={affAcct.length} color={C.orange} />{isJC && <Stat label="Contacts" value={affCon.length} color={C.purple} sub="Direct" />}</div>

                {/* Signal → Audience → Workflow Chain */}
                {(() => {
                  const targetAuds = (cfg.targetAudiences || []).map(name => {
                    const audDef = AUDIENCES_DEFAULT.find(a => a.name === name);
                    const memberCount = accounts.filter(a => a.audiences.some(au => au.name === name)).length;
                    return { name, def: audDef, memberCount };
                  });
                  const targetWfs = (cfg.targetWorkflows || []).map(wid => WORKFLOWS_DEFAULT.find(w => w.id === wid)).filter(Boolean);
                  // Also find workflows triggered by audiences fed by this signal
                  const audWfs = targetAuds.flatMap(a => (a.def?.usedByWorkflows || []).map(wid => WORKFLOWS_DEFAULT.find(w => w.id === wid)).filter(Boolean));
                  const allWfs = [...new Map([...targetWfs, ...audWfs].map(w => [w.id, w])).values()];

                  if (targetAuds.length === 0 && allWfs.length === 0) return null;
                  return (
                    <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.accent}20`, background: `linear-gradient(135deg, ${C.accent}04, ${C.purple}04)`, marginBottom: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 16 }}>Signal → Audience → Workflow Chain</div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        {/* Signal */}
                        <div style={{ padding: "10px 16px", borderRadius: 8, border: `2px solid ${C.orange}60`, background: C.orange + "10", minWidth: 140, textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: C.orange, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Signal</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{cfg.name.split(" (")[0]}</div>
                          <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{events.length} events fired</div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 12, color: C.textDim }}>→</div>

                        {/* Audiences */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {targetAuds.map((a, i) => (
                            <div key={i} style={{ padding: "10px 16px", borderRadius: 8, border: `2px solid ${C.purple}60`, background: C.purple + "10", minWidth: 160, cursor: "pointer" }}
                              onClick={() => { const audDef = AUDIENCES_DEFAULT.find(x => x.name === a.name); if (audDef) setAudienceView(audDef); setSection("audiences"); }}>
                              <div style={{ fontSize: 10, color: C.purple, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                                {a.def?.type || "Iterative"} Audience
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{a.name}</div>
                              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{a.memberCount} members</div>
                            </div>
                          ))}
                        </div>

                        {allWfs.length > 0 && <>
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 12, color: C.textDim }}>→</div>

                          {/* Workflows */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {allWfs.map((w, i) => (
                              <div key={i} style={{ padding: "10px 16px", borderRadius: 8, border: `2px solid ${C.green}60`, background: C.green + "10", minWidth: 180, cursor: "pointer" }}
                                onClick={() => { setWorkflowBuilder(w.id.toLowerCase().replace("wf-00", "wf")); }}>
                                <div style={{ fontSize: 10, color: C.green, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Workflow</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{w.name}</div>
                                <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{w.status} · {w.runs} runs</div>
                              </div>
                            ))}
                          </div>
                        </>}
                      </div>
                    </div>
                  );
                })()}

                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Event Ledger</h4>
                <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
                  {events.map(evt => (
                    <div key={evt.id} style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgCard }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 11, color: C.textDim, fontFamily: "monospace" }}>{evt.id}</span><span style={{ fontSize: 12, color: C.textDim }}>{evt.date}</span><Badge color={evt.status === "Active" ? C.green : C.textMuted} small>{evt.status}</Badge></div>
                      </div>
                      {isJC ? (
                        <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
                          <div onClick={() => { const co = contacts.find(x => x.id === evt.personId); if (co) setSelectedContact(co); }} style={{ flex: 1, padding: 12, borderRadius: 8, cursor: "pointer", border: `2px solid ${C.accent}40`, background: C.accent + "08" }}>
                            <Badge color={C.accent} small>Direct · Person</Badge>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 6 }}>{evt.personName}</div>
                            <div style={{ fontSize: 11, color: C.textMuted }}>{evt.personTitle}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}><div style={{ fontSize: 16, color: C.red }}>←</div></div>
                          <div onClick={() => { const ac = accounts.find(x => x.id === evt.fromAccountId); if (ac) setSelectedAccount(ac); }} style={{ flex: 1, padding: 12, borderRadius: 8, cursor: "pointer", border: `2px solid ${C.purple}40`, background: C.purple + "08" }}>
                            <Badge color={C.purple} small>Derived · Departure</Badge>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 6 }}>{evt.fromAccountName}</div>
                            <div style={{ fontSize: 11, color: C.textMuted }}>Former: {evt.fromTitle}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}><div style={{ fontSize: 16, color: C.green }}>→</div></div>
                          <div onClick={() => { const ac = accounts.find(x => x.id === evt.toAccountId); if (ac) setSelectedAccount(ac); }} style={{ flex: 1, padding: 12, borderRadius: 8, cursor: "pointer", border: `2px solid ${C.purple}40`, background: C.purple + "08" }}>
                            <Badge color={C.purple} small>Derived · Incoming</Badge>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 6 }}>{evt.toAccountName}</div>
                            <div style={{ fontSize: 11, color: C.textMuted }}>New: {evt.personTitle}</div>
                          </div>
                        </div>
                      ) : (
                        <div onClick={() => { const ac = accounts.find(x => x.id === evt.toAccountId); if (ac) setSelectedAccount(ac); }} style={{ padding: 12, borderRadius: 8, cursor: "pointer", border: `2px solid ${C.accent}40`, background: C.accent + "08" }}>
                          <Badge color={C.accent} small>Account</Badge><span style={{ fontSize: 14, fontWeight: 600, color: C.text, marginLeft: 8 }}>{evt.toAccountName}</span>
                          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{evt.detail}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  {events.length === 0 && <EmptyState text="No events fired yet." />}
                </div>

                {/* Associated Accounts Table */}
                {affAcct.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Associated Accounts ({affAcct.length})</h4>
                    <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard, maxHeight: 260 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><TH>Account</TH><TH>Signal Detail</TH><TH>Type</TH><TH>Direction</TH><TH>Date</TH><TH>Status</TH></tr></thead>
                        <tbody>
                          {affAcct.map(a => {
                            const sigs = a.signals.filter(s => s.signalConfig === cfgType);
                            return sigs.map((sig, si) => (
                              <TR key={`${a.id}-${si}`} onClick={() => setSelectedAccount(a)}>
                                <TD><span style={{ fontWeight: 600, color: C.text }}>{a.name}</span></TD>
                                <TD><span style={{ color: C.textMuted, maxWidth: 220, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sig.detail}</span></TD>
                                <TD><Badge color={sig.subtype === "Direct" ? C.accent : C.purple} small>{sig.subtype}</Badge></TD>
                                <TD>{sig.direction ? <Badge color={sig.direction === "Incoming" ? C.green : C.red} small>{sig.direction}</Badge> : <span style={{ color: C.textDim }}>—</span>}</TD>
                                <TD><span style={{ color: C.textDim }}>{sig.detectedDate}</span></TD>
                                <TD><Badge color={sig.status === "Active" ? C.green : C.textMuted} small>{sig.status}</Badge></TD>
                              </TR>
                            ));
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Associated Contacts Table (job change) */}
                {isJC && affCon.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Associated Contacts — Direct Signals ({affCon.length})</h4>
                    <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard, maxHeight: 260 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr><TH>Contact</TH><TH>Title</TH><TH>Account</TH><TH>Signal Detail</TH><TH>Date</TH></tr></thead>
                        <tbody>
                          {affCon.map(c => {
                            const sig = c.signals.find(s => s.signalConfig === cfgType);
                            return (
                              <TR key={c.id} onClick={() => setSelectedContact(c)}>
                                <TD><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 24, height: 24, borderRadius: "50%", background: C.accent + "20", color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{c.name.split(" ").map(n => n[0]).join("")}</div><span style={{ fontWeight: 600, color: C.text }}>{c.name}</span><Badge color={C.accent} small>Direct</Badge></div></TD>
                                <TD><span style={{ color: C.textMuted }}>{c.title}</span></TD>
                                <TD><span style={{ color: C.textMuted }}>{c.accountName}</span></TD>
                                <TD><span style={{ color: C.textMuted, maxWidth: 220, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sig?.detail}</span></TD>
                                <TD><span style={{ color: C.textDim }}>{sig?.detectedDate}</span></TD>
                              </TR>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── ACTIVITIES (global feed) ── */}
          {section === "activities" && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                <Stat label="Total" value={allActivities.length} />
                <Stat label="Signal Fires" value={allActivities.filter(a => a.type.includes("Signal")).length} color={C.orange} />
                <Stat label="Email" value={allActivities.filter(a => a.type.includes("Email")).length} color={C.blue} />
                <Stat label="Syncs" value={allActivities.filter(a => a.type.includes("Sync")).length} color={C.purple} />
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                {["All", ...new Set(allActivities.map(a => a.type))].map(t => (
                  <button key={t} onClick={() => setActivityFilter(t)} style={{
                    padding: "4px 12px", borderRadius: 20, border: `1px solid ${activityFilter === t ? C.accent : C.border}`,
                    background: activityFilter === t ? C.accent + "15" : "transparent",
                    color: activityFilter === t ? C.accent : C.textMuted,
                    fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                  }}>{t}</button>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: C.textDim }}>From:</span>
                  <input type="date" value={actDateFrom} onChange={e => setActDateFrom(e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgPanel, color: C.text, fontSize: 11, fontFamily: "inherit", outline: "none" }} />
                  <span style={{ fontSize: 11, color: C.textDim }}>To:</span>
                  <input type="date" value={actDateTo} onChange={e => setActDateTo(e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgPanel, color: C.text, fontSize: 11, fontFamily: "inherit", outline: "none" }} />
                  {(actDateFrom || actDateTo) && <button onClick={() => { setActDateFrom(""); setActDateTo(""); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Clear</button>}
                </div>
              </div>
              <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard, maxHeight: "calc(100vh - 340px)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr><TH>Date</TH><TH>Time</TH><TH>Type</TH><TH>Detail</TH><TH>Entity</TH><TH>Kind</TH></tr></thead>
                  <tbody>{filteredActivities.slice(0, 100).map(a => (
                    <TR key={a.id} onClick={() => {
                      if (a.entityType === "account") { const ac = accounts.find(x => x.id === a.entityId); if (ac) setSelectedAccount(ac); }
                      else { const co = contacts.find(x => x.id === a.entityId); if (co) setSelectedContact(co); }
                    }}>
                      <TD><span style={{ color: C.textDim }}>{a.date}</span></TD>
                      <TD><span style={{ color: C.textDim }}>{a.time}</span></TD>
                      <TD><Badge color={actColor(a.type)} small>{a.type}</Badge></TD>
                      <TD><span style={{ color: C.textMuted, maxWidth: 400, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.detail}</span></TD>
                      <TD><span style={{ color: C.text, fontWeight: 600 }}>{a.entityName}</span></TD>
                      <TD><Badge color={a.entityType === "account" ? C.blue : C.purple} small>{a.entityType}</Badge></TD>
                    </TR>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── AUDIENCES ── */}
          {section === "audiences" && !audienceView && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                <Stat label="Audiences" value={AUDIENCES_DEFAULT.length} />
                <Stat label="Dynamic" value={AUDIENCES_DEFAULT.filter(a => a.type === "Dynamic").length} color={C.accent} />
                <Stat label="Static" value={AUDIENCES_DEFAULT.filter(a => a.type === "Static").length} color={C.textMuted} />
                <Stat label="Iterative" value={AUDIENCES_DEFAULT.filter(a => a.type === "Iterative").length} color={C.purple} />
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                {AUDIENCES_DEFAULT.map((a, i) => {
                  const count = accounts.filter(ac => ac.audiences.some(au => au.name === a.name)).length;
                  const srcSignals = (a.sourceSignals || []).map(sid => SIGNAL_CONFIGS_DEFAULT.find(s => s.id === sid)).filter(Boolean);
                  const usedWfs = (a.usedByWorkflows || []).map(wid => WORKFLOWS_DEFAULT.find(w => w.id === wid)).filter(Boolean);
                  return (
                    <div key={i} style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgCard }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{a.name}</span><Badge color={a.type === "Dynamic" ? C.accent : a.type === "Iterative" ? C.purple : C.textMuted} small>{a.type}</Badge></div>
                        <span style={{ fontSize: 24, fontWeight: 700, color: C.accent }}>{count}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>Criteria: {a.criteria}</div>
                      {srcSignals.length > 0 && (
                        <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: C.textDim }}>Fed by:</span>
                          {srcSignals.map(s => <Badge key={s.id} color={C.orange} small>{s.name.split(" (")[0]}</Badge>)}
                        </div>
                      )}
                      {usedWfs.length > 0 && (
                        <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: C.textDim }}>Used by:</span>
                          {usedWfs.map(w => <Badge key={w.id} color={C.green} small>{w.name}</Badge>)}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 6 }}>Updated: {a.lastUpdated}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <Btn small onClick={() => setAudienceView(a)}>View Members</Btn><Btn small>Edit</Btn><Btn small>Export</Btn>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── AUDIENCE MEMBER VIEW ── */}
          {section === "audiences" && audienceView && (() => {
            const members = accounts.filter(a => a.audiences.some(au => au.name === audienceView.name));
            const allAudCols = [
              { key: "name", label: "Account" },{ key: "industry", label: "Industry" },{ key: "abmTier", label: "ABM Tier" },
              { key: "intentLevel", label: "Intent" },{ key: "sixsenseScore", label: "6sense Score" },{ key: "stage", label: "Stage" },
              { key: "joinedDate", label: "Joined Date" },{ key: "lastActivity", label: "Last Activity" },{ key: "buyingGroupCoverage", label: "BG Coverage" },
              ...extCols.map(ec => ({ key: ec.key, label: `${ec.key} (${ec.source})`, external: true }))
            ];
            // Build membership log with joined + removed events
            const membershipLog = [];
            members.forEach(a => {
              const aud = a.audiences.find(au => au.name === audienceView.name);
              if (aud) membershipLog.push({ date: aud.joinedDate, action: "Joined", name: a.name, reason: "met criteria" });
            });
            // For Dynamic audiences, add some simulated "removed" events
            if (audienceView.type === "Dynamic") {
              const nonMembers = accounts.filter(a => !a.audiences.some(au => au.name === audienceView.name)).slice(0, 4);
              nonMembers.forEach(a => {
                membershipLog.push({ date: randDate(90), action: "Removed", name: a.name, reason: "criteria no longer met" });
              });
            }
            membershipLog.sort((a, b) => b.date.localeCompare(a.date));
            return (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <button onClick={() => setAudienceView(null)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textMuted, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>← Back</button>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{audienceView.name}</h3>
                  <Badge color={audienceView.type === "Dynamic" ? C.accent : audienceView.type === "Iterative" ? C.purple : C.textMuted}>{audienceView.type}</Badge>
                  <span style={{ fontSize: 13, color: C.textMuted }}>{members.length} members</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", position: "relative", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>Columns:</span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {audTableCols.map(c => <Badge key={c} color={C.accent} small>{allAudCols.find(ac => ac.key === c)?.label || c}<button onClick={() => setAudTableCols(audTableCols.filter(x => x !== c))} style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", padding: 0, marginLeft: 4, fontSize: 12, fontFamily: "inherit" }}>×</button></Badge>)}
                  </div>
                  <Btn small onClick={() => setAudAddCol(!audAddCol)}>{Icons.plus} Column</Btn>
                  <Btn small onClick={() => setEnrichModal(true)}>{Icons.ext} Enrich from System</Btn>
                  {audAddCol && <div style={{ position: "absolute", top: "100%", right: 120, zIndex: 100, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", minWidth: 160 }}>
                    {allAudCols.filter(c => !audTableCols.includes(c.key)).map(c => <div key={c.key} onClick={() => { setAudTableCols([...audTableCols, c.key]); setAudAddCol(false); }} style={{ padding: "6px 12px", fontSize: 12, color: C.text, cursor: "pointer", borderRadius: 4 }} onMouseEnter={e => e.currentTarget.style.background = C.bgHover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{c.label}</div>)}
                  </div>}
                </div>
                <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard, maxHeight: "calc(100vh - 340px)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{audTableCols.map(col => <TH key={col}>{allAudCols.find(c => c.key === col)?.label || col}</TH>)}</tr></thead>
                    <tbody>{members.map(a => <TR key={a.id} onClick={() => setSelectedAccount(a)}>{audTableCols.map(col => <TD key={col}>{renderCell(a, col)}</TD>)}</TR>)}</tbody>
                  </table>
                </div>
                <div style={{ marginTop: 16, padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel }}>
                  <SectionLabel>Membership Log {audienceView.type === "Dynamic" && <span style={{ color: C.textDim, fontWeight: 400 }}>(accounts can be added and removed)</span>}</SectionLabel>
                  <div style={{ display: "grid", gap: 4 }}>
                    {membershipLog.slice(0, 12).map((entry, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, fontSize: 12, alignItems: "center" }}>
                        <span style={{ color: C.textDim, minWidth: 80 }}>{entry.date}</span>
                        <Badge color={entry.action === "Joined" ? C.green : C.red} small>{entry.action}</Badge>
                        <span style={{ color: C.text }}>{entry.name}</span>
                        <span style={{ color: C.textDim }}>{entry.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── CONTENT ── */}
          {section === "content" && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                <Stat label="Content" value={CONTENT_ITEMS.length} />
                <Stat label="Types" value={[...new Set(CONTENT_ITEMS.map(c => c.type))].length} color={C.purple} />
                <Stat label="Total Engagements" value={CONTENT_ITEMS.reduce((s, c) => s + (c.engagements?.length || 0), 0)} color={C.green} />
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {CONTENT_ITEMS.map(ct => (
                  <div key={ct.id} onClick={() => setSelectedContent(ct)} style={{
                    display: "flex", gap: 16, padding: 16, borderRadius: 8, border: `1px solid ${C.border}`,
                    background: C.bgCard, alignItems: "center", cursor: "pointer", transition: "border-color 0.15s"
                  }} onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + "40"} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: C.accent + "15", display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, flexShrink: 0 }}>{Icons.content}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{ct.title}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Badge color={C.blue} small>{ct.type}</Badge>
                        {ct.tags.slice(0, 2).map((t, i) => <Badge key={i} color={C.purple} small>{t}</Badge>)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ct.views} views</div>
                      <div style={{ fontSize: 12, color: C.accent }}>{ct.engagements?.length || 0} contacts · {ct.accountsEngaged?.length || 0} accounts</div>
                      <div style={{ fontSize: 11, color: C.textDim }}>First: {ct.firstTouch}% · Last: {ct.lastTouch}% · Multi: {ct.multiTouch}x</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── WORKFLOWS ── */}
          {section === "workflows" && (
            <div style={{ display: "grid", gap: 16 }}>
              {[
                { id: "wf1", name: "High-Intent → AI Email → Sales Alert", status: "Active", trigger: "Signal: Intent Score > 70", actions: 4, lastRun: "2026-03-16", runs: 234 },
                { id: "wf2", name: "New Champion → Buying Group Enrichment", status: "Active", trigger: "Signal: Job Change (Champion)", actions: 3, lastRun: "2026-03-15", runs: 47 },
                { id: "wf3", name: "AI Hiring → ABM Campaign", status: "Paused", trigger: "Signal: Hiring Trend (AI Engineers)", actions: 5, lastRun: "2026-03-10", runs: 89 },
              ].map((w, i) => (
                <div key={i} onClick={() => setWorkflowBuilder(w.id)} style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgCard, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + "40"} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{w.name}</span>
                    <Badge color={w.status === "Active" ? C.green : C.orange} small>{w.status}</Badge>
                  </div>
                  <div style={{ display: "flex", gap: 24, fontSize: 12, color: C.textMuted }}><span>Trigger: {w.trigger}</span><span>{w.actions} actions</span><span>{w.runs} runs</span><span>Last: {w.lastRun}</span></div>
                </div>
              ))}
            </div>
          )}

          {/* ── INTELLIGENCE GRAPH ── */}
          {section === "graph" && (
            <IntelligenceView
              accounts={accounts}
              contacts={contacts}
              signalEvents={signalEvents}
              allActivities={allActivities}
              onAccountClick={a => setSelectedAccount(a)}
              onContactClick={c => setSelectedContact(c)}
            />
          )}

        </div>
      </div>

      {/* Modals */}
      {selectedAccount && <AccountDetail account={selectedAccount} contacts={contacts} allActivities={allActivities} onClose={() => setSelectedAccount(null)} onContactClick={c => { setSelectedAccount(null); setSelectedContact(c); }} onContentClick={ct => { setSelectedAccount(null); setSelectedContent(ct); }} />}
      {selectedContact && <ContactDetail contact={selectedContact} allActivities={allActivities} onClose={() => setSelectedContact(null)} onAccountClick={accId => { const a = accounts.find(x => x.id === accId); if (a) { setSelectedContact(null); setSelectedAccount(a); }}} onContentClick={ct => { setSelectedContact(null); setSelectedContent(ct); }} />}
      {selectedContent && <ContentDetail content={selectedContent} contacts={contacts} accounts={accounts} onClose={() => setSelectedContent(null)} onAccountClick={a => { setSelectedContent(null); setSelectedAccount(a); }} onContactClick={c => { setSelectedContent(null); setSelectedContact(c); }} />}
      {signalModal && <SignalConfigModal signal={signalModal} onClose={() => setSignalModal(null)} onSave={() => setSignalModal(null)} />}
      {newSignal && <SignalConfigModal isNew onClose={() => setNewSignal(false)} onSave={(config) => { setSignalConfigs([...signalConfigs, { id: `SIG-${signalConfigs.length + 1}`, ...config, status: "Active" }]); setNewSignal(false); }} />}
      {audienceBuilder && <AudienceBuilder onClose={() => setAudienceBuilder(false)} accounts={accounts} />}
      {enrichModal && <EnrichModal onClose={() => setEnrichModal(false)} onAdd={cols => { setExtCols(prev => [...prev, ...cols.filter(c => !prev.some(p => p.key === c.key))]); }} />}
      {workflowBuilder && <WorkflowBuilder workflowId={workflowBuilder} onClose={() => setWorkflowBuilder(false)} />}
      {revvyOpen && <RevvyAI onClose={() => setRevvyOpen(false)} accounts={accounts} contacts={contacts} />}
    </div>
  );
}
