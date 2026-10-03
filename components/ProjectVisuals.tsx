import Image from "next/image";

/** Tile holding a product's real logo — square for icons, wider for wordmarks. */
export function Logo({
  src,
  alt,
  dark = false,
  wide = false,
  size = 40,
}: {
  src: string;
  alt: string;
  dark?: boolean;
  wide?: boolean;
  size?: number;
}) {
  const w = wide ? Math.round(size * 2.4) : size;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-line shadow-sm ${
        dark ? "bg-[#0f1b2a]" : "bg-white"
      } ${wide ? "rounded-lg px-2" : "rounded-[22%]"}`}
      style={{ width: w, height: size }}
    >
      <Image src={src} alt={alt} width={w} height={size} unoptimized className="h-full w-full object-contain" />
    </span>
  );
}

/**
 * Full-page screenshot of a live site in a browser frame. Shows the top of
 * the page; on hover (of the frame or a parent `.group`) it scrolls slowly
 * down the whole page. Pure CSS — see `.shot` in globals.css.
 */
export function ScrollShot({
  src,
  domain,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 520px, 100vw",
  ratio = "16 / 10",
}: {
  src?: string;
  domain?: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  ratio?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.18)]">
      <div className="flex items-center gap-1.5 border-b border-line bg-bg/70 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        {domain && (
          <span className="meta mx-auto -translate-x-6 truncate rounded-md bg-surface px-3 py-0.5 text-[0.6875rem] text-muted">
            {domain}
          </span>
        )}
      </div>
      <div className="shot relative" style={{ aspectRatio: ratio }}>
        {src ? (
          <Image src={src} alt={alt} width={1200} height={3500} sizes={sizes} priority={priority} className="shot-img" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--surface),transparent_60%)]">
            <span className="meta text-muted">Screenshot coming soon</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** How the system fits together, as one compact left-to-right strip. */
export function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
            <span className="meta text-muted">{String(i + 1).padStart(2, "0")}</span>
            {s}
          </span>
          {i < steps.length - 1 && (
            <span aria-hidden="true" className="text-muted">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
