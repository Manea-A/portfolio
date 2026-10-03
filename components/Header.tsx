import Link from "next/link";
import { CV } from "@/lib/site";

const nav = [
  { href: "/#work", label: "Work", mobile: true },
  { href: "/#experience", label: "Experience", mobile: false },
  { href: "/#about", label: "About", mobile: false },
  { href: "/#contact", label: "Contact", mobile: true },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/" className="font-semibold tracking-tight">
          Manea Abdullah
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-5 text-sm md:gap-7">
            {nav.map((item) => (
              <li key={item.href} className={item.mobile ? "" : "hidden sm:block"}>
                <Link href={item.href} className="text-muted transition-colors hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={CV}
                download
                className="rounded-md border border-line-strong px-3 py-1.5 font-medium transition-colors hover:bg-surface"
              >
                CV
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
