"use client";

import ContributionButtons from "../components/ContributionButtons";

export default function Page() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <header>
        <h1 style={{ margin: 0 }}>Stride & Rise</h1>
        <p style={{ marginTop: 4, color: "#666" }}>Celebrate every stride</p>
      </header>
      <ContributionButtons />
    </div>
  );
}
