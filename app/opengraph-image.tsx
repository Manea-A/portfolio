import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Manea Abdullah — Systems Architect. Systems that hold up in production.";

export default async function OpenGraphImage() {
  const [semibold, medium] = await Promise.all([
    readFile(
      join(process.cwd(), "node_modules/@fontsource/sora/files/sora-latin-600-normal.woff")
    ),
    readFile(
      join(process.cwd(), "node_modules/@fontsource/sora/files/sora-latin-500-normal.woff")
    ),
  ]);

  const bg = "#070609";
  const fg = "#F4F2EF";
  const muted = "#9A95A1";
  // spectral stops (matches the site's --spec-* palette)
  const amber = "#EBBC69";
  const magenta = "#FDA7BF";
  const violet = "#CEB5FE";
  const blue = "#A4C5FF";
  const cyan = "#56D9E7";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: bg,
          backgroundImage:
            `radial-gradient(circle at 88% 8%, rgba(86,217,231,0.22), transparent 42%),` +
            `radial-gradient(circle at 65% 110%, rgba(206,181,254,0.18), transparent 45%),` +
            `radial-gradient(circle at 5% 95%, rgba(235,188,105,0.14), transparent 40%)`,
          padding: "64px 72px",
          fontFamily: "Sora",
        }}
      >
        {/* top: eyebrow + node glyph */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: muted,
              fontSize: 23,
              letterSpacing: 5,
              fontFamily: "SoraMedium",
            }}
          >
            SYSTEMS ARCHITECT · RIYADH
          </div>
          <svg width="56" height="56" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="7" fill={cyan} />
            <circle
              cx="32"
              cy="32"
              r="15"
              fill="none"
              stroke={violet}
              strokeOpacity="0.7"
              strokeWidth="2"
            />
            <line x1="2" y1="32" x2="17" y2="32" stroke={amber} strokeWidth="2" />
            <line x1="47" y1="32" x2="62" y2="32" stroke={amber} strokeWidth="2" />
          </svg>
        </div>

        {/* claim */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 96,
              letterSpacing: -3,
              color: fg,
              display: "flex",
            }}
          >
            Manea
          </div>
          <div
            style={{
              fontSize: 96,
              letterSpacing: -3,
              backgroundImage: `linear-gradient(100deg, #ffffff, ${cyan} 18%, ${blue} 34%, #ffffff 46%, ${violet} 58%, ${magenta} 72%, #ffffff 84%, ${amber} 100%)`,
              backgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            Abdullah
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 30,
              color: muted,
              fontFamily: "SoraMedium",
              display: "flex",
            }}
          >
            Systems that hold up in production.
          </div>
        </div>

        {/* bottom rule + descriptors */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(238,244,233,0.16)",
            paddingTop: 26,
          }}
        >
          <div style={{ color: fg, fontSize: 24, letterSpacing: 2, fontFamily: "SoraMedium" }}>
            MULTI-TENANT SAAS
          </div>
          <div style={{ color: muted, fontSize: 24, letterSpacing: 2, fontFamily: "SoraMedium" }}>
            REAL-TIME
          </div>
          <div style={{ color: muted, fontSize: 24, letterSpacing: 2, fontFamily: "SoraMedium" }}>
            AI-NATIVE
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Sora", data: semibold, style: "normal" },
        { name: "SoraMedium", data: medium, style: "normal" },
      ],
    }
  );
}
