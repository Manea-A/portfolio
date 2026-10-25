import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import BookCall from "@/components/BookCall";

const nav = [
  { href: "/#work", label: "Work", mobile: true },
  { href: "/#experience", label: "Experience", mobile: false },
  { href: "/#skills", label: "Skills", mobile: false },
  { href: "/#about", label: "About", mobile: false },
  { href: "/#contact", label: "Contact", mobile: true },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2 whitespace-nowrap font-semibold tracking-tight sm:gap-2.5">
          {/* same mark as the tab icon: tangled lines resolving into lanes */}
          <svg viewBox="0 0 64 64" width="24" height="24" aria-hidden="true" className="shrink-0">
            <defs>
              <linearGradient id="mark-lanes" x1="8" y1="0" x2="56" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#8a8b94" />
                <stop offset="0.5" stopColor="#c9d4ff" />
                <stop offset="1" stopColor="#8eaaff" />
              </linearGradient>
            </defs>
            <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14" fill="#141416" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
            <g fill="none" stroke="url(#mark-lanes)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 45C21 45 21 21 35 21H55" />
              <path d="M9 19C21 19 21 43 35 43H55" />
              <path d="M11 32C13 19 26 19 23 29C21 36 28 32 35 32H55" />
            </g>
          </svg>
          Manea Abdullah
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-3 text-sm sm:gap-5 md:gap-7">
            {nav.map((item) => (
              <li key={item.href} className={item.mobile ? (item.label === "Work" ? "max-[419px]:hidden" : "") : "hidden sm:block"}>
                <Link href={item.href} className="text-muted transition-colors hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="flex">
              <ThemeToggle />
            </li>
            <li>
              <BookCall className="whitespace-nowrap rounded-full bg-fg px-4 py-1.5 font-medium text-bg transition-opacity hover:opacity-85">
                <span className="sm:hidden">Book</span>
                <span className="hidden sm:inline">Book a call</span>
              </BookCall>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
