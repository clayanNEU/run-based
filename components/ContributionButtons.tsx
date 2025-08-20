"use client";

import * as React from "react";
import { applyContribution, canDo, getTotals, getClientTotals } from "../lib/store";
import { pointsFor } from "../lib/points";

type Btn = { key: "ATTEND" | "HOST" | "PACE" | "SUPPLIES"; label: string; emoji: string; note: string };

const BUTTONS: Btn[] = [
  { key: "ATTEND",  label: "Attend",   emoji: "✅", note: `+${pointsFor("ATTEND")}` },
  { key: "HOST",    label: "Host",     emoji: "🏁", note: `+${pointsFor("HOST")}` },
  { key: "PACE",    label: "Pace",     emoji: "⏱️", note: `+${pointsFor("PACE")}` },
  { key: "SUPPLIES",label: "Supplies", emoji: "🧃", note: `+${pointsFor("SUPPLIES")}` },
];

export default function ContributionButtons() {
  const [totals, setTotals] = React.useState(getTotals()); // Start with server-safe defaults
  const [toast, setToast] = React.useState<string | null>(null);
  const [shareReady, setShareReady] = React.useState<{ title: string } | null>(null);
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://run-based.vercel.app";

  // Load client data after hydration
  React.useEffect(() => {
    setTotals(getClientTotals());
  }, []);

  async function onClick(key: Btn["key"]) {
    const check = canDo(key, totals);
    if (!check.ok) { setToast(check.reason || "Please try later"); setTimeout(()=>setToast(null), 1800); return; }

    // V1 mock: update local store; later swap to on-chain <Transaction />
    const t = applyContribution(key);
    setTotals({ ...t });

    const msg = successCopy(key);
    setToast(msg);
    setShareReady({ title: msg });
    setTimeout(() => setToast(null), 1800);
  }

  function successCopy(key: Btn["key"]) {
    switch (key) {
      case "ATTEND": return "Attendance logged! +10";
      case "HOST": return "Host logged! +50";
      case "PACE": return "Pacing logged! +20";
      case "SUPPLIES": return "Supplies logged! +15";
    }
  }

  async function onShare() {
    const text = shareReady?.title ? `${shareReady.title} — Stride & Rise` : "Stride & Rise Contributions";
    // Try Base MiniKit compose (inside Base App)
    if (typeof window !== "undefined" && window.minikit?.composeCast) {
      window.minikit.composeCast({ text: `${text} 🏃‍♀️`, embeds: [appUrl] });
      return;
    }
    // Fallback: copy link
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(appUrl as string);
      setToast("Link copied — share it!"); setTimeout(()=>setToast(null), 1500);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {BUTTONS.map(b => (
          <button
            key={b.key}
            onClick={() => onClick(b.key)}
            style={{
              padding: 18, borderRadius: 14, border: "1px solid #e8e8e8",
              fontSize: 18, background: "#fff", textAlign: "left",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}
          >
            <div style={{ fontSize: 28 }}>{b.emoji}</div>
            <div style={{ fontWeight: 700 }}>{b.label} <span style={{ color: "#666", fontWeight: 500 }}> {b.note}</span></div>
            <div style={{ fontSize: 12, color: "#777" }}>{hint(b.key)}</div>
          </button>
        ))}
      </div>

      {shareReady && (
        <button onClick={onShare}
          style={{ padding: 14, borderRadius: 12, background: "#111", color: "#fff", fontWeight: 700 }}>
          Share to Base feed
        </button>
      )}

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14,
        background: "#fafafa", padding: 12, borderRadius: 12, border: "1px solid #eee"
      }}>
        <div><strong>Points</strong><div>{totals.points}</div></div>
        <div><strong>Streak</strong><div>{totals.streak || 0} 🔥</div></div>
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: 12, right: 12, padding: 14,
          background: "#111", color: "#fff", textAlign: "center", borderRadius: 12, zIndex: 50
        }}>{toast}</div>
      )}
    </div>
  );
}

function hint(key: Btn["key"]) {
  switch (key) {
    case "ATTEND": return "Check in for today's run";
    case "HOST": return "Record that you led today's run";
    case "PACE": return "Helped pace the group";
    case "SUPPLIES": return "Brought water/snacks";
  }
}
