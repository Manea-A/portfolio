import type { Project } from "@/lib/projects";

/**
 * Real system architecture as designed artwork — operational-green
 * accents on glass, no monospace, no braces.
 * Desktop: spatial SVG. Mobile: a vertical spine that stays legible at
 * 350px. A plain-language flow description serves screen readers.
 */
export default function ArchDiagram({
  diagram,
  title,
  flow,
}: {
  diagram: NonNullable<Project["diagram"]>;
  title: string;
  flow?: string;
}) {
  const W = 1000;
  const H = 440;
  const px = (v: number) => (v / 100) * W;
  const py = (v: number) => (v / 100) * H;
  const node = (id: string) => diagram.nodes.find((n) => n.id === id)!;

  return (
    <figure className="glass grain m-0 overflow-hidden rounded-2xl">
      {flow && <p className="sr-only">{flow}</p>}

      {/* Desktop: spatial diagram */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
        className="hidden w-full sm:block"
      >
        <defs>
          <linearGradient id="arch-accent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--spec-6)" />
            <stop offset="60%" stopColor="var(--spec-4)" />
            <stop offset="100%" stopColor="var(--spec-3)" />
          </linearGradient>
          <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9" fill="none" stroke="var(--spec-6)" strokeWidth="1.4" />
          </marker>
        </defs>
        {diagram.edges.map((e, i) => {
          const a = node(e.from);
          const b = node(e.to);
          const mx = (px(a.x) + px(b.x)) / 2;
          const my = (py(a.y) + py(b.y)) / 2;
          return (
            <g key={i}>
              <line x1={px(a.x)} y1={py(a.y)} x2={px(b.x)} y2={py(b.y)}
                stroke="var(--line-strong)" strokeWidth="1" markerEnd="url(#arch-arrow)" />
              {e.label && (
                <text x={mx} y={my - 8} textAnchor="middle" fill="var(--spec-1)"
                  fontSize="15" fontFamily="var(--font-manrope), sans-serif"
                  fontWeight="600" letterSpacing="1">
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {diagram.nodes.map((n) => {
          // labels on edge-hugging nodes anchor inward so they never clip
          const anchor = n.x < 10 ? "start" : n.x > 90 ? "end" : "middle";
          const tx = n.x < 10 ? px(n.x) - 14 : n.x > 90 ? px(n.x) + 14 : px(n.x);
          return (
            <g key={n.id}>
              <circle cx={px(n.x)} cy={py(n.y)} r="5" fill="url(#arch-accent)" />
              <circle cx={px(n.x)} cy={py(n.y)} r="11" fill="none"
                stroke="var(--spec-6)" strokeOpacity="0.4" />
              <text x={tx} y={py(n.y) - 24} textAnchor={anchor} fill="var(--fg)"
                fontSize="17" fontFamily="var(--font-manrope), sans-serif"
                fontWeight="700" letterSpacing="1.2">
                {n.label.toUpperCase()}
              </text>
              {n.sub && (
                <text x={tx} y={py(n.y) + 32} textAnchor={anchor} fill="var(--muted)"
                  fontSize="13.5" fontFamily="var(--font-manrope), sans-serif"
                  fontWeight="500" letterSpacing="0.8">
                  {n.sub}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Mobile: vertical spine — every label at full legibility */}
      <ol aria-hidden="true" className="relative m-0 list-none p-5 sm:hidden">
        <span className="absolute bottom-8 left-[27px] top-8 w-px bg-[var(--line-strong)]" />
        {diagram.nodes.map((n) => (
          <li key={n.id} className="relative flex items-start gap-4 py-3 pl-1">
            <span className="relative mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
              <span className="absolute h-4 w-4 rounded-full border border-[var(--spec-6)]/40" />
              <span className="bg-gradient-accent h-2 w-2 rounded-full" />
            </span>
            <span>
              <span className="label block text-fg">{n.label}</span>
              {n.sub && <span className="mt-0.5 block text-sm text-muted">{n.sub}</span>}
            </span>
          </li>
        ))}
      </ol>

      <figcaption className="rule label px-5 py-3 text-muted">
        System architecture — {title}
      </figcaption>
    </figure>
  );
}
