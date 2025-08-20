"use client";

import { getTotals } from "../../lib/store";

export default function LeaderboardPage() {
  const me = getTotals();

  const rows = [
    { name: "You", points: me.points },
    { name: "Rhea", points: 120 },
    { name: "Jordan", points: 95 },
    { name: "Sam", points: 80 },
    { name: "Ava", points: 72 },
  ].sort((a,b) => b.points - a.points);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>This Week</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "24px 1fr auto",
            alignItems: "center", padding: 12, border: "1px solid #eee", borderRadius: 12
          }}>
            <div style={{ textAlign: "center" }}>{i+1}</div>
            <div style={{ fontWeight: 600 }}>{r.name}</div>
            <div style={{ color: "#555" }}>{r.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
