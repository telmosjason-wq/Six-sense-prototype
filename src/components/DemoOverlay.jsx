import React, { useState, useEffect, useCallback } from 'react';
import { ACT_NAMES } from '../data/demoScript';

export default function DemoOverlay({ step, totalSteps, stepIdx, onNext, onPrev, onClose }) {
  if (!step) return null;

  const progress = ((stepIdx + 1) / totalSteps) * 100;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") onNext();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, onClose]);

  const isFinale = step.highlight === "finale";
  const isTakeaway = step.highlight === "takeaway";

  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 9999,
      width: 380, background: "#fff", borderRadius: 14,
      boxShadow: "0 12px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)",
      overflow: "hidden", fontFamily: "'DM Sans', system-ui, sans-serif",
      transition: "all 0.2s ease",
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: "#f3f4f6" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #0D9488, #7C3AED)", transition: "width 0.4s ease" }} />
      </div>

      {/* Header */}
      <div style={{ padding: "10px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: "50%", background: "#0D9488", color: "#fff",
            fontSize: 11, fontWeight: 800
          }}>{step.act}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0D9488", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {step.actTitle}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#9ca3af" }}>{stepIdx + 1}/{totalSteps}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#9ca3af", cursor: "pointer",
            fontSize: 14, lineHeight: 1, padding: 0
          }}>✕</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "4px 16px 12px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1d23", marginBottom: 6, lineHeight: 1.3 }}>
          {step.title}
        </div>
        <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65 }}>
          {step.narration}
        </div>

        {isTakeaway && (
          <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12 }}>💡</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>Key Takeaway</span>
          </div>
        )}
        {isFinale && (
          <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "linear-gradient(135deg, #ECFDF5, #F0FDFA)", border: "1px solid #99F6E4" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0D9488" }}>✨ Signal → Audience → Workflow → Action</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ padding: "8px 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6" }}>
        <button onClick={onPrev} disabled={stepIdx === 0} style={{
          padding: "6px 14px", borderRadius: 6, border: "1px solid #e5e7eb",
          background: "#fff", color: stepIdx === 0 ? "#d1d5db" : "#6b7280",
          fontSize: 12, fontWeight: 600, cursor: stepIdx === 0 ? "default" : "pointer", fontFamily: "inherit"
        }}>← Back</button>
        <div style={{ display: "flex", gap: 4 }}>
          {Object.keys(ACT_NAMES).map(n => (
            <div key={n} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: parseInt(n) === step.act ? "#0D9488" : parseInt(n) < step.act ? "#0D948860" : "#e5e7eb",
              transition: "all 0.2s"
            }} />
          ))}
        </div>
        <button onClick={onNext} style={{
          padding: "6px 14px", borderRadius: 6, border: "none",
          background: "#0D9488", color: "#fff",
          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
        }}>
          {stepIdx === totalSteps - 1 ? "Finish ✓" : "Next →"}
        </button>
      </div>
    </div>
  );
}
