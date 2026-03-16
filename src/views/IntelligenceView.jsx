import React, { useState, useRef, useEffect, useMemo } from 'react';
import { C } from '../components/ui/theme';
import { Badge, Btn, Stat, Tab } from '../components/ui';
import { Icons } from '../components/Icons';
import { randInt } from '../data/generators';

// Simple force-directed graph simulation (no D3 dependency)
function useForceSimulation(nodes, links, width, height) {
  const [positions, setPositions] = useState([]);
  const frameRef = useRef();
  const posRef = useRef([]);

  useEffect(() => {
    if (!nodes.length) return;
    // Initialize positions
    const pos = nodes.map((n, i) => ({
      id: n.id,
      x: width / 2 + (Math.random() - 0.5) * width * 0.6,
      y: height / 2 + (Math.random() - 0.5) * height * 0.6,
      vx: 0, vy: 0,
      type: n.type, label: n.label, color: n.color, size: n.size || 6,
    }));
    posRef.current = pos;

    let iteration = 0;
    const maxIterations = 200;

    function tick() {
      const p = posRef.current;
      const alpha = Math.max(0.001, 1 - iteration / maxIterations);

      // Repulsion between all nodes
      for (let i = 0; i < p.length; i++) {
        for (let j = i + 1; j < p.length; j++) {
          let dx = p[j].x - p[i].x;
          let dy = p[j].y - p[i].y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          let force = (800 * alpha) / (dist * dist);
          let fx = (dx / dist) * force;
          let fy = (dy / dist) * force;
          p[i].vx -= fx; p[i].vy -= fy;
          p[j].vx += fx; p[j].vy += fy;
        }
      }

      // Attraction along links
      links.forEach(l => {
        const source = p.find(n => n.id === l.source);
        const target = p.find(n => n.id === l.target);
        if (!source || !target) return;
        let dx = target.x - source.x;
        let dy = target.y - source.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let force = (dist - 80) * 0.03 * alpha;
        let fx = (dx / dist) * force;
        let fy = (dy / dist) * force;
        source.vx += fx; source.vy += fy;
        target.vx -= fx; target.vy -= fy;
      });

      // Center gravity
      p.forEach(n => {
        n.vx += (width / 2 - n.x) * 0.005 * alpha;
        n.vy += (height / 2 - n.y) * 0.005 * alpha;
      });

      // Apply velocity with damping
      p.forEach(n => {
        n.vx *= 0.6; n.vy *= 0.6;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(30, Math.min(width - 30, n.x));
        n.y = Math.max(30, Math.min(height - 30, n.y));
      });

      iteration++;
      setPositions([...p]);

      if (iteration < maxIterations) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [nodes, links, width, height]);

  return positions;
}

export default function IntelligenceView({ accounts, contacts, signalEvents, onAccountClick, onContactClick }) {
  const [tab, setTab] = useState("graph");
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedGraphNode, setSelectedGraphNode] = useState(null);
  const graphWidth = 700;
  const graphHeight = 440;

  // Build graph data from real data
  const { graphNodes, graphLinks } = useMemo(() => {
    const nodes = [];
    const links = [];
    const nodeMap = {};

    // Add accounts with signals (limit for performance)
    const signalAccounts = accounts.filter(a => a.signals.length > 0).slice(0, 20);
    const otherAccounts = accounts.filter(a => a.signals.length === 0).slice(0, 8);
    const graphAccounts = [...signalAccounts, ...otherAccounts];

    graphAccounts.forEach(a => {
      const id = `acc-${a.id}`;
      nodes.push({ id, type: "account", label: a.name, color: C.blue, size: 8 + a.signals.length * 3, data: a });
      nodeMap[a.id] = id;
    });

    // Add contacts with signals
    const signalContacts = contacts.filter(c => c.signals.length > 0 && !c.isHidden).slice(0, 15);
    signalContacts.forEach(c => {
      const id = `con-${c.id}`;
      nodes.push({ id, type: "contact", label: c.name, color: C.green, size: 6, data: c });
      // Link to account
      if (nodeMap[c.accountId]) links.push({ source: id, target: nodeMap[c.accountId], color: C.green + "40" });
      // Link to former companies
      c.formerCompanies.forEach(fc => {
        if (nodeMap[fc.id]) links.push({ source: id, target: nodeMap[fc.id], color: C.purple + "40" });
      });
    });

    // Add signal nodes
    const displayEvents = signalEvents.slice(0, 12);
    displayEvents.forEach(evt => {
      const id = `sig-${evt.id}`;
      nodes.push({ id, type: "signal", label: evt.type, color: C.orange, size: 5, data: evt });
      if (evt.toAccountId && nodeMap[evt.toAccountId]) links.push({ source: id, target: nodeMap[evt.toAccountId], color: C.orange + "40" });
      if (evt.fromAccountId && nodeMap[evt.fromAccountId]) links.push({ source: id, target: nodeMap[evt.fromAccountId], color: C.red + "40" });
    });

    // Add buying group connections
    const champions = contacts.filter(c => c.archetype === "Champion" && !c.isHidden && c.buyingGroupActivity.length > 0).slice(0, 5);
    champions.forEach(c => {
      const cId = `con-${c.id}`;
      if (!nodes.find(n => n.id === cId)) {
        nodes.push({ id: cId, type: "contact", label: c.name, color: C.accent, size: 7, data: c });
        if (nodeMap[c.accountId]) links.push({ source: cId, target: nodeMap[c.accountId], color: C.accent + "40" });
      }
    });

    return { graphNodes: nodes, graphLinks: links };
  }, [accounts, contacts, signalEvents]);

  const positions = useForceSimulation(graphNodes, graphLinks, graphWidth, graphHeight);
  const hoveredData = hoveredNode ? positions.find(p => p.id === hoveredNode) : null;

  return (
    <div>
      <div style={{ padding: 24, borderRadius: 12, border: `1px solid ${C.accent}30`, background: `linear-gradient(135deg, ${C.accent}05, ${C.purple}08)`, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ color: C.accent }}>{Icons.graph}</span>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.accent }}>Contextual Intelligence Graph</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          <Stat label="Entities" value={accounts.length + contacts.filter(c => !c.isHidden).length} sub="Accounts + Contacts" color={C.accent} />
          <Stat label="Signals" value={signalEvents.length} sub="Active events" color={C.orange} />
          <Stat label="Relationships" value={graphLinks.length + "+"} sub="Cross-entity" color={C.purple} />
          <Stat label="Insights" value={randInt(30, 60)} sub="This week" color={C.green} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab active={tab === "graph"} onClick={() => setTab("graph")}>Interactive Graph</Tab>
        <Tab active={tab === "insights"} onClick={() => setTab("insights")}>Insight Cards</Tab>
      </div>

      {tab === "graph" && (
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel, position: "relative", overflow: "hidden" }}>
            <svg width={graphWidth} height={graphHeight} style={{ display: "block" }}>
              {/* Links */}
              {graphLinks.map((l, i) => {
                const source = positions.find(p => p.id === l.source);
                const target = positions.find(p => p.id === l.target);
                if (!source || !target) return null;
                return <line key={i} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke={l.color || C.border} strokeWidth="1" />;
              })}
              {/* Nodes */}
              {positions.map(n => (
                <g key={n.id}
                  onMouseEnter={() => setHoveredNode(n.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => {
                    const gn = graphNodes.find(g => g.id === n.id);
                    if (gn?.type === "account") onAccountClick(gn.data);
                    else if (gn?.type === "contact") onContactClick(gn.data);
                    else setSelectedGraphNode(gn);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <circle cx={n.x} cy={n.y} r={hoveredNode === n.id ? n.size + 3 : n.size} fill={n.color + "40"} stroke={n.color} strokeWidth={hoveredNode === n.id ? 2.5 : 1.5} />
                  {(hoveredNode === n.id || n.size > 7) && (
                    <text x={n.x} y={n.y - n.size - 6} textAnchor="middle" fill={C.text} fontSize="9" fontFamily="inherit" fontWeight="500">
                      {n.label.length > 18 ? n.label.slice(0, 18) + "…" : n.label}
                    </text>
                  )}
                </g>
              ))}
            </svg>
            {/* Legend */}
            <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 12, fontSize: 10, color: C.textMuted }}>
              {[["Account", C.blue],["Contact", C.green],["Signal", C.orange],["Champion", C.accent]].map(([l, col]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: col + "60", border: `1.5px solid ${col}` }} />
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ width: 280, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgCard, padding: 16, overflow: "auto" }}>
            {hoveredData ? (() => {
              const gn = graphNodes.find(g => g.id === hoveredData.id);
              if (!gn) return null;
              return (
                <div>
                  <Badge color={hoveredData.color} small>{gn.type}</Badge>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginTop: 8, marginBottom: 8 }}>{hoveredData.label}</div>
                  {gn.type === "account" && (
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                      <div>{gn.data.industry} · {gn.data.size}</div>
                      <div>Intent: {gn.data.intentLevel} · Score: {gn.data.sixsenseScore}</div>
                      <div>ABM: {gn.data.abmTier} · Stage: {gn.data.stage}</div>
                      <div style={{ marginTop: 6 }}>{gn.data.signals.length} signal{gn.data.signals.length !== 1 ? "s" : ""}</div>
                      {Object.entries(gn.data.signalFields || {}).length > 0 && (
                        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {Object.entries(gn.data.signalFields).map(([k, v]) => (
                            <Badge key={k} color={C.accent} small>{k}</Badge>
                          ))}
                        </div>
                      )}
                      <Btn small style={{ marginTop: 8 }} onClick={() => onAccountClick(gn.data)}>Open Record →</Btn>
                    </div>
                  )}
                  {gn.type === "contact" && (
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                      <div>{gn.data.title}</div>
                      <div>at {gn.data.accountName}</div>
                      {gn.data.archetype && <div style={{ marginTop: 4 }}><Badge color={gn.data.archetype === "Champion" ? C.green : C.purple} small>{gn.data.archetype}</Badge></div>}
                      {gn.data.signals.length > 0 && <div style={{ marginTop: 4 }}>{gn.data.signals.length} direct signal{gn.data.signals.length !== 1 ? "s" : ""}</div>}
                      <Btn small style={{ marginTop: 8 }} onClick={() => onContactClick(gn.data)}>Open Record →</Btn>
                    </div>
                  )}
                  {gn.type === "signal" && (
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                      <div>{gn.data.type} · {gn.data.date}</div>
                      {gn.data.personName && <div>Person: {gn.data.personName}</div>}
                      {gn.data.toAccountName && <div>To: {gn.data.toAccountName}</div>}
                      {gn.data.fromAccountName && <div>From: {gn.data.fromAccountName}</div>}
                      <div style={{ marginTop: 4 }}>Confidence: {gn.data.confidence}%</div>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div style={{ color: C.textDim, fontSize: 12, textAlign: "center", paddingTop: 40 }}>
                Hover over a node to see details. Click to open the full record.
                <div style={{ marginTop: 16, fontSize: 11, color: C.textDim }}>
                  {graphNodes.length} nodes · {graphLinks.length} connections
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "insights" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.green}30`, background: C.green + "08" }}>
            <Badge color={C.green} small>OPPORTUNITY</Badge>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 8, marginBottom: 8 }}>Champion pattern detected at {accounts.filter(a => a.signals.some(s => s.direction === "Incoming")).length} accounts</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              Kim was previously CPO at LiveRamp where she championed Jira. She recently joined as CPO at a target account currently using ProductBoard (a Jira competitor). The account is showing new keyword activity related to "project management alternatives" and ProductBoard usage metrics are declining. Cross-referencing with Kim's history at Cisco, where she was a detractor of ProductBoard — the graph identifies a high-confidence opportunity for Jira and a churn risk for ProductBoard.
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.red}30`, background: C.red + "08" }}>
            <Badge color={C.red} small>CHURN RISK</Badge>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 8, marginBottom: 8 }}>
              {accounts.filter(a => a.signalFields?.recent_departure).length} accounts showing departure signals
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              Key decision-makers have recently left these accounts. Combined with declining engagement and competitor keyword research, these accounts show early churn indicators. Recommend immediate executive outreach and success plan review.
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.orange}30`, background: C.orange + "08" }}>
            <Badge color={C.orange} small>TREND</Badge>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 8, marginBottom: 8 }}>
              AI Engineering hiring wave across {accounts.filter(a => a.signalFields?.hiring_ai).length} target accounts
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              Multiple accounts in your pipeline are aggressively hiring AI/ML engineers. This correlates with increased keyword research for "AI infrastructure" and "ML ops" tools. The graph links hiring activity to budget expansion signals at {accounts.filter(a => a.signalFields?.funding_event).length} accounts with recent funding. Recommend creating a targeted campaign for technical decision-makers.
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.purple}30`, background: C.purple + "08" }}>
            <Badge color={C.purple} small>BUYING GROUP</Badge>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 8, marginBottom: 8 }}>
              Cross-company champion network identified
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              {contacts.filter(c => c.archetype === "Champion" && c.formerCompanies.length > 0 && !c.isHidden).length} champions have been tracked across multiple accounts in your database. Their buying behavior and product preferences at former companies inform likelihood-to-purchase scoring at their current accounts. The graph uses these multi-hop relationships to surface hidden opportunity and risk.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
