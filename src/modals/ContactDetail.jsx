import React, { useState } from 'react';
import { C } from '../components/ui/theme';
import { Badge, Btn, Tab, Modal, Score, SectionLabel, FieldGrid, SignalFieldsPanel, EmptyState } from '../components/ui';
import { Icons } from '../components/Icons';
import { CONTENT_ITEMS } from '../data/constants';

export default function ContactDetail({ contact: c, allActivities, onClose, onAccountClick, onContentClick }) {
  const [tab, setTab] = useState("overview");
  const cActs = allActivities.filter(a => a.entityId === c.id);
  const tabs = ["overview","activities","signals","buying group","intelligence"];

  return (
    <Modal title={c.name} onClose={onClose} wide>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => <Tab key={t} active={tab === t} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</Tab>)}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <SectionLabel>Contact Info</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "8px 16px", fontSize: 13 }}>
              <span style={{ color: C.textMuted }}>Title</span>
              <span style={{ color: C.text }}>{c.title}</span>
              <span style={{ color: C.textMuted }}>Email</span>
              <span style={{ color: C.text, wordBreak: "break-all" }}>{c.email}</span>
              <span style={{ color: C.textMuted }}>Phone</span>
              <span style={{ color: C.text }}>{c.phone}</span>
              <span style={{ color: C.textMuted }}>LinkedIn</span>
              <a href={`https://${c.linkedin}`} target="_blank" rel="noopener noreferrer"
                style={{ color: C.accent, textDecoration: "none", wordBreak: "break-all" }}
                onClick={e => e.stopPropagation()}>
                {c.linkedin} ↗
              </a>
              <span style={{ color: C.textMuted }}>Account</span>
              {onAccountClick ? (
                <span style={{ color: C.accent, cursor: "pointer" }}
                  onClick={() => onAccountClick(c.accountId)}>
                  {c.accountName} →
                </span>
              ) : (
                <span style={{ color: C.text }}>{c.accountName}</span>
              )}
            </div>
            <div style={{ marginTop: 12 }}><Score value={c.score} /></div>
            <SignalFieldsPanel fields={c.signalFields} />
          </div>
          <div>
            <SectionLabel>Role History</SectionLabel>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 8 }}>
              {c.title} at {c.accountName} <Badge color={C.green} small>Current</Badge>
            </div>
            {c.formerCompanies.map((fc, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.bgPanel, cursor: onAccountClick ? "pointer" : "default"
              }} onClick={() => onAccountClick && onAccountClick(fc.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.text }}>{fc.title} at <span style={{ color: C.accent }}>{fc.name}</span></div>
                  <div style={{ fontSize: 11, color: C.textDim }}>{fc.from} — {fc.to}</div>
                </div>
                {onAccountClick && <span style={{ color: C.accent, fontSize: 11 }}>→</span>}
              </div>
            ))}
            {c.formerCompanies.length === 0 && <div style={{ fontSize: 12, color: C.textDim }}>No prior companies tracked</div>}

            <div style={{ marginTop: 16 }}>
              <SectionLabel>Content Consumed</SectionLabel>
              {c.contentConsumed && c.contentConsumed.length > 0 ? c.contentConsumed.map((cc, i) => {
                const ct = CONTENT_ITEMS.find(x => x.id === cc.contentId);
                return (
                  <div key={i} style={{
                    display: "flex", gap: 8, alignItems: "center", marginBottom: 6,
                    padding: "4px 8px", borderRadius: 4,
                    cursor: onContentClick && ct ? "pointer" : "default"
                  }} onClick={() => onContentClick && ct && onContentClick(ct)}
                    onMouseEnter={e => { if (onContentClick && ct) e.currentTarget.style.background = C.bgHover; }}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Badge color={C.blue} small>{cc.type}</Badge>
                    <span style={{ fontSize: 12, color: onContentClick && ct ? C.accent : C.text }}>{ct?.title || cc.contentId}</span>
                    <span style={{ fontSize: 11, color: C.textDim, marginLeft: "auto" }}>{cc.date}</span>
                  </div>
                );
              }) : <div style={{ fontSize: 12, color: C.textDim }}>No content consumption tracked</div>}
            </div>

            <div style={{ marginTop: 16 }}>
              <SectionLabel>Audiences</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {c.audiences.map((a, i) => <Badge key={i} color={C.accent} small>{a.name}</Badge>)}
                {c.audiences.length === 0 && <span style={{ fontSize: 12, color: C.textDim }}>No audience memberships</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "activities" && (
        <div style={{ display: "grid", gap: 6 }}>
          {cActs.length === 0 && <EmptyState text="No activities" />}
          {cActs.map((act, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, alignItems: "center" }}>
              <span style={{ color: C.textDim, minWidth: 80 }}>{act.date}</span>
              <span style={{ color: C.textDim, minWidth: 40 }}>{act.time}</span>
              <Badge color={act.type.includes("Signal") ? C.orange : act.type.includes("Email") ? C.blue : C.textMuted} small>{act.type}</Badge>
              <span style={{ color: C.textMuted, flex: 1 }}>{act.detail}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "signals" && (
        <div style={{ display: "grid", gap: 8 }}>
          {c.signals.length === 0 && <EmptyState text="No signals on this contact" />}
          {c.signals.map((s, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.type}</span>
                <Badge color={s.subtype === "Direct" ? C.accent : C.purple} small>{s.subtype}</Badge>
              </div>
              <div style={{ fontSize: 13, color: C.textMuted }}>{s.detail}</div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 6 }}>Detected: {s.detectedDate}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "buying group" && (
        c.isBuyingGroup ? (
          <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <Badge color={
                c.archetype === "Champion" ? C.green : c.archetype === "Detractor" ? C.red :
                c.archetype === "Economic Buyer" ? C.orange : c.archetype === "Influencer" ? C.purple : C.blue
              }>{c.archetype}</Badge>
              <span style={{ fontSize: 13, color: C.textMuted }}>in buying group at {c.accountName}</span>
            </div>
            {c.buyingGroupActivity.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <SectionLabel>Cross-Account Buying Activity</SectionLabel>
                {c.buyingGroupActivity.map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.text, padding: "8px 12px", borderRadius: 6, background: C.bgPanel, border: `1px solid ${C.border}` }}>
                    {a.note}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : <EmptyState text="Not identified as a buying group member" />
      )}

      {tab === "intelligence" && (
        <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.accent}30`, background: `linear-gradient(135deg, ${C.accent}08, ${C.purple}08)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ color: C.accent }}>{Icons.spark}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>AI Insights</span>
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
            {c.archetype === "Champion" && c.formerCompanies.length > 0
              ? `${c.firstName} was previously at ${c.formerCompanies[0].name} as ${c.formerCompanies[0].title}. Cross-referencing buying group data shows champion behavior at former company — high likelihood of internal advocacy at ${c.accountName}. Recommend prioritizing this contact for multi-threaded outreach.`
              : c.engagement.length > 2
              ? `${c.firstName} has shown consistent engagement (${c.engagement.length} touchpoints). Content consumption pattern suggests active evaluation phase. Recommend personalized follow-up aligned to their ${c.title} role.`
              : `Limited engagement data for ${c.firstName}. Consider adding to a nurture workflow targeting ${c.title}-level personas.`
            }
          </div>
        </div>
      )}
    </Modal>
  );
}
