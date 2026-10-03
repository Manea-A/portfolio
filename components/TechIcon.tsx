import {
  siTypescript,
  siNestjs,
  siNextdotjs,
  siReact,
  siPostgresql,
  siRedis,
  siSocketdotio,
  siPrisma,
  siVuedotjs,
  siMysql,
  siD3,
  siExpress,
  siOpenapiinitiative,
  siTypeorm,
  siNodedotjs,
  siDocker,
  type SimpleIcon,
} from "simple-icons";

/**
 * Brand logos via simple-icons, keyed by the names used in project data.
 * Tech without a usable logo (AWS trademark removal, plain concepts like
 * "WebSockets") falls back to a text chip — honesty over decoration.
 */
const ICONS: Record<string, SimpleIcon> = {
  TypeScript: siTypescript,
  NestJS: siNestjs,
  "Next.js": siNextdotjs,
  "Next.js 16": siNextdotjs,
  React: siReact,
  "React 19": siReact,
  PostgreSQL: siPostgresql,
  Redis: siRedis,
  "Socket.io": siSocketdotio,
  Prisma: siPrisma,
  "Vue.js": siVuedotjs,
  MySQL: siMysql,
  "D3.js": siD3,
  Express: siExpress,
  "Express 5": siExpress,
  OpenAPI: siOpenapiinitiative,
  TypeORM: siTypeorm,
  "Node.js": siNodedotjs,
  Docker: siDocker,
};

export function hasIcon(name: string) {
  return name in ICONS;
}

export default function TechIcon({
  name,
  size = 20,
  colored = false,
  className = "",
}: {
  name: string;
  size?: number;
  /** brand color fill; default renders in the current text color */
  colored?: boolean;
  className?: string;
}) {
  const icon = ICONS[name];
  if (!icon) {
    return (
      <span className={`label rounded-full border border-[var(--line)] px-3 py-1.5 text-muted ${className}`}>
        {name}
      </span>
    );
  }
  return (
    <svg
      role="img"
      aria-label={name}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={colored ? `#${icon.hex}` : "currentColor"}
    >
      <title>{name}</title>
      <path d={icon.path} />
    </svg>
  );
}
