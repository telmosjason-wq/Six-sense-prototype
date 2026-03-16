import React, { useState, useEffect, useRef } from 'react';
import { C } from '../components/ui/theme';
import { Badge, Btn, Tab, Inp, Sel, Modal } from '../components/ui';
import { Icons } from '../components/Icons';
import { CONTENT_ITEMS } from '../data/constants';
import { randInt } from '../data/generators';

export default function RevvyAI({ onClose, accounts, contacts }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey! I'm RevvyAI, your GTM intelligence assistant. I can help you find accounts, surface insights, create signals, build audiences, and more. What can I help with?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [agentTab, setAgentTab] = useState("chat");
  const [agents, setAgents] = useState([
    { id: 1, name: "Weekly Pipeline Alert", status: "Active", schedule: "Every Friday 9:00 AM", task: "Send Slack message with # of accounts added to High-Intent Enterprise audience this week", lastRun: "2026-03-14" },
    { id: 2, name: "Champion Tracker", status: "Active", schedule: "Daily", task: "Monitor for champion job changes and alert when detected at target accounts", lastRun: "2026-03-16" },
  ]);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", task: "", schedule: "Daily" });
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const respond = (userMsg) => {
    const lower = userMsg.toLowerCase();
    if (lower.includes("high intent") || lower.includes("high-intent")) {
      const hi = accounts.filter(a => a.intentLevel === "High");
      return `Found ${hi.length} high-intent accounts. Top 5:\n\n${hi.slice(0, 5).map((a, i) => `${i + 1}. **${a.name}** — ${a.industry}, Score: ${a.sixsenseScore}, ${a.abmTier} tier`).join("\n")}\n\nWant me to create an audience from these, or dig deeper into any of them?`;
    }
    if (lower.includes("signal") && (lower.includes("create") || lower.includes("new") || lower.includes("configure"))) {
      return "I can help you configure a new signal. What behavior or event do you want to detect?\n\n- Job changes for specific titles\n- Funding/M&A events\n- Hiring trends for specific roles\n- Technology adoption/removal\n- Keyword research spikes\n\nTell me what you're looking for and I'll set it up.";
    }
    if (lower.includes("audience") && (lower.includes("create") || lower.includes("build"))) {
      return "Let's build an audience. I'll need:\n\n1. **Name** — What should we call this audience?\n2. **Type** — Dynamic (auto-updates), Static, or Iterative?\n3. **Criteria** — What filters? (e.g., industry, intent level, signals, ABM tier)\n\nOr just describe who you want to target and I'll figure out the filters.";
    }
    if (lower.includes("champion") || lower.includes("buying group")) {
      const champions = contacts.filter(c => c.archetype === "Champion" && !c.isHidden);
      return `I found ${champions.length} identified champions across your accounts.\n\n${champions.slice(0, 3).map(c => `- **${c.name}** (${c.title}) at ${c.accountName}${c.buyingGroupActivity.length > 0 ? ` — ${c.buyingGroupActivity[0].note}` : ""}`).join("\n")}\n\nWant me to identify potential champions at accounts where the buying group is incomplete?`;
    }
    if (lower.includes("content")) {
      const top = [...CONTENT_ITEMS].sort((a, b) => (b.engagements?.length || 0) - (a.engagements?.length || 0)).slice(0, 3);
      return `Top-performing content:\n\n${top.map((c, i) => `${i + 1}. **${c.title}** (${c.type}) — ${c.engagements?.length || 0} contacts engaged, ${c.accountsEngaged?.length || 0} accounts`).join("\n")}\n\nWant me to recommend content for a specific audience or persona?`;
    }
    if (lower.includes("insight") || lower.includes("intelligence") || lower.includes("graph")) {
      return `Here's what the Contextual Intelligence Graph is surfacing:\n\n🔥 **${accounts.filter(a => a.signals.length > 1).length} accounts** showing signal convergence\n👤 **${contacts.filter(c => c.archetype === "Champion" && !c.isHidden).length} champions** identified across target accounts\n📈 **Hiring trend** for AI roles across ${accounts.filter(a => a.signalFields?.hiring_ai).length} accounts\n⚠️ **${accounts.filter(a => a.signalFields?.recent_departure).length} accounts** with recent departures\n\nWant me to drill into any of these?`;
    }
    return "I can help with that! Here are some things I'm great at:\n\n- **Find accounts or contacts** matching specific criteria\n- **Surface insights** from the intelligence graph\n- **Create signals, audiences, or workflows**\n- **Analyze buying groups** and recommend next steps\n- **Content performance** and recommendations\n- **Monitor and alert** on changes in your pipeline\n\nWhat would you like to explore?";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages(m => [...m, { role: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: "assistant", text: respond(msg) }]);
      setTyping(false);
    }, 800 + Math.random() * 1200);
  };

  return (
    <Modal title="RevvyAI" onClose={onClose} wide>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab active={agentTab === "chat"} onClick={() => setAgentTab("chat")}>Chat</Tab>
        <Tab active={agentTab === "agents"} onClick={() => setAgentTab("agents")}>Agents</Tab>
      </div>

      {agentTab === "chat" && (
        <div style={{ display: "flex", flexDirection: "column", height: 440 }}>
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 16px", borderRadius: 12,
                  background: m.role === "user" ? C.accent + "20" : C.bgPanel,
                  border: `1px solid ${m.role === "user" ? C.accent + "40" : C.border}`,
                  color: C.text, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap"
                }}>
                  {m.role === "assistant" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ color: C.accent }}>{Icons.bot}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>RevvyAI</span>
                    </div>
                  )}
                  {m.text.split("\n").map((line, j) => {
                    const clean = line.replace(/\*\*(.*?)\*\*/g, "$1");
                    return <div key={j}>{clean || "\u00A0"}</div>;
                  })}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 6, padding: "10px 16px" }}>
                <span style={{ color: C.accent }}>{Icons.bot}</span>
                <span style={{ fontSize: 13, color: C.textMuted }}>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            <Inp value={input} onChange={setInput} placeholder="Ask RevvyAI anything..." style={{ flex: 1 }} />
            <Btn primary onClick={handleSend} disabled={!input.trim()}>{Icons.send}</Btn>
          </div>
        </div>
      )}

      {agentTab === "agents" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: C.textMuted }}>{agents.length} active agents</div>
            <Btn primary small onClick={() => setCreatingAgent(true)}>{Icons.plus} Create Agent</Btn>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {agents.map(a => (
              <div key={a.id} style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{a.name}</span>
                  <Badge color={a.status === "Active" ? C.green : C.textMuted} small>{a.status}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{a.task}</div>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.textDim }}>
                  <span>Schedule: {a.schedule}</span><span>Last run: {a.lastRun}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <Btn small>Edit</Btn><Btn small>{Icons.play} Run Now</Btn>
                </div>
              </div>
            ))}
          </div>
          {creatingAgent && (
            <div style={{ marginTop: 20, padding: 20, borderRadius: 8, border: `1px solid ${C.accent}30`, background: C.accent + "08" }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 16 }}>New Agent</h4>
              <div style={{ display: "grid", gap: 12 }}>
                <Inp value={newAgent.name} onChange={v => setNewAgent({ ...newAgent, name: v })} placeholder="Agent name" />
                <textarea value={newAgent.task} onChange={e => setNewAgent({ ...newAgent, task: e.target.value })}
                  placeholder="What should this agent do?"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgPanel, color: C.text, fontSize: 13, fontFamily: "inherit", minHeight: 60, resize: "vertical", outline: "none", boxSizing: "border-box" }}
                />
                <Sel value={newAgent.schedule} onChange={v => setNewAgent({ ...newAgent, schedule: v })} options={["Hourly","Daily","Weekly","Monthly","On trigger"]} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Btn onClick={() => setCreatingAgent(false)}>Cancel</Btn>
                  <Btn primary onClick={() => {
                    setAgents([...agents, { id: agents.length + 1, name: newAgent.name || "New Agent", status: "Active", schedule: newAgent.schedule, task: newAgent.task, lastRun: "—" }]);
                    setCreatingAgent(false);
                    setNewAgent({ name: "", task: "", schedule: "Daily" });
                  }}>Create Agent</Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
