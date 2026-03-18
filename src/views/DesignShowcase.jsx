import React, { useState } from 'react';
import {
  Button, Badge, Input, Select, Card, Tab, TabList,
  Avatar, ScoreBar, Stat, SectionLabel,
  Modal, TH, TR, TD, EmptyState, PageShell,
  tokens, light, dark,
} from '../ds';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: tokens.fontSize.xl, fontWeight: tokens.fontWeight.bold, color: "var(--color-text)", marginBottom: tokens.space[4], paddingBottom: tokens.space[2], borderBottom: "1px solid var(--color-border)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: tokens.space[4] }}>
      {label && <div style={{ fontSize: tokens.fontSize.xs, fontWeight: tokens.fontWeight.semibold, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: tokens.space[2] }}>{label}</div>}
      <div style={{ display: "flex", gap: tokens.space[2], flexWrap: "wrap", alignItems: "center" }}>
        {children}
      </div>
    </div>
  );
}

export default function DesignShowcase() {
  const [theme, setTheme] = useState("light");
  const [modalOpen, setModalOpen] = useState(false);
  const t = theme === "dark" ? dark : light;

  return (
    <div style={{
      background: theme === "dark" ? "var(--color-dark-bg)" : "var(--color-bg)",
      color: theme === "dark" ? "var(--color-dark-text)" : "var(--color-text)",
      minHeight: "100vh", padding: tokens.space[8],
      fontFamily: tokens.font.sans,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: tokens.space[8] }}>
        <div>
          <h1 style={{ fontSize: tokens.fontSize["3xl"], fontWeight: tokens.fontWeight.extrabold, margin: 0 }}>
            Design System
          </h1>
          <p style={{ fontSize: tokens.fontSize.md, color: theme === "dark" ? "var(--color-dark-text-secondary)" : "var(--color-text-secondary)", marginTop: tokens.space[1] }}>
            Component library & token reference
          </p>
        </div>
        <div style={{ display: "flex", gap: tokens.space[2] }}>
          <Button variant={theme === "light" ? "primary" : "secondary"} theme={theme} onClick={() => setTheme("light")}>Light</Button>
          <Button variant={theme === "dark" ? "primary" : "secondary"} theme={theme} onClick={() => setTheme("dark")}>Dark</Button>
        </div>
      </div>

      {/* Typography */}
      <Section title="Typography">
        <Row label="Scale">
          {[["xs","11px"],["sm","12px"],["base","13px"],["md","14px"],["lg","15px"],["xl","18px"],["2xl","22px"],["3xl","28px"]].map(([name, px]) => (
            <span key={name} style={{ fontSize: `var(--font-size-${name})`, fontWeight: tokens.fontWeight.semibold, marginRight: tokens.space[4] }}>
              {name} ({px})
            </span>
          ))}
        </Row>
        <Row label="Weights">
          {Object.entries(tokens.fontWeight).map(([name, val]) => (
            <span key={name} style={{ fontWeight: val, fontSize: tokens.fontSize.md, marginRight: tokens.space[4] }}>
              {name} ({val})
            </span>
          ))}
        </Row>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <Row label="Variants">
          <Button variant="primary" theme={theme}>Primary</Button>
          <Button variant="secondary" theme={theme}>Secondary</Button>
          <Button variant="ghost" theme={theme}>Ghost</Button>
          <Button variant="danger" theme={theme}>Danger</Button>
          <Button variant="accent" theme={theme}>Accent Gradient</Button>
        </Row>
        <Row label="Sizes">
          <Button variant="primary" size="sm" theme={theme}>Small</Button>
          <Button variant="primary" size="md" theme={theme}>Medium</Button>
          <Button variant="primary" size="lg" theme={theme}>Large</Button>
        </Row>
        <Row label="States">
          <Button variant="primary" theme={theme}>Enabled</Button>
          <Button variant="primary" theme={theme} disabled>Disabled</Button>
        </Row>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <Row label="Variants">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="purple">Purple</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="muted">Muted</Badge>
        </Row>
        <Row label="Sizes">
          <Badge variant="success" size="sm">Small</Badge>
          <Badge variant="success" size="md">Medium</Badge>
        </Row>
        <Row label="With dot">
          <Badge variant="success" dot>Active</Badge>
          <Badge variant="danger" dot>Error</Badge>
          <Badge variant="warning" dot>Pending</Badge>
        </Row>
      </Section>

      {/* Inputs */}
      <Section title="Inputs & Selects">
        <Row label="Input">
          <Input placeholder="Default input" theme={theme} style={{ width: 240 }} />
          <Input placeholder="Small" size="sm" theme={theme} style={{ width: 180 }} />
          <Input placeholder="With icon" theme={theme} icon={<span>🔍</span>} style={{ width: 240 }} />
        </Row>
        <Row label="Select">
          <Select theme={theme} options={["Option 1","Option 2","Option 3"]} style={{ width: 200 }} />
          <Select theme={theme} size="sm" options={[{value:"a",label:"Small select"},{value:"b",label:"Option B"}]} style={{ width: 180 }} />
        </Row>
      </Section>

      {/* Avatars */}
      <Section title="Avatars">
        <Row label="Company (square)">
          <Avatar name="Vertexai" size={28} />
          <Avatar name="LiveRamp" size={34} />
          <Avatar name="MongoDB" size={40} />
          <Avatar name="Starburst" size={48} />
        </Row>
        <Row label="Person (circle)">
          <Avatar name="Kim Chen" shape="circle" size={28} />
          <Avatar name="Sarah Johnson" shape="circle" size={34} />
          <Avatar name="Mike Rivera" shape="circle" size={40} />
        </Row>
        <Row label="Custom color">
          <Avatar name="Custom" size={34} color="#dc2626" />
          <Avatar name="Custom" size={34} color="#7c3aed" shape="circle" />
        </Row>
      </Section>

      {/* Score Bars */}
      <Section title="Score Bars">
        <Row>
          <ScoreBar value={92} />
          <ScoreBar value={65} />
          <ScoreBar value={28} />
          <ScoreBar value={50} width={100} />
        </Row>
      </Section>

      {/* Stats */}
      <Section title="Stats">
        <Row>
          <Stat label="Total Accounts" value="847" theme={theme} />
          <Stat label="High Intent" value="142" color="var(--color-success)" theme={theme} />
          <Stat label="Pipeline" value="$2.4M" color="var(--color-accent)" theme={theme} sub="Qualified" />
          <Stat label="At Risk" value="23" color="var(--color-danger)" theme={theme} />
        </Row>
      </Section>

      {/* Tabs */}
      <Section title="Tabs">
        <Row>
          <TabList theme={theme}>
            <Tab active theme={theme}>Overview</Tab>
            <Tab theme={theme}>Contacts</Tab>
            <Tab theme={theme}>Signals</Tab>
            <Tab theme={theme}>Activities</Tab>
          </TabList>
        </Row>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <Row>
          <Card theme={theme} style={{ width: 280 }}>
            <SectionLabel theme={theme}>Card Title</SectionLabel>
            <p style={{ fontSize: tokens.fontSize.base, color: theme === "dark" ? "var(--color-dark-text-secondary)" : "var(--color-text-secondary)" }}>
              A basic card with default padding and border radius.
            </p>
          </Card>
          <Card theme={theme} hover style={{ width: 280 }}>
            <SectionLabel theme={theme}>Hoverable Card</SectionLabel>
            <p style={{ fontSize: tokens.fontSize.base, color: theme === "dark" ? "var(--color-dark-text-secondary)" : "var(--color-text-secondary)" }}>
              Hover me — border highlights on hover.
            </p>
          </Card>
        </Row>
      </Section>

      {/* Table */}
      <Section title="Table">
        <div style={{ borderRadius: tokens.radius["2xl"], border: `1px solid ${theme === "dark" ? "var(--color-dark-border)" : "var(--color-border)"}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <TH theme={theme}>Company</TH>
                <TH theme={theme}>Industry</TH>
                <TH theme={theme} active>Score</TH>
                <TH theme={theme}>Status</TH>
              </tr>
            </thead>
            <tbody>
              {[["Vertexai","SaaS",87,"success"],["LiveRamp","SaaS",55,"warning"],["MongoDB","Data",72,"info"],["Starburst","Analytics",34,"danger"]].map(([name,ind,score,status]) => (
                <TR key={name} theme={theme} onClick={() => {}}>
                  <TD><div style={{ display: "flex", alignItems: "center", gap: tokens.space[2] }}><Avatar name={name} size={28} /><span style={{ fontWeight: tokens.fontWeight.semibold }}>{name}</span></div></TD>
                  <TD><span style={{ color: theme === "dark" ? "var(--color-dark-text-secondary)" : "var(--color-text-secondary)" }}>{ind}</span></TD>
                  <TD><ScoreBar value={score} /></TD>
                  <TD><Badge variant={status} size="sm">{status}</Badge></TD>
                </TR>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Modal */}
      <Section title="Modal">
        <Button variant="primary" theme={theme} onClick={() => setModalOpen(true)}>Open Modal</Button>
        {modalOpen && (
          <Modal title="Sample Modal" onClose={() => setModalOpen(false)} theme={theme}>
            <p style={{ color: theme === "dark" ? "var(--color-dark-text-secondary)" : "var(--color-text-secondary)", fontSize: tokens.fontSize.md, lineHeight: tokens.lineHeight.relaxed }}>
              This is a modal using the design system. It supports both light and dark themes, wide mode, and custom content.
            </p>
            <div style={{ marginTop: tokens.space[4], display: "flex", gap: tokens.space[2], justifyContent: "flex-end" }}>
              <Button variant="secondary" theme={theme} onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" theme={theme} onClick={() => setModalOpen(false)}>Confirm</Button>
            </div>
          </Modal>
        )}
      </Section>

      {/* Empty State */}
      <Section title="Empty State">
        <Card theme={theme}>
          <EmptyState text="No data to display" icon="📭" theme={theme} />
        </Card>
      </Section>

      {/* Color Tokens */}
      <Section title="Color Tokens">
        <Row label="Semantic">
          {[["accent","var(--color-accent)"],["success","var(--color-success)"],["warning","var(--color-warning)"],["danger","var(--color-danger)"],["info","var(--color-info)"],["purple","var(--color-purple)"],["pink","var(--color-pink)"]].map(([name, val]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: tokens.space[2] }}>
              <div style={{ width: 24, height: 24, borderRadius: tokens.radius.md, background: val, border: "1px solid rgba(0,0,0,0.1)" }} />
              <span style={{ fontSize: tokens.fontSize.sm }}>{name}</span>
            </div>
          ))}
        </Row>
        <Row label="Brand / Source">
          {[["6sense","var(--color-sixsense)"],["Salesforce","var(--color-salesforce)"],["Gong","var(--color-gong)"],["Gainsight","var(--color-gainsight)"],["HubSpot","var(--color-hubspot)"]].map(([name, val]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: tokens.space[2] }}>
              <div style={{ width: 24, height: 24, borderRadius: tokens.radius.md, background: val, border: "1px solid rgba(0,0,0,0.1)" }} />
              <span style={{ fontSize: tokens.fontSize.sm }}>{name}</span>
            </div>
          ))}
        </Row>
      </Section>

      {/* Spacing */}
      <Section title="Spacing Scale">
        <Row>
          {[1,2,3,4,5,6,8,10,12].map(n => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: tokens.space[2] }}>
              <div style={{ width: `var(--spacing-${n})`, height: 24, background: "var(--color-accent)", borderRadius: 2, minWidth: 4 }} />
              <span style={{ fontSize: tokens.fontSize.xs, color: theme === "dark" ? "var(--color-dark-text-muted)" : "var(--color-text-muted)", minWidth: 40 }}>{n} ({n*4}px)</span>
            </div>
          ))}
        </Row>
      </Section>
    </div>
  );
}
