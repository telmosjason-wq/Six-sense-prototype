import React, { useState, useEffect } from 'react';
import { C } from '../components/ui/theme';
import { Badge, Btn, Tab, Modal, Stat, Score, SectionLabel, FieldGrid, SignalFieldsPanel, EmptyState } from '../components/ui';
import { Icons } from '../components/Icons';
import { CONTENT_ITEMS } from '../data/constants';

export default function AccountDetail({ account: a, contacts, allActivities, onClose, onContactClick, onContentClick, demoTab }) {
  const [tab, setTab] = useState(demoTab || "overview");
  // Respond to demoTab changes
  useEffect(() => { if (demoTab) setTab(demoTab); }, [demoTab]);
  const ac = contacts.filter(c => c.accountId === a.id);
  const bg = ac.filter(c => c.isBuyingGroup);
  const acActs = allActivities.filter(x => x.entityId === a.id || ac.some(c => c.id === x.entityId));
  // Derive content history from contacts' content consumption
  const contentHistory = [];
  const seenContent = new Set();
  ac.forEach(c => {
    (c.contentConsumed || []).forEach(cc => {
      const ct = (typeof CONTENT_ITEMS !== 'undefined' ? CONTENT_ITEMS : []).find(x => x.id === cc.contentId);
      if (ct) {
        contentHistory.push({ ...cc, contentTitle: ct.title, contentType: ct.type, contactName: c.name, contactId: c.id, content: ct });
        seenContent.add(ct.id);
      }
    });
  });
  contentHistory.sort((a, b) => b.date.localeCompare(a.date));
  const tabs = ["overview","contacts","signals","content","activities","audiences","intelligence"];

  return (
    <Modal title={a.name} onClose={onClose} wide>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => <Tab key={t} active={tab === t} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</Tab>)}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <SectionLabel>Firmographic</SectionLabel>
            <FieldGrid data={[["Industry", a.industry],["Size", a.size],["Revenue", a.revenue],["Location", a.location],["Domain", a.domain]]} />
            <div style={{ marginTop: 16 }}>
              <SectionLabel>ABM Tier</SectionLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Badge color={a.abmTier === "1:1" ? C.accent : a.abmTier === "1:Few" ? C.purple : C.textMuted}>{a.abmTier}</Badge>
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Strategy: {a.abmStrategy}</div>
              <div style={{ fontSize: 12, color: C.textDim }}>Budget: {a.abmBudget}</div>
            </div>
            <div style={{ marginTop: 16 }}>
              <SectionLabel>Technographic</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {a.techStack.map(t => <Badge key={t} color={C.purple} small>{t}</Badge>)}
              </div>
            </div>
          </div>
          <div>
            <SectionLabel>Scoring</SectionLabel>
            <div style={{ display: "grid", gap: 12 }}>
              {[["6sense Score", a.sixsenseScore],["Intent Score", a.intentScore],["BG Coverage", a.buyingGroupCoverage]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{l}</div><Score value={v} /></div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Badge color={C.blue}>{a.stage}</Badge>
              <Badge color={a.intentLevel === "High" ? C.green : a.intentLevel === "Medium" ? C.orange : C.red}>{a.intentLevel} Intent</Badge>
            </div>
            <div style={{ marginTop: 16 }}>
              <SectionLabel>Keyword Research</SectionLabel>
              {a.keywordActivity.slice(0, 4).map((k, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
                  <span style={{ color: C.text }}>{k.keyword}</span>
                  <Badge color={k.trend === "Rising" ? C.green : k.trend === "Declining" ? C.red : C.textMuted} small>{k.trend}</Badge>
                </div>
              ))}
            </div>
            <SignalFieldsPanel fields={a.signalFields} />
          </div>
        </div>
      )}

      {tab === "contacts" && (
        <div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>
            {bg.length} buying group members · {ac.filter(c => c.isHidden).length} locked contacts
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {ac.map(c => (
              <div key={c.id}
                onClick={() => !c.isHidden && onContactClick(c)}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "12px 16px",
                  borderRadius: 8, border: `1px solid ${C.border}`,
                  background: c.isHidden ? C.bgPanel : C.bgCard,
                  cursor: c.isHidden ? "default" : "pointer",
                  opacity: c.isHidden ? 0.6 : 1
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: c.isHidden ? C.border : c.archetype === "Champion" ? C.green + "30" : c.archetype === "Detractor" ? C.red + "30" : C.accent + "20",
                  color: c.isHidden ? C.textDim : c.archetype === "Champion" ? C.green : c.archetype === "Detractor" ? C.red : C.accent,
                  fontSize: 14, fontWeight: 700
                }}>
                  {c.isHidden ? Icons.lock : c.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.isHidden ? C.textDim : C.text }}>{c.isHidden ? "Contact Hidden" : c.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{c.isHidden ? "Unlock to reveal" : c.title}</div>
                </div>
                {c.archetype && <Badge color={
                  c.archetype === "Champion" ? C.green : c.archetype === "Detractor" ? C.red :
                  c.archetype === "Economic Buyer" ? C.orange : c.archetype === "Influencer" ? C.purple : C.blue
                } small>{c.archetype}</Badge>}
                {Object.keys(c.signalFields || {}).length > 0 && <Badge color={C.accent} small>Signals</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "signals" && (
        <div style={{ display: "grid", gap: 12 }}>
          {a.signals.length === 0 && <EmptyState text="No active signals on this account" />}
          {a.signals.map((s, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.type}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <Badge color={s.subtype === "Direct" ? C.accent : C.purple} small>{s.subtype}</Badge>
                  <Badge color={s.nature === "Event" ? C.orange : C.blue} small>{s.nature}</Badge>
                  {s.direction && <Badge color={s.direction === "Incoming" ? C.green : C.red} small>{s.direction}</Badge>}
                  <Badge color={s.status === "Active" ? C.green : C.textMuted} small>{s.status}</Badge>
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 6 }}>{s.detail}</div>
              <div style={{ fontSize: 11, color: C.textDim }}>Detected: {s.detectedDate} {s.confidence && `· Confidence: ${s.confidence}%`}</div>
              {s.trendData && (
                <div style={{ display: "flex", gap: 4, marginTop: 12, alignItems: "flex-end", height: 40 }}>
                  {s.trendData.map((d, j) => (
                    <div key={j} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", height: d.value * 2, background: C.accent + "40", borderRadius: 2 }} />
                      <span style={{ fontSize: 9, color: C.textDim }}>{d.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "content" && (
        <div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>
            {contentHistory.length} content interactions across {seenContent.size} unique pieces
          </div>
          {contentHistory.length === 0 && <EmptyState text="No content engagement from contacts at this account" />}
          <div style={{ display: "grid", gap: 8 }}>
            {contentHistory.map((ch, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, padding: "10px 14px", borderRadius: 6,
                border: `1px solid ${C.border}`, fontSize: 12, alignItems: "center",
                cursor: onContentClick ? "pointer" : "default"
              }}
                onClick={() => onContentClick && onContentClick(ch.content)}
                onMouseEnter={e => { if (onContentClick) e.currentTarget.style.background = C.bgHover; }}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ color: C.textDim, minWidth: 80 }}>{ch.date}</span>
                <Badge color={C.blue} small>{ch.type}</Badge>
                <span style={{ color: onContentClick ? C.accent : C.text, flex: 1, fontWeight: 500 }}>{ch.contentTitle}</span>
                <Badge color={C.purple} small>{ch.contentType}</Badge>
                <span style={{ color: C.textDim, fontSize: 11 }}>{ch.contactName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "activities" && (
        <div style={{ display: "grid", gap: 6 }}>
          {acActs.length === 0 && <EmptyState text="No activities" />}
          {acActs.slice(0, 40).map((act, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, alignItems: "center" }}>
              <span style={{ color: C.textDim, minWidth: 80 }}>{act.date}</span>
              <span style={{ color: C.textDim, minWidth: 40 }}>{act.time}</span>
              <Badge color={
                act.type.includes("Signal") ? C.orange : act.type.includes("Email") ? C.blue :
                act.type.includes("Sync") ? C.purple : act.type.includes("Ad") ? C.pink :
                act.type.includes("Agent") ? C.accent : C.textMuted
              } small>{act.type}</Badge>
              <span style={{ color: C.textMuted, flex: 1 }}>{act.detail}</span>
              <span style={{ color: C.textDim, fontSize: 11 }}>{act.entityName}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "audiences" && (
        <div style={{ display: "grid", gap: 8 }}>
          {a.audiences.length === 0 && <EmptyState text="Not a member of any audiences" />}
          {a.audiences.map((au, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 16px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ color: C.text, fontWeight: 600, flex: 1 }}>{au.name}</span>
              <Badge color={au.type === "Dynamic" ? C.accent : au.type === "Iterative" ? C.purple : C.textMuted} small>{au.type}</Badge>
              <Badge color={au.status === "Active" ? C.green : C.textMuted} small>{au.status}</Badge>
              <span style={{ color: C.textDim }}>{au.joinedDate}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "intelligence" && (
        <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.accent}30`, background: `linear-gradient(135deg, ${C.accent}08, ${C.purple}08)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ color: C.accent }}>{Icons.spark}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>Contextual Intelligence Graph</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 6, background: C.bgCard, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>Buying Group Insight</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                {bg.filter(c => !c.isHidden).length} of 5 buying group members identified.
                {a.buyingGroupCoverage < 60 && " Recommend unlocking remaining contacts."}
                {bg.some(c => c.archetype === "Champion") && " Champion identified — prioritize engagement."}
              </div>
            </div>
            {a.signals.length > 0 && (
              <div style={{ padding: 12, borderRadius: 6, background: C.bgCard, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>Signal Convergence</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>
                  {a.signals.length} active signal{a.signals.length > 1 ? "s" : ""}.
                  {a.signals.some(s => s.type === "Hiring Trend") && " AI hiring suggests expansion — target technical decision-makers."}
                  {a.signals.some(s => s.type === "Funding Event") && " Recent funding indicates budget availability."}
                </div>
              </div>
            )}
            <div style={{ padding: 12, borderRadius: 6, background: C.bgCard, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>Recommended Actions</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                1. {a.stage === "Awareness" ? "Move to consideration with targeted content campaign" : "Accelerate deal velocity with multi-threaded engagement"}<br/>
                2. {a.buyingGroupCoverage < 80 ? "Unlock additional buying group contacts" : "Engage detractor to mitigate risk"}<br/>
                3. Add to {a.intentLevel === "High" ? "'High-Intent Pipeline' workflow" : "'Nurture to Intent' sequence"}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
