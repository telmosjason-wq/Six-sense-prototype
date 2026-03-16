import React, { useState, useEffect, useCallback } from 'react';
import { DEMO_STEPS, ACT_NAMES, HERO } from '../data/demoScript';

const OVERLAY_Z = 9000;

const styles = {
  backdrop: {
    position: "fixed", inset: 0, zIndex: OVERLAY_Z,
    background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    pointerEvents: "auto",
  },
  card: {
    background: "#fff", borderRadius: 16, maxWidth: 560, width: "90%",
    boxShadow: "0 24px 80px rgba(0,0,0,0.25)", overflow: "hidden",
  },
  actBar: {
    display: "flex", padding: "12px 24px", background: "#f8f9fb",
    borderBottom: "1px solid #e5e7eb", gap: 6, alignItems: "center",
  },
  actDot: (active, completed) => ({
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700,
    background: active ? "#0D9488" : completed ? "#0D948830" : "#f3f4f6",
    color: active ? "#fff" : completed ? "#0D9488" : "#9ca3af",
    transition: "all 0.2s",
  }),
  actLabel: (active) => ({
    fontSize: 11, color: active ? "#0D9488" : "#9ca3af",
    fontWeight: active ? 700 : 500, marginRight: 8,
  }),
  connector: {
    width: 16, height: 2, background: "#e5e7eb", flexShrink: 0,
  },
  body: {
    padding: "28px 28px 20px",
  },
  title: {
    fontSize: 20, fontWeight: 700, color: "#1a1d23", marginBottom: 8,
    letterSpacing: "-0.01em",
  },
  actTitle: {
    fontSize: 11, fontWeight: 700, color: "#0D9488", textTransform: "uppercase",
    letterSpacing: "0.06em", marginBottom: 12,
  },
  narration: {
    fontSize: 14, color: "#4b5563", lineHeight: 1.7, marginBottom: 0,
  },
  takeaway: {
    padding: "12px 16px", borderRadius: 8, background: "#ECFDF5",
    border: "1px solid #A7F3D0", marginTop: 16,
  },
  finale: {
    padding: "16px 20px", borderRadius: 8,
    background: "linear-gradient(135deg, #ECFDF5, #F0FDFA)",
    border: "1px solid #99F6E4", marginTop: 16,
  },
  footer: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 28px 20px", borderTop: "1px solid #f3f4f6",
  },
  btn: (primary) => ({
    padding: "10px 24px", borderRadius: 8,
    border: primary ? "none" : "1px solid #e5e7eb",
    background: primary ? "#0D9488" : "#fff",
    color: primary ? "#fff" : "#6b7280",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.15s",
  }),
  stepCount: {
    fontSize: 12, color: "#9ca3af", fontWeight: 500,
  },
  startScreen: {
    textAlign: "center", padding: "48px 32px",
  },
  startTitle: {
    fontSize: 28, fontWeight: 800, color: "#1a1d23",
    letterSpacing: "-0.02em", marginBottom: 8,
  },
  startSub: {
    fontSize: 15, color: "#6b7280", lineHeight: 1.6, maxWidth: 400,
    margin: "0 auto 32px",
  },
  startBtn: {
    padding: "14px 40px", borderRadius: 10, border: "none",
    background: "linear-gradient(135deg, #0D9488, #7C3AED)",
    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", boxShadow: "0 4px 20px rgba(13,148,136,0.3)",
  },
};

export default function DemoOverlay({ onClose, onNavigate, onAction }) {
  const [stepIdx, setStepIdx] = useState(-1); // -1 = start screen
  const step = stepIdx >= 0 ? DEMO_STEPS[stepIdx] : null;
  const currentAct = step?.act || 0;
  const totalSteps = DEMO_STEPS.length;

  // Handle keyboard
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stepIdx]);

  const handleNext = useCallback(() => {
    const nextIdx = stepIdx + 1;
    if (nextIdx >= totalSteps) { onClose(); return; }
    const nextStep = DEMO_STEPS[nextIdx];

    // Navigate to the right section
    if (nextStep.section && nextStep.section !== step?.section) {
      onNavigate(nextStep.section);
    }

    // Execute step action
    if (nextStep.action) {
      setTimeout(() => onAction(nextStep.action, nextStep), 300);
    }

    setStepIdx(nextIdx);
  }, [stepIdx, step, onNavigate, onAction, onClose, totalSteps]);

  const handlePrev = useCallback(() => {
    if (stepIdx <= 0) return;
    const prevStep = DEMO_STEPS[stepIdx - 1];
    if (prevStep.section) onNavigate(prevStep.section);
    setStepIdx(stepIdx - 1);
  }, [stepIdx, onNavigate]);

  const handleStart = () => {
    const firstStep = DEMO_STEPS[0];
    if (firstStep.section) onNavigate(firstStep.section);
    setStepIdx(0);
  };

  // Start screen
  if (stepIdx === -1) {
    return (
      <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.card} onClick={e => e.stopPropagation()}>
          <div style={styles.startScreen}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <div style={styles.startTitle}>6sense Product Demo</div>
            <div style={styles.startSub}>
              A guided walkthrough of the platform — from account intelligence
              to signals, audiences, and automated workflows. 6 acts, ~5 minutes.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
              {Object.entries(ACT_NAMES).map(([num, name]) => (
                <span key={num} style={{
                  padding: "4px 12px", borderRadius: 20, background: "#f3f4f6",
                  fontSize: 11, color: "#6b7280", fontWeight: 600
                }}>
                  {num}. {name}
                </span>
              ))}
            </div>
            <button onClick={handleStart} style={styles.startBtn}>
              Start Demo →
            </button>
            <div style={{ marginTop: 16, fontSize: 12, color: "#9ca3af" }}>
              Use arrow keys to navigate · ESC to exit
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.backdrop} onClick={e => { if (e.target === e.currentTarget) handleNext(); }}>
      <div style={styles.card} onClick={e => e.stopPropagation()}>
        {/* Act progress bar */}
        <div style={styles.actBar}>
          {Object.entries(ACT_NAMES).map(([num, name], i) => (
            <React.Fragment key={num}>
              {i > 0 && <div style={styles.connector} />}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={styles.actDot(currentAct === parseInt(num), currentAct > parseInt(num))}>
                  {currentAct > parseInt(num) ? "✓" : num}
                </div>
                <span style={styles.actLabel(currentAct === parseInt(num))}>
                  {name}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div style={styles.body}>
          <div style={styles.actTitle}>Act {step.act}: {step.actTitle}</div>
          <div style={styles.title}>{step.title}</div>
          <div style={styles.narration}>{step.narration}</div>

          {step.highlight === "takeaway" && (
            <div style={styles.takeaway}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>💡 Key Takeaway</span>
            </div>
          )}
          {step.highlight === "finale" && (
            <div style={styles.finale}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0D9488" }}>✨ Signal → Audience → Workflow → Action</span>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                The complete chain from data detection to automated response.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.stepCount}>
            Step {stepIdx + 1} of {totalSteps}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {stepIdx > 0 && (
              <button onClick={handlePrev} style={styles.btn(false)}>← Back</button>
            )}
            <button onClick={onClose} style={styles.btn(false)}>Exit Demo</button>
            <button onClick={handleNext} style={styles.btn(true)}>
              {stepIdx === totalSteps - 1 ? "Finish ✓" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
