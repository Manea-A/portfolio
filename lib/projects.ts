/**
 * All case-study content. Facts and numbers come from Manea's CV —
 * edit wording freely, but never add a metric that can't be backed up.
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
  title: string;
  /** one sentence for cards and meta descriptions */
  line: string;
  context: string;
  year: string;
  role: string;
  problem: string;
  summary: string;
  stack: string[];
  metrics: Metric[];
  decisions: { title: string; body: string }[];
  outcome: string;
  /** Plain-language description of the architecture flow */
  flow?: string;
  diagram?: { nodes: DiagramNode[]; edges: DiagramEdge[] };
  /** Optional screenshot, e.g. "/projects/healthwatch.png" (public/projects/) */
  image?: string;
  /** Optional honest retrospective: what broke, what you'd change */
  retrospective?: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "healthwatch",
    title: "HealthWatch",
    line: "Real-time telehealth platform streaming smartwatch vitals into hospital workflows.",
    context: "Me'Kaaz, Riyadh",
    year: "2025",
    role: "Technical Lead: cloud architecture, real-time pipeline, team direction",
    problem:
      "Hospitals had no way to monitor patient vitals remotely in real time and act on them inside their existing clinical workflow.",
    summary:
      "The first BLE-smartwatch telehealth platform in the MENA region. It connects wearables, a patient mobile app, and a multi-tenant hospital portal, and was built to meet NCA and MOH compliance requirements.",
    stack: ["NestJS", "PostgreSQL", "Redis", "Next.js", "WebSockets", "BLE", "AWS"],
    metrics: [
      { value: "<3s", label: "Vitals latency, watch to ward" },
      { value: "99.9%", label: "Uptime across patient and hospital systems" },
      { value: "<1 hr", label: "To deploy a new branded hospital" },
      { value: "<60s", label: "Patient onboarding" },
    ],
    decisions: [
      {
        title: "Event-driven ingestion instead of polling",
        body: "Vitals stream from the watches through an event pipeline rather than scheduled pulls. Clinical alerts depend on low, predictable latency, and polling could not guarantee it.",
      },
      {
        title: "Multi-tenancy from the first release",
        body: "Each hospital is an isolated tenant with its own branding, wards, and roles. This is what made onboarding a new hospital a configuration task of under an hour rather than an integration project.",
      },
      {
        title: "Compliance designed into the schema",
        body: "NCA and MOH requirements shaped data residency, doctor–patient access control, and audit trails at the data-model level, so they did not have to be retrofitted later.",
      },
    ],
    outcome:
      "Live real-time monitoring with automated clinical alerts and ward heatmaps, used as the base for onboarding hospitals across the region.",
    flow:
      "Vitals stream from BLE smartwatches into a real-time ingest pipeline and on to the clinical core, which drives automated alerts, the multi-tenant hospital portal, and live ward heatmaps.",
    diagram: {
      nodes: [
        { id: "watch", label: "BLE Smartwatch", sub: "vitals stream", x: 6, y: 50 },
        { id: "app", label: "Patient App", sub: "mobile", x: 30, y: 18 },
        { id: "ingest", label: "Real-Time Ingest", sub: "event pipeline", x: 34, y: 80 },
        { id: "core", label: "Clinical Core", sub: "alerts · rules · audit", x: 62, y: 50 },
        { id: "portal", label: "Hospital Portal", sub: "multi-tenant", x: 92, y: 18 },
        { id: "ward", label: "Ward Heatmaps", sub: "live view", x: 92, y: 82 },
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
    title: "ISOPluss FSMS",
    line: "Multi-tenant SaaS that turns ISO 22000 and HACCP compliance into configurable digital workflows.",
    context: "ISOPluss, Riyadh",
    year: "2025–present",
    role: "Co-founder & CTO: architecture, infrastructure, product engineering",
    problem:
      "Food-safety compliance under ISO 22000 and HACCP is manual and paper-based, which makes it slow to run and hard to audit at scale.",
    summary:
      "An enterprise B2B platform for food-safety management. A schema-driven engine generates workflows, document control, audit management, and analytics from configuration instead of hard-coded screens.",
    stack: ["NestJS", "Next.js", "PostgreSQL", "Redis", "TypeORM", "OpenAPI"],
    metrics: [],
    decisions: [
      {
        title: "Schema-driven workflows instead of hard-coded ones",
        body: "Compliance standards differ between clients and change over time. Generating forms, workflows, and document control from configuration means a new standard is a data change, not a development cycle.",
      },
      {
        title: "One codebase, many tenants",
        body: "Multi-tenant PostgreSQL with strict row-level isolation and per-tenant role-based access. It lets a small founding team serve enterprise clients from a single deployment.",
      },
      {
        title: "API-first",
        body: "A fully documented OpenAPI surface from the start, so integrations and new clients never depend on undocumented behaviour.",
      },
    ],
    outcome:
      "In production as multi-tenant cloud infrastructure covering document control, audits, objective tracking, corrective actions, and analytics.",
    flow:
      "Configurations for ISO 22000 and HACCP feed a schema engine that generates document control, audit management, and corrective-action workflows, all reporting into per-tenant analytics.",
    diagram: {
      nodes: [
        { id: "config", label: "Standard Config", sub: "ISO 22000 · HACCP", x: 6, y: 50 },
        { id: "engine", label: "Schema Engine", sub: "generates workflows", x: 33, y: 50 },
        { id: "docs", label: "Document Control", x: 62, y: 14 },
        { id: "audit", label: "Audit Management", x: 62, y: 50 },
        { id: "capa", label: "Corrective Actions", x: 62, y: 86 },
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
    title: "GavelMarket",
    line: "Real-time auction platform built for high-concurrency bidding and payment integrity.",
    context: "Independent, Saudi Arabia",
    year: "2025–present",
    role: "Architect and sole engineer, full stack",
    problem:
      "Online auctions need fair, real-time bidding under heavy concurrency without losing or duplicating a single transaction.",
    summary:
      "A real-time auction platform with timer-driven auction lifecycles, rate limiting, structured logging, and data-integrity guarantees across bidding and payments.",
    stack: ["Express", "Socket.io", "Prisma", "PostgreSQL", "Next.js", "React", "Zustand"],
    metrics: [],
    decisions: [
      {
        title: "Each auction is a state machine",
        body: "Opening, soft-close extensions, and settlement are timer-driven lifecycle events, so the bidding rules are enforced by the system rather than by client behaviour.",
      },
      {
        title: "Integrity before features",
        body: "Rate limiting, structured logging with Winston, and Zod validation at every boundary. In an auction, one inconsistent write becomes a refund and a dispute.",
      },
    ],
    outcome:
      "A production-grade real-time bidding core with secure payments, notifications through SendGrid and Twilio, and full observability.",
    flow:
      "Bidders connect through a rate-limited API gateway to a Socket.io bid engine driven by a state machine; bids and payments settle into PostgreSQL.",
    diagram: {
      nodes: [
        { id: "bidder", label: "Bidders", sub: "web · mobile", x: 6, y: 50 },
        { id: "gate", label: "API Gateway", sub: "rate-limited", x: 32, y: 50 },
        { id: "rt", label: "Bid Engine", sub: "Socket.io state machine", x: 60, y: 20 },
        { id: "pay", label: "Payments", sub: "secure flows", x: 60, y: 80 },
        { id: "db", label: "PostgreSQL", sub: "transactional", x: 90, y: 50 },
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
    title: "COVITA",
    line: "Multi-vendor coffee marketplace for wholesale, retail, and subscriptions in the Gulf.",
    context: "Contract, Riyadh",
    year: "2026–present",
    role: "End-to-end architecture and development",
    problem:
      "The Saudi and Gulf coffee market had no single platform covering wholesale, retail, and subscription sales.",
    summary:
      "A multi-vendor marketplace combining B2B wholesale, B2C retail, and subscriptions, with vendor onboarding, catalogues, order management, and payments across web and mobile.",
    stack: ["Next.js", "NestJS", "PostgreSQL"],
    metrics: [],
    decisions: [],
    outcome: "In active development.",
    featured: false,
  },
  {
    slug: "agrofarm",
    title: "AgroFarm",
    line: "Farm-monitoring platform. Gold Medal, Johor Agriculture Department Innovation Competition 2024.",
    context: "MYCES, Malaysia",
    year: "2024",
    role: "Delivery lead, requirements to MVP",
    problem: "Farm operations ran on manual, disconnected processes.",
    summary:
      "A farm-monitoring platform with real-time data, resource planning, automated pricing tools, and reporting.",
    stack: ["Vue.js", "NestJS", "MySQL", "D3.js"],
    metrics: [{ value: "Gold", label: "Johor Innovation Competition 2024" }],
    decisions: [],
    outcome:
      "Won the Gold Medal at the Johor Agriculture Department Innovation Competition 2024.",
    featured: false,
  },
];

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);
