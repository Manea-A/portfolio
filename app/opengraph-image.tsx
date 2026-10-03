import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Manea Abdullah, Systems Architect & Engineering Lead";

const font = (file: string) =>
  readFile(join(process.cwd(), "node_modules/geist/dist/fonts", file));

export default async function OpenGraphImage() {
  const [semibold, regular, mono] = await Promise.all([
    font("geist-sans/Geist-SemiBold.ttf"),
    font("geist-sans/Geist-Regular.ttf"),
    font("geist-mono/GeistMono-Regular.ttf"),
  ]);

  const muted = "#a0a0a8";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0c0d",
          color: "#ececee",
          padding: "72px 80px",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", fontFamily: "GeistMono", fontSize: 24, color: muted }}>
          Riyadh, Saudi Arabia
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 600, letterSpacing: -3 }}>Manea Abdullah</div>
          <div style={{ marginTop: 12, fontSize: 40, color: muted, fontFamily: "GeistRegular" }}>
            Systems Architect &amp; Engineering Lead
          </div>
        </div>
        <div
          style={{
            display: "flex",
            borderTop: "1px solid #34343a",
            paddingTop: 28,
            fontFamily: "GeistMono",
            fontSize: 24,
            color: muted,
            gap: 40,
          }}
        >
          <span>Multi-tenant SaaS</span>
          <span>Real-time systems</span>
          <span>AI in operations</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
        { name: "GeistRegular", data: regular, weight: 400, style: "normal" },
        { name: "GeistMono", data: mono, weight: 400, style: "normal" },
      ],
    }
  );
}
