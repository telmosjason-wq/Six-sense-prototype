import React, { useState, useRef, useEffect, useMemo } from 'react';
import { C } from '../components/ui/theme';
import { Badge, Btn, Inp, Sel, Stat, Tab, Score, Modal, SectionLabel, TH, TR, TD, EmptyState } from '../components/ui';
import { Icons } from '../components/Icons';
import { PRODUCTS, BUYING_STAGES_DEFAULT, COMPETITORS, CONTENT_ITEMS } from '../data/constants';
import { randInt, randDate, rand } from '../data/generators';

// ─── Force-directed graph (kept from before, simplified) ─────────────────────
function useForceSimulation(nodes, links, width, height) {
  const [positions, setPositions] = useState([]);
  const frameRef = useRef();
  const posRef = useRef([]);
  useEffect(() => {
    if (!nodes.length || !width) return;
    const pos = nodes.map(n => ({
      id: n.id, x: width/2 + (Math.random()-.5)*width*.6, y: height/2 + (Math.random()-.5)*height*.6,
      vx: 0, vy: 0, type: n.type, label: n.label, color: n.color, size: n.size || 6,
    }));
    posRef.current = pos;
    let iter = 0;
    function tick() {
      const p = posRef.current;
      const alpha = Math.max(0.001, 1 - iter/200);
      for (let i=0;i<p.length;i++) for (let j=i+1;j<p.length;j++) {
        let dx=p[j].x-p[i].x, dy=p[j].y-p[i].y, dist=Math.sqrt(dx*dx+dy*dy)||1;
        let f=(800*alpha)/(dist*dist), fx=(dx/dist)*f, fy=(dy/dist)*f;
        p[i].vx-=fx; p[i].vy-=fy; p[j].vx+=fx; p[j].vy+=fy;
      }
      links.forEach(l => {
        const s=p.find(n=>n.id===l.source), t=p.find(n=>n.id===l.target);
        if (!s||!t) return;
        let dx=t.x-s.x, dy=t.y-s.y, dist=Math.sqrt(dx*dx+dy*dy)||1;
        let f=(dist-80)*.03*alpha, fx=(dx/dist)*f, fy=(dy/dist)*f;
        s.vx+=fx; s.vy+=fy; t.vx-=fx; t.vy-=fy;
      });
      p.forEach(n => { n.vx+=(width/2-n.x)*.005*alpha; n.vy+=(height/2-n.y)*.005*alpha; n.vx*=.6; n.vy*=.6; n.x+=n.vx; n.y+=n.vy; n.x=Math.max(30,Math.min(width-30,n.x)); n.y=Math.max(30,Math.min(height-30,n.y)); });
      iter++;
      setPositions([...p]);
      if (iter<200) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [nodes, links, width, height]);
  return positions;
}

// ─── Model Variant Editor ────────────────────────────────────────────────────
function ModelVariantEditor({ product, accounts, onClose }) {
  const pid = product.id;
  const [variant, setVariant] = useState({
    qualIntentMin: 80, qualFitMin: 80,
    stageOverrides: {},
    icpExcludeIndustry: "",
  });
  const [applied, setApplied] = useState(false);

  // Baseline
  const baseline = useMemo(() => {
    const qualified = accounts.filter(a => a.scoring[pid]?.qualified);
    const pipeline = qualified.reduce((s, a) => s + (a.scoring[pid]?.pipeline || 0), 0);
    const byStage = BUYING_STAGES_DEFAULT.map(s => ({
      ...s, count: accounts.filter(a => a.scoring[pid]?.buyingStage === s.stage).length
    }));
    return { qualified: qualified.length, pipeline, byStage };
  }, [accounts, pid]);

  // Variant
  const variantResult = useMemo(() => {
    const qualified = accounts.filter(a => {
      const sc = a.scoring[pid];
      if (!sc) return false;
      if (sc.intentScore < variant.qualIntentMin) return false;
      if (sc.icpFit < variant.qualFitMin) return false;
      if (variant.icpExcludeIndustry && a.industry === variant.icpExcludeIndustry) return false;
      return true;
    });
    const pipeline = qualified.reduce((s, a) => s + (a.scoring[pid]?.pipeline || randInt(20, 200) * 1000), 0);
    const byStage = BUYING_STAGES_DEFAULT.map(s => ({
      ...s, count: accounts.filter(a => {
        const sc = a.scoring[pid];
        if (!sc) return false;
        if (variant.icpExcludeIndustry && a.industry === variant.icpExcludeIndustry) return false;
        return sc.buyingStage === s.stage;
      }).length
    }));
    return { qualified: qualified.length, pipeline, byStage };
  }, [accounts, pid, variant]);

  const pipelineDelta = variantResult.pipeline - baseline.pipeline;
  const qualDelta = variantResult.qualified - baseline.qualified;

  return (
    <Modal title={`Model Variant: ${product.name}`} onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        {/* Controls */}
        <div>
          <SectionLabel>Qualification Criteria</SectionLabel>
          <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Min Intent Score</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="range" min="0" max="100" value={variant.qualIntentMin} onChange={e => setVariant({...variant, qualIntentMin: parseInt(e.target.value)})} style={{ flex: 1 }} />
                <span style={{ color: C.accent, fontWeight: 700, minWidth: 30 }}>{variant.qualIntentMin}</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Min ICP Fit</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="range" min="0" max="100" value={variant.qualFitMin} onChange={e => setVariant({...variant, qualFitMin: parseInt(e.target.value)})} style={{ flex: 1 }} />
                <span style={{ color: C.accent, fontWeight: 700, minWidth: 30 }}>{variant.qualFitMin}</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Exclude Industry</label>
              <Sel value={variant.icpExcludeIndustry} onChange={v => setVariant({...variant, icpExcludeIndustry: v})} options={[{value:"",label:"None"},...["SaaS","FinTech","Healthcare","Manufacturing","Retail","Cybersecurity","EdTech"].map(i=>({value:i,label:i}))]} />
            </div>
          </div>
          <div style={{ padding: 12, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel, fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
            Changes are non-destructive. The baseline model is always preserved. Applying a variant creates a new scoring version you can compare against.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn primary onClick={() => setApplied(true)}>Apply Variant</Btn>
          </div>
          {applied && <div style={{ marginTop: 12, padding: 10, borderRadius: 6, background: C.green + "15", border: `1px solid ${C.green}30`, fontSize: 12, color: C.green }}>Variant applied. Comparing against baseline below.</div>}
        </div>

        {/* Comparison */}
        <div>
          <SectionLabel>Side-by-Side Comparison</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel }}>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Baseline</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{baseline.qualified} <span style={{ fontSize: 13, color: C.textMuted }}>qualified</span></div>
              <div style={{ fontSize: 14, color: C.green, marginTop: 4 }}>${(baseline.pipeline / 1000).toFixed(0)}K pipeline</div>
            </div>
            <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.accent}40`, background: C.accent + "08" }}>
              <div style={{ fontSize: 11, color: C.accent, textTransform: "uppercase", marginBottom: 8 }}>Variant</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{variantResult.qualified} <span style={{ fontSize: 13, color: C.textMuted }}>qualified</span></div>
              <div style={{ fontSize: 14, color: pipelineDelta >= 0 ? C.green : C.red, marginTop: 4 }}>
                ${(variantResult.pipeline / 1000).toFixed(0)}K pipeline
                <span style={{ fontSize: 12, marginLeft: 8 }}>({pipelineDelta >= 0 ? "+" : ""}{(pipelineDelta / 1000).toFixed(0)}K)</span>
              </div>
            </div>
          </div>

          {/* Stage distribution comparison */}
          <SectionLabel>Buying Stage Distribution</SectionLabel>
          <div style={{ display: "flex", gap: 2, height: 120, alignItems: "flex-end", marginBottom: 8 }}>
            {BUYING_STAGES_DEFAULT.map((s, i) => {
              const bCount = baseline.byStage[i]?.count || 0;
              const vCount = variantResult.byStage[i]?.count || 0;
              const maxCount = Math.max(...baseline.byStage.map(x => x.count), ...variantResult.byStage.map(x => x.count), 1);
              return (
                <div key={s.stage} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", width: "100%", justifyContent: "center" }}>
                    <div style={{ width: "35%", height: Math.max(4, (bCount / maxCount) * 100), background: C.textDim, borderRadius: "2px 2px 0 0" }} title={`Baseline: ${bCount}`} />
                    <div style={{ width: "35%", height: Math.max(4, (vCount / maxCount) * 100), background: s.color, borderRadius: "2px 2px 0 0" }} title={`Variant: ${vCount}`} />
                  </div>
                  <span style={{ fontSize: 9, color: C.textDim }}>{s.name}</span>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{bCount} → {vCount}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 10, color: C.textDim }}>
            <span>■ Baseline</span>
            <span style={{ color: C.accent }}>■ Variant</span>
            <span style={{ marginLeft: "auto" }}>
              Qualified delta: <span style={{ color: qualDelta >= 0 ? C.green : C.red, fontWeight: 700 }}>{qualDelta >= 0 ? "+" : ""}{qualDelta}</span>
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Buying Stage Drill-Down ─────────────────────────────────────────────────
function StageDrillDown({ stage, product, accounts, contacts, allActivities, onBack, onAccountClick }) {
  const [tab, setTab] = useState("accounts");
  const pid = product.id;
  const stageAccounts = accounts.filter(a => a.scoring[pid]?.buyingStage === stage.stage);
  const stageContacts = contacts.filter(c => !c.isHidden && stageAccounts.some(a => a.id === c.accountId));
  const stageActivities = allActivities.filter(a => stageAccounts.some(ac => ac.id === a.entityId) || stageContacts.some(c => c.id === a.entityId));
  const pipeline = stageAccounts.reduce((s, a) => s + (a.scoring[pid]?.pipeline || 0), 0);

  // Content consumed by contacts in this stage
  const stageContent = {};
  stageContacts.forEach(c => {
    (c.contentConsumed || []).forEach(cc => {
      if (!stageContent[cc.contentId]) stageContent[cc.contentId] = { contentId: cc.contentId, count: 0 };
      stageContent[cc.contentId].count++;
    });
  });
  const topContent = Object.values(stageContent).sort((a, b) => b.count - a.count).slice(0, 8).map(sc => {
    const ct = CONTENT_ITEMS.find(x => x.id === sc.contentId);
    return { ...sc, title: ct?.title || sc.contentId, type: ct?.type || "Unknown" };
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textMuted, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>← Back</button>
        <div style={{ width: 12, height: 12, borderRadius: 2, background: stage.color }} />
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Stage {stage.stage}: {stage.name}</h3>
        <Badge color={product.color}>{product.name}</Badge>
        <span style={{ fontSize: 13, color: C.textMuted }}>Intent {stage.range[0]}–{stage.range[1]}</span>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <Stat label="Accounts" value={stageAccounts.length} color={stage.color} />
        <Stat label="Contacts" value={stageContacts.length} color={C.green} />
        <Stat label="Pipeline" value={`$${(pipeline/1000).toFixed(0)}K`} color={C.accent} />
        <Stat label="Avg Intent" value={stageAccounts.length ? Math.round(stageAccounts.reduce((s,a) => s + (a.scoring[pid]?.intentScore||0), 0) / stageAccounts.length) : 0} color={C.orange} />
        <Stat label="Avg ICP Fit" value={stageAccounts.length ? Math.round(stageAccounts.reduce((s,a) => s + (a.scoring[pid]?.icpFit||0), 0) / stageAccounts.length) : 0} color={C.purple} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["accounts","activities","content","insights"].map(t => <Tab key={t} active={tab===t} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</Tab>)}
      </div>

      {tab === "accounts" && (
        <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard, maxHeight: 400 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><TH>Account</TH><TH>Industry</TH><TH>Intent</TH><TH>ICP Fit</TH><TH>Qual Score</TH><TH>Comp. Risk</TH><TH>ABM</TH></tr></thead>
            <tbody>
              {stageAccounts.map(a => {
                const sc = a.scoring[pid];
                return (
                  <TR key={a.id} onClick={() => onAccountClick(a)}>
                    <TD><span style={{ fontWeight: 600, color: C.text }}>{a.name}</span></TD>
                    <TD><span style={{ color: C.textMuted }}>{a.industry}</span></TD>
                    <TD><Score value={sc.intentScore} /></TD>
                    <TD><Score value={sc.icpFit} /></TD>
                    <TD><Score value={sc.qualificationScore} /></TD>
                    <TD>{sc.competitiveRisk !== "None" ? <span><Badge color={sc.competitiveRisk==="High"?C.red:sc.competitiveRisk==="Medium"?C.orange:C.green} small>{sc.competitiveRisk}</Badge> <span style={{fontSize:10,color:C.textDim}}>{sc.competitor}</span></span> : <span style={{color:C.textDim}}>—</span>}</TD>
                    <TD><Badge color={a.abmTier==="1:1"?C.accent:a.abmTier==="1:Few"?C.purple:C.textMuted} small>{a.abmTier}</Badge></TD>
                  </TR>
                );
              })}
            </tbody>
          </table>
          {stageAccounts.length === 0 && <EmptyState text="No accounts in this stage" />}
        </div>
      )}

      {tab === "activities" && (
        <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard, maxHeight: 400 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><TH>Date</TH><TH>Type</TH><TH>Detail</TH><TH>Entity</TH></tr></thead>
            <tbody>
              {stageActivities.slice(0, 50).map(a => (
                <TR key={a.id}>
                  <TD><span style={{ color: C.textDim }}>{a.date}</span></TD>
                  <TD><Badge color={a.type.includes("Signal")?C.orange:a.type.includes("Email")?C.blue:C.textMuted} small>{a.type}</Badge></TD>
                  <TD><span style={{ color: C.textMuted }}>{a.detail}</span></TD>
                  <TD><span style={{ color: C.text, fontWeight: 600 }}>{a.entityName}</span></TD>
                </TR>
              ))}
            </tbody>
          </table>
          <div style={{ padding: 12, fontSize: 12, color: C.textMuted }}>
            Most common: {(() => { const types = {}; stageActivities.forEach(a => { types[a.type] = (types[a.type]||0)+1; }); return Object.entries(types).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t,c])=>`${t} (${c})`).join(", ") || "None"; })()}
          </div>
        </div>
      )}

      {tab === "content" && (
        <div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>Content consumed by contacts at accounts in Stage {stage.stage}</div>
          <div style={{ display: "grid", gap: 8 }}>
            {topContent.map((tc, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", borderRadius: 6, border: `1px solid ${C.border}`, alignItems: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: stage.color, minWidth: 30 }}>{tc.count}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{tc.title}</div>
                  <Badge color={C.blue} small>{tc.type}</Badge>
                </div>
              </div>
            ))}
            {topContent.length === 0 && <EmptyState text="No content engagement in this stage" />}
          </div>
        </div>
      )}

      {tab === "insights" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${stage.color}30`, background: stage.color + "08" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Stage Trends</div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
              {stageAccounts.length} accounts currently in {stage.name}. {stageAccounts.filter(a => a.scoring[pid].competitiveRisk === "High").length} have high competitive risk.
              Average time in stage: ~{randInt(7, 45)} days. {stageAccounts.filter(a => a.signals.length > 0).length} accounts have active signals.
              {stage.stage >= 4 && ` Estimated pipeline: $${(pipeline/1000).toFixed(0)}K across ${stageAccounts.filter(a => a.scoring[pid].qualified).length} qualified accounts.`}
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Recommended Actions</div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
              {stage.stage <= 2 ? "Focus on awareness content and display advertising to move accounts into Consideration." :
               stage.stage === 3 ? "Engage with case studies and product demos. Multi-thread buying group contacts." :
               stage.stage === 4 ? "Accelerate with personalized outreach. Alert sales team for direct engagement." :
               "Close the deal. Ensure all buying group members are engaged and objections addressed."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN INTELLIGENCE VIEW ─────────────────────────────────────────────────
export default function IntelligenceView({ accounts, contacts, signalEvents, allActivities, onAccountClick, onContactClick }) {
  const [mainTab, setMainTab] = useState("scoring");
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [variantEditor, setVariantEditor] = useState(null);
  const [stageDrillDown, setStageDrillDown] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 700, h: 440 });

  useEffect(() => {
    if (!containerRef.current || mainTab !== "graph") return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setDims({ w: entry.contentRect.width, h: Math.max(400, entry.contentRect.height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [mainTab]);

  const pid = selectedProduct.id;

  // Buying stage distribution for selected product
  const stageDistribution = useMemo(() => {
    return BUYING_STAGES_DEFAULT.map(s => ({
      ...s,
      count: accounts.filter(a => a.scoring[pid]?.buyingStage === s.stage).length,
      pipeline: accounts.filter(a => a.scoring[pid]?.buyingStage === s.stage).reduce((sum, a) => sum + (a.scoring[pid]?.pipeline || 0), 0),
      qualified: accounts.filter(a => a.scoring[pid]?.buyingStage === s.stage && a.scoring[pid]?.qualified).length,
    }));
  }, [accounts, pid]);

  const totalPipeline = stageDistribution.reduce((s, d) => s + d.pipeline, 0);
  const totalQualified = accounts.filter(a => a.scoring[pid]?.qualified).length;
  const avgIntent = Math.round(accounts.reduce((s, a) => s + (a.scoring[pid]?.intentScore || 0), 0) / accounts.length);
  const highCompRisk = accounts.filter(a => a.scoring[pid]?.competitiveRisk === "High").length;

  // Graph data
  const { graphNodes, graphLinks } = useMemo(() => {
    const nodes = [], links = [], nodeMap = {};
    const sigAccts = accounts.filter(a => a.signals.length > 0).slice(0, 20);
    const otherAccts = accounts.filter(a => a.signals.length === 0).slice(0, 8);
    [...sigAccts, ...otherAccts].forEach(a => {
      const id = `acc-${a.id}`;
      nodes.push({ id, type: "account", label: a.name, color: C.blue, size: 8 + a.signals.length * 3, data: a });
      nodeMap[a.id] = id;
    });
    contacts.filter(c => c.signals.length > 0 && !c.isHidden).slice(0, 15).forEach(c => {
      const id = `con-${c.id}`;
      nodes.push({ id, type: "contact", label: c.name, color: C.green, size: 6, data: c });
      if (nodeMap[c.accountId]) links.push({ source: id, target: nodeMap[c.accountId], color: C.green + "40" });
      c.formerCompanies.forEach(fc => { if (nodeMap[fc.id]) links.push({ source: id, target: nodeMap[fc.id], color: C.purple + "40" }); });
    });
    signalEvents.slice(0, 12).forEach(evt => {
      const id = `sig-${evt.id}`;
      nodes.push({ id, type: "signal", label: evt.type, color: C.orange, size: 5, data: evt });
      if (evt.toAccountId && nodeMap[evt.toAccountId]) links.push({ source: id, target: nodeMap[evt.toAccountId], color: C.orange + "40" });
      if (evt.fromAccountId && nodeMap[evt.fromAccountId]) links.push({ source: id, target: nodeMap[evt.fromAccountId], color: C.red + "40" });
    });
    return { graphNodes: nodes, graphLinks: links };
  }, [accounts, contacts, signalEvents]);

  const positions = useForceSimulation(graphNodes, graphLinks, dims.w, dims.h);

  // If drilling into a stage
  if (stageDrillDown) {
    return <StageDrillDown stage={stageDrillDown} product={selectedProduct} accounts={accounts} contacts={contacts} allActivities={allActivities || []} onBack={() => setStageDrillDown(null)} onAccountClick={onAccountClick} />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ padding: 24, borderRadius: 12, border: `1px solid ${C.accent}30`, background: `linear-gradient(135deg, ${C.accent}05, ${C.purple}08)`, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: C.accent }}>{Icons.graph}</span>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.accent }}>Intelligence & Scoring</h3>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {PRODUCTS.map(p => (
              <button key={p.id} onClick={() => setSelectedProduct(p)} style={{
                padding: "6px 14px", borderRadius: 6, border: `2px solid ${selectedProduct.id === p.id ? p.color : C.border}`,
                background: selectedProduct.id === p.id ? p.color + "15" : "transparent",
                color: selectedProduct.id === p.id ? p.color : C.textMuted,
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
              }}>{p.name}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          <Stat label="Total Pipeline" value={`$${(totalPipeline/1000).toFixed(0)}K`} color={C.green} />
          <Stat label="Qualified" value={totalQualified} color={C.accent} sub={`of ${accounts.length}`} />
          <Stat label="Avg Intent" value={avgIntent} color={C.orange} />
          <Stat label="Comp. Risk" value={highCompRisk} color={C.red} sub="High risk" />
          <Stat label="Avg Churn" value={Math.round(accounts.reduce((s,a) => s + (a.scoring[pid]?.churnRisk||0), 0)/accounts.length)} color={C.purple} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["scoring","stages","graph","insights"].map(t => <Tab key={t} active={mainTab===t} onClick={() => setMainTab(t)}>{
          t === "scoring" ? "Scoring Models" : t === "stages" ? "Buying Stages" : t === "graph" ? "Knowledge Graph" : "Insights"
        }</Tab>)}
      </div>

      {/* ── SCORING MODELS ── */}
      {mainTab === "scoring" && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* Scores overview cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "Intent Score", desc: "Keyword research, web activity, content consumption signals", avg: avgIntent, color: C.orange },
              { label: "ICP Fit", desc: "ML-based firmographic + technographic match scoring", avg: Math.round(accounts.reduce((s,a)=>s+(a.scoring[pid]?.icpFit||0),0)/accounts.length), color: C.blue },
              { label: "Qualification Score", desc: "Intent (80+) AND Fit (80+) — adjustable thresholds", avg: Math.round(accounts.reduce((s,a)=>s+(a.scoring[pid]?.qualificationScore||0),0)/accounts.length), color: C.accent },
            ].map((m, i) => (
              <div key={i} style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgCard }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>{m.desc}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: m.color }}>{m.avg}</div>
                  <div style={{ flex: 1 }}><Score value={m.avg} /></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Competitive Risk */}
            <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgCard }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Competitive Risk</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>Likelihood of losing opportunity to a named competitor</div>
              <div style={{ display: "grid", gap: 6 }}>
                {["High","Medium","Low","None"].map(level => {
                  const count = accounts.filter(a => a.scoring[pid]?.competitiveRisk === level).length;
                  return (
                    <div key={level} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
                      <Badge color={level==="High"?C.red:level==="Medium"?C.orange:level==="Low"?C.green:C.textDim} small>{level}</Badge>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border }}>
                        <div style={{ width: `${(count/accounts.length)*100}%`, height: "100%", borderRadius: 3, background: level==="High"?C.red:level==="Medium"?C.orange:level==="Low"?C.green:C.textDim }} />
                      </div>
                      <span style={{ color: C.text, fontWeight: 600, minWidth: 30, textAlign: "right" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Churn Risk */}
            <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgCard }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Churn Risk Distribution</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>Account-level churn probability (0–100)</div>
              <div style={{ display: "grid", gap: 6 }}>
                {[["Low (0-30)", 0, 30, C.green],["Medium (31-60)", 31, 60, C.orange],["High (61-80)", 61, 80, C.red],["Critical (81+)", 81, 100, "#ef4444"]].map(([label, min, max, color]) => {
                  const count = accounts.filter(a => { const cr = a.scoring[pid]?.churnRisk || 0; return cr >= min && cr <= max; }).length;
                  return (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
                      <span style={{ color, fontSize: 12, minWidth: 100 }}>{label}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border }}>
                        <div style={{ width: `${(count/accounts.length)*100}%`, height: "100%", borderRadius: 3, background: color }} />
                      </div>
                      <span style={{ color: C.text, fontWeight: 600, minWidth: 30, textAlign: "right" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Btn primary onClick={() => setVariantEditor(selectedProduct)}>Edit Model / Create Variant</Btn>
        </div>
      )}

      {/* ── BUYING STAGES ── */}
      {mainTab === "stages" && (
        <div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>
            Click any stage to drill down into accounts, activities, content, and pipeline.
            Stages are based on {selectedProduct.name} intent score ranges. Default thresholds are customizable.
          </div>
          {/* Stage bar chart */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, alignItems: "flex-end", height: 200 }}>
            {stageDistribution.map(s => {
              const maxCount = Math.max(...stageDistribution.map(x => x.count), 1);
              const pct = (s.count / maxCount) * 100;
              return (
                <div key={s.stage} onClick={() => setStageDrillDown(s)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.querySelector('.bar').style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.querySelector('.bar').style.opacity = "0.8"}
                >
                  <div className="bar" style={{
                    width: "80%", height: Math.max(20, pct * 1.6), borderRadius: "6px 6px 0 0",
                    background: `linear-gradient(180deg, ${s.color}, ${s.color}80)`,
                    opacity: 0.8, transition: "opacity 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{s.count}</span>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Stage {s.stage}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: C.textDim }}>{s.range[0]}–{s.range[1]}</div>
                    {s.pipeline > 0 && <div style={{ fontSize: 10, color: C.green }}>${(s.pipeline/1000).toFixed(0)}K</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Stage details table */}
          <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: "auto", background: C.bgCard }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><TH>Stage</TH><TH>Name</TH><TH>Range</TH><TH>Accounts</TH><TH>Qualified</TH><TH>Pipeline</TH><TH></TH></tr></thead>
              <tbody>
                {stageDistribution.map(s => (
                  <TR key={s.stage} onClick={() => setStageDrillDown(s)}>
                    <TD><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} /><span style={{ fontWeight: 700, color: C.text }}>Stage {s.stage}</span></div></TD>
                    <TD><span style={{ color: C.text }}>{s.name}</span></TD>
                    <TD><span style={{ color: C.textMuted }}>{s.range[0]}–{s.range[1]}</span></TD>
                    <TD><span style={{ color: C.text, fontWeight: 600 }}>{s.count}</span></TD>
                    <TD><span style={{ color: C.green, fontWeight: 600 }}>{s.qualified}</span></TD>
                    <TD><span style={{ color: C.accent }}>${(s.pipeline/1000).toFixed(0)}K</span></TD>
                    <TD><span style={{ color: C.accent, fontSize: 11 }}>Drill down →</span></TD>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── KNOWLEDGE GRAPH ── */}
      {mainTab === "graph" && (
        <div style={{ display: "flex", gap: 16 }}>
          <div ref={containerRef} style={{ flex: 1, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel, position: "relative", overflow: "hidden", minHeight: 440 }}>
            <svg width={dims.w} height={dims.h} style={{ display: "block" }}>
              {graphLinks.map((l, i) => { const s = positions.find(p => p.id === l.source), t = positions.find(p => p.id === l.target); if (!s||!t) return null; return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={l.color||C.border} strokeWidth="1" />; })}
              {positions.map(n => (
                <g key={n.id} onMouseEnter={() => setHoveredNode(n.id)} onMouseLeave={() => setHoveredNode(null)} onClick={() => { const gn = graphNodes.find(g => g.id === n.id); if (gn?.type === "account") onAccountClick(gn.data); else if (gn?.type === "contact") onContactClick(gn.data); }} style={{ cursor: "pointer" }}>
                  <circle cx={n.x} cy={n.y} r={hoveredNode === n.id ? n.size + 3 : n.size} fill={n.color + "40"} stroke={n.color} strokeWidth={hoveredNode === n.id ? 2.5 : 1.5} />
                  {(hoveredNode === n.id || n.size > 7) && <text x={n.x} y={n.y - n.size - 6} textAnchor="middle" fill={C.text} fontSize="9" fontFamily="inherit">{n.label.length > 18 ? n.label.slice(0, 18) + "…" : n.label}</text>}
                </g>
              ))}
            </svg>
            <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 12, fontSize: 10, color: C.textMuted }}>
              {[["Account",C.blue],["Contact",C.green],["Signal",C.orange]].map(([l,col]) => <div key={l} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:col+"60",border:`1.5px solid ${col}`}}/>{l}</div>)}
            </div>
          </div>
          <div style={{ width: 260, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgCard, padding: 16, overflow: "auto" }}>
            {hoveredNode ? (() => {
              const gn = graphNodes.find(g => g.id === hoveredNode);
              if (!gn) return null;
              const p = positions.find(x => x.id === hoveredNode);
              return <div>
                <Badge color={p?.color} small>{gn.type}</Badge>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginTop: 8, marginBottom: 8 }}>{p?.label}</div>
                {gn.type === "account" && <div style={{ fontSize: 12, color: C.textMuted }}>{gn.data.industry} · {gn.data.abmTier}<br/>Intent: {gn.data.scoring[pid]?.intentScore} · Fit: {gn.data.scoring[pid]?.icpFit}<br/><Btn small style={{marginTop:8}} onClick={()=>onAccountClick(gn.data)}>Open →</Btn></div>}
                {gn.type === "contact" && <div style={{ fontSize: 12, color: C.textMuted }}>{gn.data.title} at {gn.data.accountName}<br/><Btn small style={{marginTop:8}} onClick={()=>onContactClick(gn.data)}>Open →</Btn></div>}
                {gn.type === "signal" && <div style={{ fontSize: 12, color: C.textMuted }}>{gn.data.type} · {gn.data.date}<br/>{gn.data.personName && `Person: ${gn.data.personName}`}</div>}
              </div>;
            })() : <div style={{ color: C.textDim, fontSize: 12, textAlign: "center", paddingTop: 40 }}>Hover a node for details</div>}
          </div>
        </div>
      )}

      {/* ── INSIGHTS ── */}
      {mainTab === "insights" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.green}30`, background: C.green + "08" }}>
            <Badge color={C.green} small>OPPORTUNITY</Badge>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 8, marginBottom: 8 }}>Champion pattern at {accounts.filter(a => a.signals.some(s => s.direction === "Incoming")).length} accounts</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>Kim was CPO at LiveRamp championing Jira. Joined target account using ProductBoard. Keyword activity for "project management alternatives" rising, ProductBoard usage declining. High-confidence opportunity for Jira, churn risk for ProductBoard.</div>
          </div>
          <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.red}30`, background: C.red + "08" }}>
            <Badge color={C.red} small>CHURN RISK</Badge>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 8, marginBottom: 8 }}>{accounts.filter(a => a.scoring[pid]?.churnRisk > 70).length} accounts with critical churn risk</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>Accounts scoring 70+ on churn risk with declining engagement and departing decision-makers. Recommend executive outreach and success review.</div>
          </div>
          <div style={{ padding: 20, borderRadius: 8, border: `1px solid ${C.orange}30`, background: C.orange + "08" }}>
            <Badge color={C.orange} small>COMPETITIVE</Badge>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 8, marginBottom: 8 }}>{highCompRisk} accounts with high competitive risk</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              Top competitors: {(() => { const comp = {}; accounts.forEach(a => { const c = a.scoring[pid]?.competitor; if (c) comp[c] = (comp[c]||0)+1; }); return Object.entries(comp).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c,n])=>`${c} (${n})`).join(", "); })()}.
              Recommend competitive displacement campaigns targeting these accounts.
            </div>
          </div>
        </div>
      )}

      {variantEditor && <ModelVariantEditor product={variantEditor} accounts={accounts} onClose={() => setVariantEditor(null)} />}
    </div>
  );
}
