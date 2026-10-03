import {
  siBluetooth,
  siClaude,
  siCloudinary,
  siD3,
  siDocker,
  siExpress,
  siFastapi,
  siGraphql,
  siJavascript,
  siJest,
  siJsonwebtokens,
  siLangchain,
  siMeta,
  siMongodb,
  siMysql,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siOpenapiinitiative,
  siPassport,
  siPhp,
  siPostgresql,
  siPrisma,
  siPython,
  siQuasar,
  siReact,
  siReacthookform,
  siReactquery,
  siRedis,
  siSocketdotio,
  siSwagger,
  siTailwindcss,
  siTestinglibrary,
  siTypeorm,
  siTypescript,
  siVuedotjs,
  type SimpleIcon,
} from "simple-icons";

/**
 * Brand logos for the stack, keyed by the names used in content.
 * Anything without a logo (AWS, OpenAI, Twilio… removed from simple-icons
 * at the brands' request, or plain concepts) renders as a text chip.
 */
const ICONS: Record<string, SimpleIcon> = {
  TypeScript: siTypescript,
  JavaScript: siJavascript,
  Python: siPython,
  PHP: siPhp,
  "Node.js": siNodedotjs,
  NestJS: siNestjs,
  Express: siExpress,
  FastAPI: siFastapi,
  React: siReact,
  "Next.js": siNextdotjs,
  "Vue.js": siVuedotjs,
  Quasar: siQuasar,
  "Tailwind CSS": siTailwindcss,
  "TanStack Query": siReactquery,
  "React Hook Form": siReacthookform,
  GraphQL: siGraphql,
  OpenAPI: siOpenapiinitiative,
  Swagger: siSwagger,
  "Socket.io": siSocketdotio,
  PostgreSQL: siPostgresql,
  MySQL: siMysql,
  MongoDB: siMongodb,
  Redis: siRedis,
  Prisma: siPrisma,
  TypeORM: siTypeorm,
  Docker: siDocker,
  JWT: siJsonwebtokens,
  Passport: siPassport,
  Jest: siJest,
  "Testing Library": siTestinglibrary,
  Claude: siClaude,
  LLaMA: siMeta,
  LangChain: siLangchain,
  Cloudinary: siCloudinary,
  "D3.js": siD3,
  Bluetooth: siBluetooth,
};

export const hasIcon = (name: string) => name in ICONS;

/* brand colours that vanish on one of the themes follow the text colour */
function fill(hex: string) {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum < 0.22 || lum > 0.85 ? "currentColor" : `#${hex}`;
}

export function TechIcon({ name, size = 18 }: { name: string; size?: number }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill={fill(icon.hex)} className="shrink-0">
      <path d={icon.path} />
    </svg>
  );
}

/** Logo + name chips — for case-study stacks and the skills section. */
export function StackChips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li
          key={t}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5 text-sm transition-colors hover:border-line-strong"
        >
          <TechIcon name={t} size={16} />
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Icon-only row with tooltips — compact, for cards. */
export function StackIcons({ items, max = 7 }: { items: string[]; max?: number }) {
  const withIcons = items.filter(hasIcon).slice(0, max);
  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      {withIcons.map((t) => (
        <li key={t} className="group/icon relative">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-bg/60 transition-transform group-hover/icon:-translate-y-0.5">
            <TechIcon name={t} size={16} />
          </span>
          <span className="sr-only">{t}</span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-fg px-2 py-1 text-xs text-bg opacity-0 transition-opacity group-hover/icon:opacity-100"
          >
            {t}
          </span>
        </li>
      ))}
    </ul>
  );
}
