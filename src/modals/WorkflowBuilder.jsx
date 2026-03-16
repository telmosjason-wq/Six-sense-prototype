import React, { useState, useRef, useCallback } from 'react';
import { C } from '../components/ui/theme';
import { Badge, Btn, Inp, Sel, Modal, SectionLabel } from '../components/ui';
import { Icons } from '../components/Icons';
import { CONTENT_ITEMS, AUDIENCES_DEFAULT } from '../data/constants';

const NODE_TYPES = {
  trigger: { color: C.accent, icon: "⚡", label: "Trigger" },
  decision: { color: C.orange, icon: "◇", label: "Decision" },
  action: { color: C.green, icon: "→", label: "Action" },
  llm: { color: C.purple, icon: "✦", label: "LLM" },
};

const TRIGGER_OPTIONS = [
  { value: "signal_fires", label: "Signal Fires", config: ["signalName"] },
  { value: "audience_membership", label: "Audience Membership", config: ["audienceName","condition"] },
  { value: "schedule", label: "Schedule / Cron", config: ["frequency","time"] },
];
const DECISION_OPTIONS = [
  { value: "filter", label: "Filter Logic", config: ["field","operator","value"] },
  { value: "external_data", label: "Bring in External Data", config: ["system","field","condition"] },
  { value: "llm_eval", label: "LLM Evaluation", config: ["prompt","threshold"] },
];
const ACTION_OPTIONS = [
  { value: "ai_email", label: "Send AI Email", config: ["sequence","template"] },
  { value: "ad_campaign", label: "Run Ad Campaign", config: ["campaign","budget"] },
  { value: "sync_map", label: "Sync to MAP", config: ["system","list"] },
  { value: "sync_crm", label: "Sync to CRM", config: ["system","object"] },
  { value: "slack", label: "Slack Notification", config: ["channel","message"] },
  { value: "enrich", label: "Enrich Record", config: ["source","fields"] },
  { value: "add_audience", label: "Add to Audience", config: ["audienceName"] },
  { value: "send_content", label: "Send Content", config: ["contentId","channel"] },
];

let _nextId = 10;

function NodeConfigPanel({ node, onUpdate, onDelete }) {
  if (!node) return (
    <div style={{ padding: 20, textAlign: "center", color: C.textDim, fontSize: 12 }}>
      Click a node to configure it, or add new nodes from the palette below.
    </div>
  );

  const nt = NODE_TYPES[node.type];
  return (
    <div style={{ padding: 12, borderRadius: 8, border: `1px solid ${nt.color}30`, background: nt.color + "08", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Badge color={nt.color}>{nt.label}</Badge>
        <button onClick={onDelete} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Remove</button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Label</label>
        <Inp value={node.label} onChange={v => onUpdate({ ...node, label: v })} placeholder="Node label" />
      </div>
      {node.type === "trigger" && (
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Trigger Type</label>
          <Sel value={node.config?.triggerType || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, triggerType: v } })} options={[{ value: "", label: "Select..." }, ...TRIGGER_OPTIONS.map(o => ({ value: o.value, label: o.label }))]} />
          {node.config?.triggerType === "signal_fires" && (
            <div style={{ marginTop: 6 }}>
              <Inp value={node.config?.signalName || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, signalName: v } })} placeholder="Signal name (e.g. Hiring Trend)" />
            </div>
          )}
          {node.config?.triggerType === "schedule" && (
            <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
              <Sel value={node.config?.frequency || "daily"} onChange={v => onUpdate({ ...node, config: { ...node.config, frequency: v } })} options={["daily","weekly","monthly","hourly"]} />
              <Inp value={node.config?.time || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, time: v } })} placeholder="9:00 AM" style={{ flex: 1 }} />
            </div>
          )}
        </div>
      )}
      {node.type === "decision" && (
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Decision Type</label>
          <Sel value={node.config?.decisionType || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, decisionType: v } })} options={[{ value: "", label: "Select..." }, ...DECISION_OPTIONS.map(o => ({ value: o.value, label: o.label }))]} />
          {node.config?.decisionType === "filter" && (
            <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
              <Inp value={node.config?.field || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, field: v } })} placeholder="Field (e.g. intentScore)" />
              <div style={{ display: "flex", gap: 6 }}>
                <Sel value={node.config?.operator || ">"} onChange={v => onUpdate({ ...node, config: { ...node.config, operator: v } })} options={[">","<","=","!=","contains"]} />
                <Inp value={node.config?.value || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, value: v } })} placeholder="Value" style={{ flex: 1 }} />
              </div>
            </div>
          )}
          {node.config?.decisionType === "llm_eval" && (
            <div style={{ marginTop: 6 }}>
              <textarea value={node.config?.prompt || ""} onChange={e => onUpdate({ ...node, config: { ...node.config, prompt: e.target.value } })} placeholder="LLM prompt: Evaluate whether this account is likely to..." style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgPanel, color: C.text, fontSize: 12, fontFamily: "inherit", minHeight: 50, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            </div>
          )}
        </div>
      )}
      {node.type === "action" && (
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Action Type</label>
          <Sel value={node.config?.actionType || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, actionType: v } })} options={[{ value: "", label: "Select..." }, ...ACTION_OPTIONS.map(o => ({ value: o.value, label: o.label }))]} />
          {node.config?.actionType === "ai_email" && (
            <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
              <Inp value={node.config?.sequence || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, sequence: v } })} placeholder="Sequence name" />
              <Inp value={node.config?.template || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, template: v } })} placeholder="Template (optional)" />
            </div>
          )}
          {node.config?.actionType === "slack" && (
            <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
              <Inp value={node.config?.channel || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, channel: v } })} placeholder="#channel" />
              <Inp value={node.config?.message || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, message: v } })} placeholder="Message template" />
            </div>
          )}
          {node.config?.actionType === "send_content" && (
            <div style={{ marginTop: 6 }}>
              <Sel value={node.config?.contentId || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, contentId: v } })} options={[{ value: "", label: "Select content..." }, ...CONTENT_ITEMS.map(c => ({ value: c.id, label: c.title }))]} />
            </div>
          )}
          {node.config?.actionType === "add_audience" && (
            <div style={{ marginTop: 6 }}>
              <Sel value={node.config?.audienceName || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, audienceName: v } })} options={[{ value: "", label: "Select audience..." }, ...AUDIENCES_DEFAULT.map(a => ({ value: a.name, label: a.name }))]} />
            </div>
          )}
          {(node.config?.actionType === "sync_map" || node.config?.actionType === "sync_crm") && (
            <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
              <Sel value={node.config?.system || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, system: v } })} options={[{ value: "", label: "System..." }, "Salesforce","HubSpot","Marketo","Outreach","Snowflake"]} />
              <Inp value={node.config?.list || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, list: v } })} placeholder="List / Object name" />
            </div>
          )}
        </div>
      )}
      {node.type === "llm" && (
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>LLM Prompt</label>
          <textarea value={node.config?.prompt || ""} onChange={e => onUpdate({ ...node, config: { ...node.config, prompt: e.target.value } })} placeholder="Analyze this account and determine..." style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgPanel, color: C.text, fontSize: 12, fontFamily: "inherit", minHeight: 60, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          <label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4, marginTop: 8 }}>Output Variable</label>
          <Inp value={node.config?.outputVar || ""} onChange={v => onUpdate({ ...node, config: { ...node.config, outputVar: v } })} placeholder="e.g. llm_score" />
        </div>
      )}
    </div>
  );
}

export default function WorkflowBuilder({ onClose }) {
  const [nodes, setNodes] = useState([
    { id: 1, type: "trigger", label: "Signal: Hiring Trend (AI Engineers)", x: 300, y: 40, config: { triggerType: "signal_fires", signalName: "Hiring Trend" } },
    { id: 2, type: "decision", label: "Intent Score > 70?", x: 300, y: 160, config: { decisionType: "filter", field: "intentScore", operator: ">", value: "70" } },
    { id: 3, type: "action", label: "Add to High-Intent Audience", x: 140, y: 300, config: { actionType: "add_audience", audienceName: "High-Intent Enterprise" } },
    { id: 4, type: "action", label: "Send AI Email Sequence", x: 140, y: 420, config: { actionType: "ai_email", sequence: "Enterprise Inbound" } },
    { id: 5, type: "action", label: "Add to Nurture Audience", x: 460, y: 300, config: { actionType: "add_audience", audienceName: "AI Adopters" } },
  ]);
  const [connections, setConnections] = useState([
    { from: 1, to: 2, label: "" },
    { from: 2, to: 3, label: "Yes" },
    { from: 2, to: 5, label: "No" },
    { from: 3, to: 4, label: "" },
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const canvasRef = useRef(null);

  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const node = nodes.find(n => n.id === nodeId);
    setDragging({ id: nodeId, offsetX: e.clientX - rect.left - node.x, offsetY: e.clientY - rect.top - node.y });
    setSelectedNode(nodeId);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 160, e.clientX - rect.left - dragging.offsetX));
    const y = Math.max(0, Math.min(rect.height - 40, e.clientY - rect.top - dragging.offsetY));
    setNodes(prev => prev.map(n => n.id === dragging.id ? { ...n, x, y } : n));
  }, [dragging]);

  const handleMouseUp = () => { setDragging(null); };

  const addNode = (type) => {
    const id = _nextId++;
    const defaultLabels = { trigger: "New Trigger", decision: "New Decision", action: "New Action", llm: "LLM Node" };
    setNodes(prev => [...prev, { id, type, label: defaultLabels[type], x: 200 + Math.random() * 200, y: 100 + Math.random() * 200, config: {} }]);
    setSelectedNode(id);
  };

  const updateNode = (updated) => {
    setNodes(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const deleteNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    setSelectedNode(null);
  };

  const startConnect = (e, fromId) => {
    e.stopPropagation();
    setConnecting(fromId);
  };

  const endConnect = (e, toId) => {
    e.stopPropagation();
    if (connecting && connecting !== toId && !connections.some(c => c.from === connecting && c.to === toId)) {
      const fromNode = nodes.find(n => n.id === connecting);
      setConnections(prev => [...prev, { from: connecting, to: toId, label: fromNode?.type === "decision" ? "Yes" : "" }]);
    }
    setConnecting(null);
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <Modal title="Workflow Builder" onClose={onClose} wide>
      <div style={{ display: "flex", gap: 16, height: 540 }}>
        {/* Canvas */}
        <div
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => { setSelectedNode(null); setConnecting(null); }}
          style={{
            flex: 1, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel,
            position: "relative", overflow: "hidden", cursor: dragging ? "grabbing" : "default"
          }}
        >
          {/* Grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.border} 1px, transparent 1px)`, backgroundSize: "20px 20px", opacity: 0.5 }} />

          {/* Connection lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {connections.map((conn, i) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              const x1 = fromNode.x + 80, y1 = fromNode.y + 36;
              const x2 = toNode.x + 80, y2 = toNode.y;
              const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
              const color = conn.label === "No" ? C.red : conn.label === "Yes" ? C.green : C.borderLight;
              return (
                <g key={i}>
                  <path d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`} stroke={color} strokeWidth="2" fill="none" strokeDasharray={conn.label ? "" : "6,4"} />
                  <circle cx={x2} cy={y2} r="3" fill={color} />
                  {conn.label && <text x={mx + 8} y={my - 4} fill={color} fontSize="10" fontFamily="inherit" fontWeight="600">{conn.label}</text>}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(n => {
            const nt = NODE_TYPES[n.type];
            const isSelected = selectedNode === n.id;
            return (
              <div
                key={n.id}
                onMouseDown={e => handleMouseDown(e, n.id)}
                onClick={e => { e.stopPropagation(); setSelectedNode(n.id); }}
                style={{
                  position: "absolute", left: n.x, top: n.y,
                  padding: "8px 16px", borderRadius: n.type === "decision" ? 12 : 8, minWidth: 140,
                  border: `2px solid ${isSelected ? nt.color : nt.color + "60"}`,
                  background: nt.color + (isSelected ? "20" : "10"),
                  color: nt.color, fontSize: 12, fontWeight: 600,
                  cursor: dragging?.id === n.id ? "grabbing" : "grab",
                  whiteSpace: "nowrap", zIndex: isSelected ? 10 : 1,
                  boxShadow: isSelected ? `0 0 20px ${nt.color}30` : "none",
                  userSelect: "none", transition: "box-shadow 0.15s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{nt.icon}</span>
                  <span>{n.label}</span>
                </div>
                {/* Connection handle */}
                <div
                  onMouseDown={e => startConnect(e, n.id)}
                  onMouseUp={e => endConnect(e, n.id)}
                  style={{
                    position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                    width: 12, height: 12, borderRadius: "50%",
                    background: connecting === n.id ? nt.color : C.border,
                    border: `2px solid ${nt.color}`,
                    cursor: "crosshair", zIndex: 20
                  }}
                />
                {/* Input handle */}
                <div
                  onMouseUp={e => endConnect(e, n.id)}
                  style={{
                    position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
                    width: 12, height: 12, borderRadius: "50%",
                    background: connecting ? nt.color + "40" : "transparent",
                    border: connecting ? `2px solid ${nt.color}` : "none",
                    cursor: connecting ? "pointer" : "default", zIndex: 20
                  }}
                />
              </div>
            );
          })}

          {/* Connecting indicator */}
          {connecting && (
            <div style={{ position: "absolute", top: 10, left: 10, padding: "6px 12px", borderRadius: 6, background: C.accent + "20", border: `1px solid ${C.accent}40`, fontSize: 11, color: C.accent, zIndex: 100 }}>
              Click a target node to connect · ESC to cancel
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>
          <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            {selectedNodeData ? "Configure Node" : "Node Palette"}
          </div>

          {/* Config panel for selected node */}
          <NodeConfigPanel
            node={selectedNodeData}
            onUpdate={updateNode}
            onDelete={() => deleteNode(selectedNode)}
          />

          {/* Palette */}
          <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 8, marginBottom: 4 }}>Add Node</div>
          {Object.entries(NODE_TYPES).map(([type, info]) => (
            <button key={type} onClick={() => addNode(type)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", borderRadius: 6,
              border: `1px solid ${info.color}40`, background: info.color + "08",
              color: info.color, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left", width: "100%"
            }}>
              <span style={{ fontSize: 14 }}>{info.icon}</span>
              {info.label}
            </button>
          ))}

          <div style={{ fontSize: 10, color: C.textDim, marginTop: 8, lineHeight: 1.5 }}>
            Drag nodes to position. Click bottom handle then click target to connect. Click node to configure.
          </div>

          <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
            <Btn onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
            <Btn primary style={{ flex: 1 }}>Save Workflow</Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}
