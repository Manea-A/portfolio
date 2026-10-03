import type { Project } from "@/lib/projects";

/**
 * System architecture drawn as boxes and arrows.
 * Desktop: spatial SVG. Mobile: an ordered list that stays legible.
 * `thumb` renders the SVG alone as a decorative card visual.
 */

const W = 800;
const H = 320;
const PAD_X = 90;
const PAD_Y = 34;
const LABEL_PX = 7.6; // approx. width per character at 13px semibold
const SUB_PX = 6.3; // at 11px

type Diagram = NonNullable<Project["diagram"]>;

function layout(diagram: Diagram) {
  return diagram.nodes.map((n) => {
    const w = Math.max(n.label.length * LABEL_PX, (n.sub?.length ?? 0) * SUB_PX) + 28;
    const h = n.sub ? 50 : 34;
    return {
      ...n,
      cx: PAD_X + (n.x / 100) * (W - 2 * PAD_X),
      cy: PAD_Y + (n.y / 100) * (H - 2 * PAD_Y),
      hw: w / 2,
      hh: h / 2,
    };
  });
}

type Box = ReturnType<typeof layout>[number];

/** where the ray from a box's centre toward (dx, dy) leaves the box */
function exitPoint(b: Box, dx: number, dy: number, gap = 0) {
  const t = Math.min(
    dx === 0 ? Infinity : (b.hw + gap) / Math.abs(dx),
    dy === 0 ? Infinity : (b.hh + gap) / Math.abs(dy)
  );
  return { x: b.cx + dx * t, y: b.cy + dy * t };
}

function DiagramSvg({ diagram, id }: { diagram: Diagram; id: string }) {
  const boxes = layout(diagram);
  const box = (key: string) => boxes.find((b) => b.id === key)!;
  const marker = `arrow-${id}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true">
      <defs>
        <marker
          id={marker}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--muted)" />
        </marker>
      </defs>

      {diagram.edges.map((e, i) => {
        const a = box(e.from);
        const b = box(e.to);
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const p1 = exitPoint(a, dx, dy, 2);
        const p2 = exitPoint(b, -dx, -dy, 4);
        return (
          <g key={i}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="var(--line-strong)"
              strokeWidth="1.25"
              markerEnd={`url(#${marker})`}
            />
            {e.label && (
              <text
                x={(p1.x + p2.x) / 2 + 8}
                y={(p1.y + p2.y) / 2 - 6}
                fill="var(--accent)"
                fontSize="12"
                fontFamily="var(--font-geist-mono), monospace"
              >
                {e.label}
              </text>
            )}
          </g>
        );
      })}

      {boxes.map((b) => (
        <g key={b.id}>
          <rect
            x={b.cx - b.hw}
            y={b.cy - b.hh}
            width={b.hw * 2}
            height={b.hh * 2}
            rx="8"
            fill="var(--bg)"
            stroke="var(--line-strong)"
          />
          <text
            x={b.cx}
            y={b.sub ? b.cy - 4 : b.cy + 4.5}
            textAnchor="middle"
            fill="var(--fg)"
            fontSize="13"
            fontWeight="600"
            fontFamily="var(--font-geist-sans), sans-serif"
          >
            {b.label}
          </text>
          {b.sub && (
            <text
              x={b.cx}
              y={b.cy + 13}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize="11"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {b.sub}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function DiagramThumb({ project }: { project: Project }) {
  if (!project.diagram) return null;
  return <DiagramSvg diagram={project.diagram} id={`thumb-${project.slug}`} />;
}

export default function ArchDiagram({ project }: { project: Project }) {
  const { diagram, flow } = project;
  if (!diagram) return null;

  return (
    <figure className="m-0">
      <div className="rounded-xl border border-line bg-surface p-3 sm:p-5">
        <div className="hidden sm:block">
          <DiagramSvg diagram={diagram} id={project.slug} />
        </div>
        <ol className="m-0 list-none space-y-3 p-1 sm:hidden">
          {diagram.nodes.map((n) => (
            <li key={n.id} className="rounded-lg border border-line bg-bg px-4 py-3">
              <span className="block text-sm font-semibold">{n.label}</span>
              {n.sub && <span className="meta mt-0.5 block text-muted">{n.sub}</span>}
            </li>
          ))}
        </ol>
      </div>
      {flow && (
        <figcaption className="mt-3 text-sm leading-relaxed text-muted">{flow}</figcaption>
      )}
    </figure>
  );
}
