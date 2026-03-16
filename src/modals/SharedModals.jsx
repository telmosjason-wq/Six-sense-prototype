import React, { useState } from 'react';
import { C } from '../components/ui/theme';
import { Badge, Btn, Tab, Inp, Sel, Modal, Stat, SectionLabel, TH, TR, TD } from '../components/ui';
import { Icons } from '../components/Icons';
import { EXT_SYSTEMS } from '../data/constants';
import { randInt } from '../data/generators';

// ─── Signal Config Modal ─────────────────────────────────────────────────────
export function SignalConfigModal({ signal, onClose, onSave, isNew }) {
  const [name, setName] = useState(signal?.name || "");
  const [type, setType] = useState(signal?.type || "Direct");
  const [nature, setNature] = useState(signal?.nature || "Event");
  const [measure, setMeasure] = useState(signal?.measure || "Qualitative");
  const [desc, setDesc] = useState(signal?.description || "");
  const [criteria, setCriteria] = useState(signal?.criteria || "");
  const [fieldMappings, setFieldMappings] = useState([{ field: "", value: "" }]);
  const [simulated, setSimulated] = useState(false);
  const ta = { width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.bgPanel, color: C.text, fontSize: 13, fontFamily: "inherit", minHeight: 60, resize: "vertical", outline: "none", boxSizing: "border-box" };

  return (
    <Modal title={isNew ? "Configure New Signal" : `Edit: ${signal.name}`} onClose={onClose}>
      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Signal Name</label>
          <Inp value={name} onChange={setName} placeholder="e.g., Job Change (VP Marketing Ops)" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Type</label><Sel value={type} onChange={setType} options={["Direct","Derived"]} /></div>
          <div><label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nature</label><Sel value={nature} onChange={setNature} options={["Event","Trend"]} /></div>
          <div><label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Measure</label><Sel value={measure} onChange={setMeasure} options={["Qualitative","Quantitative"]} /></div>
        </div>
        <div><label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Description</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What this signal detects..." style={ta} /></div>
        <div><label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Trigger Criteria</label><textarea value={criteria} onChange={e => setCriteria(e.target.value)} placeholder="Define conditions..." style={ta} /></div>
        <div>
          <label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Field Mappings <span style={{ color: C.textDim }}>(signal → record attribute)</span></label>
          {fieldMappings.map((fm, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <Inp value={fm.field} onChange={v => { const n = [...fieldMappings]; n[i].field = v; setFieldMappings(n); }} placeholder="Field name (e.g. job_change)" style={{ flex: 1 }} />
              <Inp value={fm.value} onChange={v => { const n = [...fieldMappings]; n[i].value = v; setFieldMappings(n); }} placeholder="Value (e.g. true)" style={{ flex: 1 }} />
            </div>
          ))}
          <Btn small onClick={() => setFieldMappings([...fieldMappings, { field: "", value: "" }])}>{Icons.plus} Add Mapping</Btn>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <Btn onClick={() => setSimulated(true)} small>{Icons.play} Simulate</Btn>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn primary onClick={() => onSave({ name, type, nature, measure, description: desc, criteria })}>{isNew ? "Create Signal" : "Save"}</Btn>
          </div>
        </div>
        {simulated && (
          <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${C.green}30`, background: C.green + "08" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.green }}>{Icons.check}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>Simulation: Would trigger on {randInt(3, 12)} accounts and {randInt(8, 45)} contacts</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Audience Builder ────────────────────────────────────────────────────────
export function AudienceBuilder({ onClose, accounts }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Dynamic");
  const [filters, setFilters] = useState([{ field: "intentLevel", op: "equals", value: "High" }]);
  const [preview, setPreview] = useState(null);
  const fields = [{ value: "intentLevel", label: "Intent Level" },{ value: "industry", label: "Industry" },{ value: "stage", label: "Buying Stage" },{ value: "size", label: "Company Size" },{ value: "sixsenseScore", label: "6sense Score" },{ value: "abmTier", label: "ABM Tier" }];
  const runPreview = () => {
    let r = [...accounts];
    filters.forEach(f => {
      if (f.field === "sixsenseScore") { const v = parseInt(f.value) || 0; r = r.filter(a => f.op === "greater_than" ? a.sixsenseScore > v : a.sixsenseScore <= v); }
      else r = r.filter(a => a[f.field] === f.value);
    });
    setPreview(r);
  };
  return (
    <Modal title="Create Audience" onClose={onClose} wide>
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <div><label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Audience Name</label><Inp value={name} onChange={setName} placeholder="e.g., High-Intent Enterprise" /></div>
          <div><label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Type</label><Sel value={type} onChange={setType} options={["Dynamic","Static","Iterative"]} /></div>
        </div>
        <div>
          <label style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Filter Criteria</label>
          {filters.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              {i > 0 && <span style={{ fontSize: 11, color: C.accent, fontWeight: 700, minWidth: 32 }}>AND</span>}
              <Sel value={f.field} onChange={v => { const n = [...filters]; n[i].field = v; setFilters(n); }} options={fields} />
              <Sel value={f.op} onChange={v => { const n = [...filters]; n[i].op = v; setFilters(n); }} options={[{ value: "equals", label: "equals" },{ value: "not_equals", label: "not equals" },{ value: "greater_than", label: ">" },{ value: "less_than", label: "<" }]} />
              <Inp value={f.value} onChange={v => { const n = [...filters]; n[i].value = v; setFilters(n); }} placeholder="Value" style={{ flex: 1 }} />
              {filters.length > 1 && <button onClick={() => setFilters(filters.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 16 }}>×</button>}
            </div>
          ))}
          <Btn small onClick={() => setFilters([...filters, { field: "industry", op: "equals", value: "" }])}>{Icons.plus} Add Filter</Btn>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
          <Btn onClick={runPreview} small>{Icons.play} Preview Audience</Btn>
          <Btn primary disabled={!name}>Create Audience</Btn>
        </div>
        {preview && (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.accent, marginBottom: 12 }}>Preview: {preview.length} accounts match</div>
            <div style={{ maxHeight: 200, overflow: "auto", borderRadius: 8, border: `1px solid ${C.border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr>{["Account","Industry","Intent","Score","ABM Tier"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
                <tbody>{preview.slice(0, 20).map(a => (
                  <TR key={a.id}>
                    <TD><span style={{ color: C.text, fontWeight: 600 }}>{a.name}</span></TD>
                    <TD><span style={{ color: C.textMuted }}>{a.industry}</span></TD>
                    <TD><Badge color={a.intentLevel === "High" ? C.green : C.orange} small>{a.intentLevel}</Badge></TD>
                    <TD>{a.sixsenseScore}</TD>
                    <TD><Badge color={a.abmTier === "1:1" ? C.accent : a.abmTier === "1:Few" ? C.purple : C.textMuted} small>{a.abmTier}</Badge></TD>
                  </TR>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Enrich Modal ────────────────────────────────────────────────────────────
export function EnrichModal({ onClose, onAdd }) {
  const [system, setSystem] = useState(EXT_SYSTEMS[0].name);
  const [selected, setSelected] = useState([]);
  const sys = EXT_SYSTEMS.find(s => s.name === system);
  return (
    <Modal title="Bring in Data from External System" onClose={onClose}>
      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <SectionLabel>Select System</SectionLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EXT_SYSTEMS.map(s => (
              <button key={s.name} onClick={() => { setSystem(s.name); setSelected([]); }} style={{
                padding: "10px 20px", borderRadius: 8, border: `2px solid ${system === s.name ? C.accent : C.border}`,
                background: system === s.name ? C.accent + "10" : C.bgPanel,
                color: system === s.name ? C.accent : C.textMuted,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 8
              }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span> {s.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Available Fields</SectionLabel>
          <div style={{ display: "grid", gap: 6 }}>
            {sys.fields.map(f => (
              <div key={f} onClick={() => setSelected(selected.includes(f) ? selected.filter(x => x !== f) : [...selected, f])} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 6,
                border: `1px solid ${selected.includes(f) ? C.accent : C.border}`,
                background: selected.includes(f) ? C.accent + "08" : C.bgPanel,
                cursor: "pointer", fontSize: 13, color: C.text
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: `2px solid ${selected.includes(f) ? C.accent : C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: selected.includes(f) ? C.accent : "transparent"
                }}>
                  {selected.includes(f) && <span style={{ color: C.bg, fontSize: 12 }}>✓</span>}
                </div>
                {f}
                <span style={{ marginLeft: "auto", fontSize: 11, color: C.textDim }}>{system}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary disabled={!selected.length} onClick={() => { onAdd(selected.map(f => ({ key: f, source: system }))); onClose(); }}>
            Add {selected.length} Field{selected.length !== 1 ? "s" : ""}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

