"use client";

import { getTotals } from "../../lib/store";

export default function ProfilePage() {
  const t = getTotals();
  const badges = t.badges.length ? t.badges : ["—"];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ marginTop: 0 }}>My Profile</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Stat label="Points" value={t.points} />
        <Stat label="Streak" value={`${t.streak || 0} 🔥`} />
        <Stat label="Attend" value={t.attend} />
        <Stat label="Host" value={t.host} />
        <Stat label="Pace" value={t.pace} />
        <Stat label="Supplies" value={t.supplies} />
      </div>

      <div>
        <h3>Badges</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {badges.map((b, i) => (
            <span key={i} style={{ padding: "8px 12px", borderRadius: 999, background: "#f1f1f1", fontSize: 12 }}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, color: "#777" }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
    </div>
  );
}
