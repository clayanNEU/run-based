import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import Link from "next/link";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.frame.name,
    description: minikitConfig.frame.description,
    other: {
      "fc:frame": JSON.stringify({
        version: minikitConfig.frame.version,
        imageUrl: minikitConfig.frame.heroImageUrl,
        button: {
          title: `Launch ${minikitConfig.frame.name}`,
          action: {
            name: `Launch ${minikitConfig.frame.name}`,
            type: "launch_frame",
          },
        },
      }),
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceCodePro.variable}`} style={{ margin: 0, background: "#fff", color: "#111", fontFamily: "ui-sans-serif, system-ui, -apple-system" }}>
        <RootProvider>
          <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100dvh", display: "grid", gridTemplateRows: "1fr auto" }}>
            <main style={{ padding: 16 }}>{children}</main>
            <nav style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid #eee",
              position: "sticky", bottom: 0, background: "#fff"
            }}>
              <Tab href="/" label="Contribute" emoji="✨" />
              <Tab href="/leaderboard" label="Leaderboard" emoji="🏆" />
              <Tab href="/profile" label="Profile" emoji="🪪" />
            </nav>
          </div>
        </RootProvider>
      </body>
    </html>
  );
}

function Tab({ href, label, emoji }: { href: string; label: string; emoji: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "#111" }}>
      <div style={{ padding: 12, textAlign: "center" }}>
        <div style={{ fontSize: 20 }}>{emoji}</div>
        <div style={{ fontSize: 12 }}>{label}</div>
      </div>
    </Link>
  );
}
