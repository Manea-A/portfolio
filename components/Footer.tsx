import { EMAIL, GITHUB, LINKEDIN } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <p>© {new Date().getFullYear()} Manea Abdullah Al-Awbathani · Riyadh, Saudi Arabia</p>
        <ul className="flex gap-5">
          <li>
            <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-fg">
              Email
            </a>
          </li>
          <li>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-fg">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-fg">
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
