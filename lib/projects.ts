/**
 * Draft content sourced from Manea's CV.
 * Copy is real (no invented facts) but will be refined in the
 * content-strategy phase — structure and fields are final.
 */

export type Metric = { value: string; label: string };

export type DiagramNode = {
  id: string;
  label: string;
  sub?: string;
  x: number; // 0–100 grid
  y: number; // 0–100 grid
};

export type DiagramEdge = { from: string; to: string; label?: string };

export type Project = {
  slug: string;
  index: string;
  /** Shown where no honest metric exists — a role is better than a fake number */
  roleTag?: string;
  /** Explicit one-liner for compact listings */
  line?: string;
  /** Honest retrospective — populated in the content phase, hidden until then */
  retrospective?: string;
  /**
   * Screenshot / cover art. Drop a file into public/projects/ and set
   * e.g. image: "/projects/healthwatch.jpg" — a designed gradient
   * placeholder renders until then.
   */
  image?: string;
  /** two accent stops for the placeholder cover gradient */
  hue: [string, string];
  title: string;
  context: string; // who / where
  year: string;
  role: string;
  problem: string;
  summary: string;
  stack: string[];
  metrics: Metric[];
  decisions: { title: string; body: string }[];
  outcome: string;
  /** Plain-language description of the architecture flow (screen readers) */
  flow?: string;
  diagram?: { nodes: DiagramNode[]; edges: DiagramEdge[] };
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "healthwatch",
    index: "01",
    title: "HealthWatch",
    context: "Me'Kaaz · Riyadh",
    year: "2025",
    role: "Technical Lead — cloud architecture, real-time pipeline, team direction",
    hue: ["var(--spec-6)", "var(--spec-5)"],
    problem:
      "Hospitals lacked real-time remote vitals monitoring tied directly into clinical workflows.",
    summary:
      "MENA's first BLE-smartwatch telehealth platform: a real-time ecosystem connecting wearables, patient mobile apps, and a multi-tenant hospital portal — under NCA/MOH compliance.",
    stack: [
      "NestJS",
      "PostgreSQL",
      "Redis",
      "Next.js",
      "WebSockets",
      "BLE streaming",
      "AWS",
    ],
    metrics: [
      { value: "<3s", label: "vitals latency, watch to ward" },
      { value: "99.9%", label: "uptime across patient & hospital systems" },
      { value: "<1hr", label: "branded hospital deployment" },
      { value: "<60s", label: "patient onboarding" },
    ],
    decisions: [
      {
        title: "Event-driven ingestion over polling",
        body: "Vitals stream from BLE watches through an event-driven pipeline rather than scheduled pulls — the difference between a dashboard and a clinical alerting system a nurse can trust.",
      },
      {
        title: "Multi-tenancy from day one",
        body: "Every hospital is an isolated tenant with its own branding, wards, and roles. That decision is why deployment takes under an hour instead of a re-integration project.",
      },
      {
        title: "Compliance as architecture, not paperwork",
        body: "NCA/MOH requirements shaped data residency, role-based doctor–patient access, and audit trails at the schema level — retrofitting them later would have been a rewrite.",
      },
    ],
    outcome:
      "Live real-time monitoring with automated clinical alerts and ward heatmaps, scaling into B2B hospital onboarding across the region.",
    flow:
      "Vitals stream from BLE smartwatches into a real-time ingest pipeline and on to the clinical core, which drives automated alerts, the multi-tenant hospital portal, and live ward heatmaps in under three seconds.",
    diagram: {
      nodes: [
        { id: "watch", label: "BLE Smartwatch", sub: "vitals stream", x: 6, y: 50 },
        { id: "app", label: "Patient App", sub: "mobile", x: 30, y: 22 },
        { id: "ingest", label: "Real-Time Ingest", sub: "event pipeline", x: 34, y: 66 },
        { id: "core", label: "Clinical Core", sub: "alerts · rules · audit", x: 60, y: 44 },
        { id: "portal", label: "Hospital Portal", sub: "multi-tenant", x: 86, y: 26 },
        { id: "ward", label: "Ward Heatmaps", sub: "live view", x: 86, y: 66 },
      ],
      edges: [
        { from: "watch", to: "ingest", label: "<3s" },
        { from: "watch", to: "app" },
        { from: "app", to: "core" },
        { from: "ingest", to: "core" },
        { from: "core", to: "portal" },
        { from: "core", to: "ward" },
      ],
    },
    featured: true,
  },
  {
    slug: "isopluss",
    index: "02",
    title: "ISOPluss FSMS",
    context: "Co-Founder & CTO · Riyadh",
    year: "2025 — present",
    role: "Co-founder & CTO — architecture, infrastructure, product engineering",
    hue: ["var(--spec-5)", "var(--spec-4)"],
    problem:
      "ISO 22000 and HACCP compliance is manual, paper-heavy, and hard to audit at scale.",
    summary:
      "An enterprise B2B SaaS digitizing food-safety compliance: a schema-driven engine that generates digital workflows, document control, audit management, and analytics from configuration.",
    stack: [
      "NestJS",
      "Next.js",
      "PostgreSQL",
      "Redis",
      "TypeORM",
      "OpenAPI",
      "Multi-tenant",
    ],
    roleTag: "Co-Founder & CTO",
    metrics: [],
    decisions: [
      {
        title: "Schema-driven over hardcoded workflows",
        body: "Compliance standards differ per client and evolve constantly. Generating workflows, forms, and document control from configuration means new standards ship as data, not as sprints.",
      },
      {
        title: "One codebase, many tenants",
        body: "Multi-tenant PostgreSQL with strict row-level isolation and per-tenant RBAC — the architecture that lets a two-person founding team serve enterprise clients.",
      },
      {
        title: "The API is the product",
        body: "A fully documented OpenAPI surface from day one, so integrations and future clients never depend on tribal knowledge.",
      },
    ],
    outcome:
      "Running as multi-tenant cloud infrastructure covering document control, audits, objectives tracking, corrective actions, and analytics.",
    flow:
      "Standard configurations for ISO 22000 and HACCP feed a schema engine that generates document control, audit management, and corrective-action workflows, all reporting into per-tenant analytics.",
    diagram: {
      nodes: [
        { id: "config", label: "Standard Config", sub: "ISO 22000 · HACCP", x: 8, y: 30 },
        { id: "engine", label: "Schema Engine", sub: "generates workflows", x: 36, y: 50 },
        { id: "docs", label: "Document Control", x: 66, y: 18 },
        { id: "audit", label: "Audit Management", x: 70, y: 50 },
        { id: "capa", label: "Corrective Actions", x: 66, y: 82 },
        { id: "dash", label: "Analytics", sub: "per tenant", x: 92, y: 50 },
      ],
      edges: [
        { from: "config", to: "engine" },
        { from: "engine", to: "docs" },
        { from: "engine", to: "audit" },
        { from: "engine", to: "capa" },
        { from: "audit", to: "dash" },
      ],
    },
    featured: true,
  },
  {
    slug: "gavelmarket",
    index: "03",
    title: "GavelMarket",
    context: "Independent · Saudi Arabia",
    year: "2025 — present",
    role: "Architect & sole engineer — full stack",
    hue: ["var(--spec-4)", "var(--spec-3)"],
    problem:
      "High-concurrency online auctions demand fair, real-time bidding without dropping a single transaction.",
    summary:
      "A real-time auction platform tuned for high-concurrency bidding: timer-based lifecycle events, rate-limiting, structured logging, and data-integrity guarantees across secure payment flows.",
    stack: [
      "Express 5",
      "Socket.io",
      "Prisma",
      "PostgreSQL",
      "Next.js 16",
      "React 19",
      "Zustand",
    ],
    roleTag: "Architect & Sole Engineer",
    metrics: [],
    decisions: [
      {
        title: "Auction lifecycle as timed events",
        body: "Every auction is a state machine driven by timer-based lifecycle events — opening, soft-close extensions, settlement — so fairness rules are enforced by the system, not by hope.",
      },
      {
        title: "Integrity before features",
        body: "Rate-limiting, structured logging (Winston), and validation (Zod) at every boundary. In an auction, a single inconsistent write is a refund, a dispute, and a lost user.",
      },
    ],
    outcome:
      "A production-grade real-time bidding core with secure payments, notifications (SendGrid/Twilio), and full observability.",
    flow:
      "Bidders connect through a rate-limited API gateway to a Socket.io bid engine driven by a timed state machine; payments and bids settle into PostgreSQL with integrity guarantees.",
    diagram: {
      nodes: [
        { id: "bidder", label: "Bidders", sub: "web · mobile", x: 8, y: 50 },
        { id: "gate", label: "API Gateway", sub: "rate-limited", x: 32, y: 50 },
        { id: "rt", label: "Bid Engine", sub: "Socket.io · state machine", x: 58, y: 30 },
        { id: "pay", label: "Payments", sub: "secure flows", x: 58, y: 72 },
        { id: "db", label: "PostgreSQL", sub: "integrity guarantees", x: 86, y: 50 },
      ],
      edges: [
        { from: "bidder", to: "gate" },
        { from: "gate", to: "rt", label: "ws" },
        { from: "gate", to: "pay" },
        { from: "rt", to: "db" },
        { from: "pay", to: "db" },
      ],
    },
    featured: true,
  },
  {
    slug: "covita",
    index: "04",
    title: "COVITA",
    context: "Contract · Riyadh",
    year: "2026 — present",
    role: "End-to-end architecture & development",
    hue: ["var(--spec-3)", "var(--spec-2)"],
    problem:
      "The Saudi and Gulf coffee market needed one platform spanning wholesale, retail, and subscription commerce.",
    summary:
      "A multi-vendor coffee marketplace combining B2B wholesale, B2C retail, and subscriptions — vendor onboarding, catalogs, order management, and payments across mobile and web.",
    stack: ["Next.js", "NestJS", "PostgreSQL", "Multi-vendor", "Subscriptions"],
    metrics: [],
    decisions: [],
    outcome: "Multi-stakeholder commerce ecosystem in active development.",
    line: "Multi-vendor coffee marketplace — B2B wholesale, B2C retail, and subscriptions for the Gulf market",
    featured: false,
  },
  {
    slug: "agrofarm",
    index: "05",
    title: "AgroFarm",
    context: "MYCES · Malaysia",
    year: "2024",
    role: "Delivery lead — requirements to MVP",
    hue: ["var(--spec-2)", "var(--spec-1)"],
    problem: "Farm operations were fragmented across manual, disconnected processes.",
    summary:
      "A farm-monitoring platform with real-time data, resource planning, automated pricing tools, and reporting — Gold Medal, Johor Agriculture Department Innovation Competition 2024.",
    stack: ["Vue.js", "NestJS", "MySQL", "D3.js"],
    metrics: [{ value: "Gold", label: "Johor Innovation Competition 2024" }],
    decisions: [],
    outcome:
      "Recognized as a national benchmark for agricultural digital innovation.",
    line: "Farm-monitoring platform — Gold Medal, Johor Innovation Competition 2024",
    featured: false,
  },
];

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);
