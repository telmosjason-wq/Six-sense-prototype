import React, { useState, useEffect, useRef } from 'react';
import { C } from '../components/ui/theme';
import { Badge, Btn, Tab, Inp, Sel, Modal, SectionLabel } from '../components/ui';
import { Icons } from '../components/Icons';
import { CONTENT_ITEMS } from '../data/constants';

function buildSystemPrompt(accounts, contacts) {
  const highIntent = accounts.filter(a => a.intentLevel === "High");
  const hiringAccounts = accounts.filter(a => a.signalFields?.hiring_ai);
  const departureAccounts = accounts.filter(a => a.signalFields?.recent_departure);
  const champions = contacts.filter(c => c.archetype === "Champion" && !c.isHidden);

  const topAccounts = accounts.slice(0, 20).map(a =>
    `${a.name}: ${a.industry}, ${a.abmTier}, intent=${a.intentLevel}, score=${a.sixsenseScore}, stage=${a.stage}, signals=${a.signals.length}${a.signalFields?.hiring_ai ? ', hiring AI' : ''}${a.signalFields?.funding_event ? ', funded' : ''}${a.signalFields?.recent_departure ? ', departure' : ''}`
  ).join('\n');

  const topContacts = contacts.filter(c => !c.isHidden && (c.signals.length > 0 || c.archetype === "Champion")).slice(0, 15).map(c =>
    `${c.name}: ${c.title} at ${c.accountName}, archetype=${c.archetype || 'none'}, signals=${c.signals.length}${c.formerCompanies.length > 0 ? ', former: ' + c.formerCompanies.map(f => f.name).join('+') : ''}`
  ).join('\n');

  return `You are RevvyAI, an AI assistant for 6sense, a B2B GTM intelligence platform. You help users find accounts, surface insights, create signals, build audiences, and analyze buying groups.

LIVE DATASET:
- ${accounts.length} accounts (${highIntent.length} high-intent, ${hiringAccounts.length} hiring AI, ${departureAccounts.length} with departures)
- ${contacts.filter(c => !c.isHidden).length} visible contacts, ${champions.length} champions
- ${contacts.filter(c => c.isHidden).length} hidden/locked contacts

KEY ACCOUNTS:
${topAccounts}

KEY CONTACTS:
${topContacts}

TOP CONTENT:
${CONTENT_ITEMS.slice(0, 5).map(c => `${c.title} (${c.type}) - ${c.engagements?.length || 0} contacts`).join('\n')}

Be concise, data-driven, reference specific accounts/contacts. Be proactive with suggestions.`;
}

async function callClaude(messages, systemPrompt) {
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }))
      })
    });
    const data = await resp.json();
    return data.content?.map(b => b.type === "text" ? b.text : "").filter(Boolean).join("\n") || null;
  } catch (e) { return null; }
}

function cannedRespond(msg, accounts, contacts) {
  const l = msg.toLowerCase();
  if (l.includes("high intent")) {
    const hi = accounts.filter(a => a.intentLevel === "High");
    return `Found ${hi.length} high-intent accounts:\n\n${hi.slice(0, 5).map((a, i) => `${i + 1}. ${a.name} — ${a.industry}, Score: ${a.sixsenseScore}, ${a.abmTier}`).join("\n")}\n\nCreate an audience or dig deeper?`;
  }
  if (l.includes("champion") || l.includes("buying group")) {
    const ch = contacts.filter(c => c.archetype === "Champion" && !c.isHidden);
    return `${ch.length} champions found:\n\n${ch.slice(0, 3).map(c => `- ${c.name} (${c.title}) at ${c.accountName}${c.buyingGroupActivity.length > 0 ? ' — ' + c.buyingGroupActivity[0].note : ''}`).join("\n")}`;
  }
  if (l.includes("insight") || l.includes("intelligence"))
    return `Graph highlights:\n\n🔥 ${accounts.filter(a => a.signals.length > 1).length} accounts with signal convergence\n👤 ${contacts.filter(c => c.archetype === "Champion" && !c.isHidden).length} champions\n📈 ${accounts.filter(a => a.signalFields?.hiring_ai).length} hiring AI\n⚠️ ${accounts.filter(a => a.signalFields?.recent_departure).length} departures`;
  if (l.includes("content")) {
    const top = [...CONTENT_ITEMS].sort((a, b) => (b.engagements?.length || 0) - (a.engagements?.length || 0)).slice(0, 3);
    return `Top content:\n\n${top.map((c, i) => `${i + 1}. ${c.title} — ${c.engagements?.length || 0} contacts`).join("\n")}`;
  }
  return "Try: high intent accounts, champions, insights, content performance, hiring AI, or describe what you need.";
}

export default function RevvyAI({ onClose, accounts, contacts }) {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hey! I'm RevvyAI. I have access to all your account data, signals, contacts, and content. Ask me anything — or try one of the quick actions below." }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [agentTab, setAgentTab] = useState("chat");
  const [useLLM, setUseLLM] = useState(true);
  const [agents, setAgents] = useState([
    { id: 1, name: "Weekly Pipeline Alert", status: "Active", schedule: "Every Friday 9AM", task: "Slack: accounts added to High-Intent this week", lastRun: "2026-03-14", history: [{ date: "2026-03-14", result: "Sent: 12 accounts added" }, { date: "2026-03-07", result: "Sent: 8 accounts added" }] },
    { id: 2, name: "Champion Tracker", status: "Active", schedule: "Daily", task: "Alert on champion job changes at target accounts", lastRun: "2026-03-16", history: [{ date: "2026-03-16", result: "No changes" }, { date: "2026-03-15", result: "Alert: Kim Chen moved to Vertexai" }] },
  ]);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", task: "", schedule: "Daily" });
  const [expandedAgent, setExpandedAgent] = useState(null);
  const ref = useRef(null);
  const sysPrompt = useRef(buildSystemPrompt(accounts, contacts));

  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || typing) return;
    const msg = input.trim();
    setMessages(m => [...m, { role: "user", text: msg }]);
    setInput(""); setTyping(true);

    if (useLLM) {
      const hist = [...messages.filter(m => m.role !== "system"), { role: "user", text: msg }];
      const resp = await callClaude(hist, sysPrompt.current);
      setMessages(m => [...m, { role: "assistant", text: resp || cannedRespond(msg, accounts, contacts) }]);
    } else {
      await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
      setMessages(m => [...m, { role: "assistant", text: cannedRespond(msg, accounts, contacts) }]);
    }
    setTyping(false);
  };

  const quickActions = ["Show me high intent accounts", "What insights are there?", "Accounts hiring AI engineers", "Who are our champions?", "Content performance", "Signal convergence"];

  return (
    <Modal title="RevvyAI" onClose={onClose} wide>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <Tab active={agentTab === "chat"} onClick={() => setAgentTab("chat")}>Chat</Tab>
        <Tab active={agentTab === "agents"} onClick={() => setAgentTab("agents")}>Agents ({agents.length})</Tab>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: C.textDim }}>LLM</span>
          <button onClick={() => setUseLLM(!useLLM)} style={{ width: 36, height: 20, borderRadius: 10, border: "none", background: useLLM ? C.accent : C.border, cursor: "pointer", position: "relative" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.text, position: "absolute", top: 2, left: useLLM ? 18 : 2, transition: "left 0.2s" }} />
          </button>
        </div>
      </div>

      {agentTab === "chat" && (
        <div style={{ display: "flex", flexDirection: "column", height: 480 }}>
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "80%", padding: "10px 16px", borderRadius: 12, background: m.role === "user" ? C.accent + "20" : C.bgPanel, border: `1px solid ${m.role === "user" ? C.accent + "40" : C.border}`, color: C.text, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {m.role === "assistant" && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ color: C.accent }}>{Icons.bot}</span><span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>RevvyAI</span>{useLLM && i > 0 && <Badge color={C.purple} small>LLM</Badge>}</div>}
                  {m.text.split("\n").map((line, j) => <div key={j}>{line.replace(/\*\*(.*?)\*\*/g, "$1") || "\u00A0"}</div>)}
                </div>
              </div>
            ))}
            {typing && <div style={{ display: "flex", gap: 6, padding: "10px 16px" }}><span style={{ color: C.accent }}>{Icons.bot}</span><span style={{ fontSize: 13, color: C.textMuted }}>{useLLM ? "Reasoning over your data..." : "Thinking..."}</span></div>}
            <div ref={ref} />
          </div>
          {messages.length <= 2 && <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>{quickActions.map(q => <button key={q} onClick={() => setInput(q)} style={{ padding: "4px 10px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>)}</div>}
          <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            <Inp value={input} onChange={setInput} placeholder="Ask RevvyAI..." style={{ flex: 1 }} />
            <Btn primary onClick={handleSend} disabled={!input.trim() || typing}>{Icons.send}</Btn>
          </div>
        </div>
      )}

      {agentTab === "agents" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: C.textMuted }}>{agents.length} agents</span>
            <Btn primary small onClick={() => setCreatingAgent(true)}>{Icons.plus} Create Agent</Btn>
          </div>
          {agents.map(a => (
            <div key={a.id} style={{ borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgPanel, overflow: "hidden", marginBottom: 12 }}>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{a.name}</span><Badge color={a.status === "Active" ? C.green : C.textMuted} small>{a.status}</Badge></div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{a.task}</div>
                <div style={{ fontSize: 11, color: C.textDim }}>Schedule: {a.schedule} · Last: {a.lastRun}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <Btn small onClick={() => setExpandedAgent(expandedAgent === a.id ? null : a.id)}>{expandedAgent === a.id ? "Hide Log" : "Run History"}</Btn>
                  <Btn small>Edit</Btn>
                  <Btn small>{Icons.play} Run Now</Btn>
                  <Btn small style={{ color: a.status === "Active" ? C.orange : C.green }}>{a.status === "Active" ? "Pause" : "Resume"}</Btn>
                </div>
              </div>
              {expandedAgent === a.id && (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  <SectionLabel>Execution Log</SectionLabel>
                  {(a.history || []).map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, fontSize: 12, marginBottom: 4, alignItems: "center" }}>
                      <span style={{ color: C.textDim, minWidth: 80 }}>{r.date}</span>
                      <Badge color={r.result.includes("Alert") ? C.orange : C.green} small>{r.result.includes("Alert") ? "Alert" : "OK"}</Badge>
                      <span style={{ color: C.textMuted }}>{r.result}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {creatingAgent && (
            <div style={{ marginTop: 16, padding: 20, borderRadius: 8, border: `1px solid ${C.accent}30`, background: C.accent + "08" }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: C.accent, marginBottom: 16 }}>New Agent</h4>
              <div style={{ display: "grid", gap: 12 }}>
                <Inp value={newAgent.name} onChange={v => setNewAgent({ ...newAgent, name: v })} placeholder="Agent name" />
                <textarea value={newAgent.task} onChange={e => setNewAgent({ ...newAgent, task: e.target.value })} placeholder="What should this agent do?" style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgPanel, color: C.text, fontSize: 13, fontFamily: "inherit", minHeight: 70, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Schedule</label><Sel value={newAgent.schedule} onChange={v => setNewAgent({ ...newAgent, schedule: v })} options={["Hourly","Daily","Weekly","Monthly","On trigger"]} /></div>
                  <div><label style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Channel</label><Sel value={newAgent.channel || "Slack"} onChange={v => setNewAgent({ ...newAgent, channel: v })} options={["Slack","Email","In-app","Webhook"]} /></div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Btn onClick={() => setCreatingAgent(false)}>Cancel</Btn>
                  <Btn primary onClick={() => { setAgents([...agents, { id: agents.length + 1, name: newAgent.name || "New Agent", status: "Active", schedule: newAgent.schedule, task: newAgent.task, lastRun: "—", history: [] }]); setCreatingAgent(false); setNewAgent({ name: "", task: "", schedule: "Daily" }); }}>Create</Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
