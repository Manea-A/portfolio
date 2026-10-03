import TechIcon, { hasIcon } from "@/components/TechIcon";

/** Infinite ribbon of tech logos — pure CSS animation, pauses on hover. */
export default function Marquee({ items }: { items: string[] }) {
  const logos = items.filter(hasIcon);

  const Row = ({ hidden = false }: { hidden?: boolean }) => (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {logos.map((item) => (
        <span
          key={item}
          className="group flex items-center gap-3 px-7 py-5 text-muted transition-colors hover:text-fg md:px-10"
        >
          <TechIcon name={item} size={22} className="opacity-80 transition-opacity group-hover:opacity-100" />
          <span className="label">{item}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee rule relative overflow-hidden border-b border-[var(--line)]">
      {/* edge fade so the ribbon dissolves instead of clipping */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent"
      />
      <div className="marquee-track">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
