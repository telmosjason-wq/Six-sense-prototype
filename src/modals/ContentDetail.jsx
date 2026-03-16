import React, { useState } from 'react';
import { C } from '../components/ui/theme';
import { Badge, Tab, Modal, Stat, SectionLabel, FieldGrid, TH, TR, TD, EmptyState } from '../components/ui';
import { randDate, randInt } from '../data/generators';

export default function ContentDetail({ content: ct, contacts, accounts, onClose, onAccountClick, onContactClick }) {
  const [tab, setTab] = useState("overview");

  return (
    <Modal title={ct.title} onClose={onClose} wide>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["overview","contacts","accounts","attribution"].map(t => (
          <Tab key={t} active={tab === t} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</Tab>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <SectionLabel>Content Info</SectionLabel>
            <FieldGrid data={[["Type", ct.type],["Source", ct.source],["URL", ct.url]]} />
            <div style={{ marginTop: 16 }}>
              <SectionLabel>Tags</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ct.tags.map((t, i) => <Badge key={i} color={C.purple} small>{t}</Badge>)}
              </div>
            </div>
          </div>
          <div>
            <SectionLabel>Metrics</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Stat label="Views" value={ct.views} />
              <Stat label="Engaged Contacts" value={ct.engagements?.length || 0} color={C.green} />
              <Stat label="Accounts Reached" value={ct.accountsEngaged?.length || 0} color={C.purple} />
            </div>
          </div>
        </div>
      )}

      {tab === "contacts" && (
        <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard, maxHeight: 400 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><TH>Contact</TH><TH>Title</TH><TH>Account</TH><TH>Interaction</TH><TH>Date</TH></tr></thead>
            <tbody>
              {(ct.engagements || []).map(c => {
                const cc = c.contentConsumed?.find(x => x.contentId === ct.id);
                return (
                  <TR key={c.id} onClick={() => onContactClick(c)}>
                    <TD><span style={{ fontWeight: 600, color: C.text }}>{c.name}</span></TD>
                    <TD><span style={{ color: C.textMuted }}>{c.title}</span></TD>
                    <TD><span style={{ color: C.textMuted }}>{c.accountName}</span></TD>
                    <TD><Badge color={C.blue} small>{cc?.type || "view"}</Badge></TD>
                    <TD><span style={{ color: C.textDim }}>{cc?.date || "—"}</span></TD>
                  </TR>
                );
              })}
            </tbody>
          </table>
          {(!ct.engagements || ct.engagements.length === 0) && <EmptyState text="No contact engagements yet" />}
        </div>
      )}

      {tab === "accounts" && (
        <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard, maxHeight: 400 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><TH>Account</TH><TH>Industry</TH><TH>Contacts Engaged</TH><TH>ABM Tier</TH></tr></thead>
            <tbody>
              {(ct.accountsEngaged || []).map(aId => {
                const acct = accounts.find(a => a.id === aId);
                if (!acct) return null;
                const cnt = ct.engagements.filter(c => c.accountId === aId).length;
                return (
                  <TR key={aId} onClick={() => onAccountClick(acct)}>
                    <TD><span style={{ fontWeight: 600, color: C.text }}>{acct.name}</span></TD>
                    <TD><span style={{ color: C.textMuted }}>{acct.industry}</span></TD>
                    <TD><span style={{ color: C.accent, fontWeight: 600 }}>{cnt}</span></TD>
                    <TD><Badge color={acct.abmTier === "1:1" ? C.accent : acct.abmTier === "1:Few" ? C.purple : C.textMuted} small>{acct.abmTier}</Badge></TD>
                  </TR>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "attribution" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>First Touch</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{ct.firstTouch}%</div>
              <div style={{ fontSize: 11, color: C.textDim }}>of attributed pipeline</div>
            </div>
            <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Last Touch</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.orange }}>{ct.lastTouch}%</div>
              <div style={{ fontSize: 11, color: C.textDim }}>of attributed pipeline</div>
            </div>
            <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Multi-Touch</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.accent }}>{ct.multiTouch}x</div>
              <div style={{ fontSize: 11, color: C.textDim }}>attribution multiplier</div>
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel }}>
            <SectionLabel>Usage History</SectionLabel>
            <div style={{ display: "grid", gap: 6 }}>
              {[
                { date: randDate(90), event: "Published to website" },
                { date: randDate(60), event: "Added to Enterprise ABM Q1 campaign" },
                { date: randDate(45), event: "Used in AI Email Sequence A" },
                { date: randDate(30), event: "Referenced in RevvyAI recommendation" },
                { date: randDate(7), event: `${ct.engagements?.length || 0} new engagements this week` },
              ].map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 12, fontSize: 12, alignItems: "center" }}>
                  <span style={{ color: C.textDim, minWidth: 80 }}>{h.date}</span>
                  <span style={{ color: C.textMuted }}>{h.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
