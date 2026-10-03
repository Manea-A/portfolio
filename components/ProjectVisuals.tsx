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
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-line ${
        dark ? "bg-[#0f1b2a]" : "bg-white"
      } ${wide ? "rounded-lg px-2" : "rounded-[22%]"}`}
      style={{ width: w, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={w}
        height={size}
        unoptimized
        className="h-full w-full object-contain"
      />
    </span>
  );
}

/** Live-site screenshot in a minimal browser frame. */
export function BrowserShot({
  src,
  domain,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 480px, 100vw",
}: {
  src: string;
  domain: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-line-strong" />
        <span className="h-2 w-2 rounded-full bg-line-strong" />
        <span className="h-2 w-2 rounded-full bg-line-strong" />
        <span className="meta ml-2 truncate text-[0.6875rem] text-muted">{domain}</span>
      </div>
      <Image
        src={src}
        alt={alt}
        width={1440}
        height={900}
        sizes={sizes}
        priority={priority}
        className="block h-auto w-full"
      />
    </div>
  );
}

/** How the system fits together, as one compact left-to-right strip. */
export function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className="rounded-md border border-line bg-surface px-3 py-1.5">{s}</span>
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
