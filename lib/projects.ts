/**
 * All project content. Facts and numbers come from Manea's CV and the
 * projects' own public sites — edit wording freely, but never add a
 * metric that can't be backed up.
 *
 * Assets: logos in public/projects/logos/, full-page screenshots
 * (1200px wide webp, up to 3500px tall) in public/projects/shots/.
 * A project or sub-product without `shot` shows a designed placeholder.
 */

export type Metric = { value: string; label: string };
export type Link = { label: string; href: string };

/** a product inside a group (ISOPluss family, MYCES platforms) */
export type SubProduct = {
  title: string;
  line: string;
  logo: string;
  shot?: string;
  href?: string;
  role?: string;
  year?: string;
  metrics?: Metric[];
};

export type Project = {
  slug: string;
  title: string;
  /** one sentence for cards and meta descriptions */
  line: string;
  org: string;
  year: string;
  role: string;
  kind: "product" | "client-site";
  logo: string;
  /** dark tile behind light logos */
  logoDark?: boolean;
  /** wordmark rather than a square icon */
  logoWide?: boolean;
  shot?: string;
  links: Link[];
  summary: string;
  problem?: string;
  /** what I built — short, concrete bullets */
  built: string[];
  /** compact system flow, left to right */
  flow?: string[];
  stack: string[];
  metrics: Metric[];
  decisions: { title: string; body: string }[];
  outcome?: string;
  /** related products shown on the case study */
  family?: SubProduct[];
  familyTitle?: string;
  featured: boolean;
};

/* Order matters: the grid is two columns, so neighbours should not share
   a dominant colour (ISOPluss and HealthWatch are both blue). */
export const projects: Project[] = [
  {
    slug: "isopluss",
    title: "ISOPluss",
    line: "Multi-tenant SaaS for food-safety and quality compliance, live as three products.",
    org: "ISOPluss, Riyadh",
    year: "2025–present",
    role: "Co-founder & Lead Software Architect",
    kind: "product",
    logo: "/projects/logos/isopluss.png",
    shot: "/projects/shots/isopluss.webp",
    links: [{ label: "isopluss.org", href: "https://isopluss.org/" }],
    summary:
      "An enterprise B2B platform that runs ISO 22000, FSSC 22000, and HACCP in one place: traceability, monitoring, document control, and audits for food operations, in Arabic and English.",
    problem:
      "Food-safety compliance is usually run on binders and spreadsheets, which makes it slow to operate and hard to audit across sites.",
    built: [
      "Co-founded the company and architected the multi-tenant platform end to end.",
      "Designed the NestJS, Next.js, PostgreSQL, Redis, and TypeORM architecture with JWT and role-based access control.",
      "Built a schema-driven engine for digital workflows, document control, audit management, corrective actions, and analytics.",
      "Own cloud infrastructure, CI/CD, DevOps automation, and production data security.",
    ],
    flow: ["Standard configuration", "Schema engine", "Workflows & documents", "Audits & corrective actions", "Per-tenant analytics"],
    stack: ["NestJS", "Next.js", "TypeScript", "PostgreSQL", "Redis", "TypeORM", "JWT", "OpenAPI", "CI/CD"],
    metrics: [
      { value: "3", label: "Live products on the platform" },
      { value: "27", label: "Working modules" },
      { value: "AR / EN", label: "Fully bilingual, RTL-aware" },
    ],
    decisions: [
      {
        title: "Schema-driven workflows instead of hard-coded ones",
        body: "Standards differ between clients and change over time. Generating forms, workflows, and document control from configuration makes a new standard a data change rather than a development cycle.",
      },
      {
        title: "One codebase, many tenants",
        body: "Multi-tenant PostgreSQL with strict isolation and per-tenant role-based access lets a small team serve enterprise clients from one deployment.",
      },
      {
        title: "API-first",
        body: "A documented OpenAPI surface from the start, so integrations never depend on undocumented behaviour.",
      },
    ],
    outcome:
      "In production for food manufacturers, processors, and warehouses in the Gulf, and running as two further products for HACCP and ISO 9001 quality management.",
    familyTitle: "Also on this platform",
    family: [
      {
        title: "HaccPlus",
        line: "HACCP plans, CCP monitoring, and traceability for food producers.",
        logo: "/projects/logos/haccplus.png",
        shot: "/projects/shots/haccplus.webp",
        href: "https://haccplus.com/",
      },
      {
        title: "IsoProfissional",
        line: "Quality management for ISO 9001 teams: documents, audits, corrective actions.",
        logo: "/projects/logos/isoprofissional.png",
        shot: "/projects/shots/isoprofissional.webp",
        href: "https://isoprofissional.com/",
      },
    ],
    featured: true,
  },
  {
    slug: "covita",
    title: "COVITA",
    line: "Saudi coffee marketplace connecting importers, roasters, cafés, and coffee lovers.",
    org: "COVITA, Riyadh",
    year: "Feb 2026 – present",
    role: "Lead architect & developer (contract)",
    kind: "product",
    logo: "/projects/logos/covita.svg",
    shot: "/projects/shots/covita.webp",
    links: [{ label: "covita-app.vercel.app", href: "https://covita-app.vercel.app/landing/" }],
    summary:
      "A verified B2B and B2C coffee marketplace, from farm to cup: green-coffee importers, roasters, cafés, and consumers on one platform with a verified catalogue, requests for quotes, samples, compliant e-invoices, and secure payment.",
    built: [
      "Led end-to-end architecture and development.",
      "Built vendor onboarding, product catalogues, order management, and payment integration across web and mobile.",
      "Designed the platform for wholesale, retail, and subscription business models.",
    ],
    flow: ["Vendors & roasters", "Verified catalogue", "Quotes & orders", "Payments & e-invoices", "Buyers"],
    stack: ["Next.js", "NestJS", "PostgreSQL"],
    metrics: [],
    decisions: [],
    featured: true,
  },
  {
    slug: "gavelmarket",
    title: "GavelMarket",
    line: "Real-time online auction marketplace for Saudi Arabia, built for high-concurrency bidding.",
    org: "GavelMarket, Saudi Arabia",
    year: "Oct 2025 – present",
    role: "Architect & sole engineer (part-time)",
    kind: "product",
    logo: "/projects/logos/gavelmarket.svg",
    shot: "/projects/shots/gavelmarket.webp",
    links: [{ label: "gavelmarket.com", href: "https://www.gavelmarket.com/" }],
    summary:
      "A live auction marketplace where people buy and sell through timed auctions, with real-time bidding, secure payments, and notifications.",
    problem:
      "Online auctions need fair, real-time bidding under heavy concurrency without losing or duplicating a single transaction.",
    built: [
      "Architected and built the full stack: Express, Prisma, PostgreSQL, Socket.io, Next.js, and React.",
      "Implemented timer-based auction lifecycle events, rate limiting, structured logging, and data-integrity controls for payments.",
      "Integrated JWT auth, Cloudinary media, and SendGrid and Twilio notifications.",
    ],
    flow: ["Bidders", "Rate-limited API", "Socket.io bid engine", "Payments", "PostgreSQL"],
    stack: ["Express", "Socket.io", "Prisma", "PostgreSQL", "Next.js", "React", "JWT", "Cloudinary", "SendGrid", "Twilio"],
    metrics: [],
    decisions: [
      {
        title: "Each auction is a state machine",
        body: "Opening, soft-close extensions, and settlement are timer-driven lifecycle events, so bidding rules are enforced by the server, not the client.",
      },
      {
        title: "Integrity before features",
        body: "Rate limiting, structured logging, and validation at every boundary. In an auction, one inconsistent write becomes a refund and a dispute.",
      },
    ],
    outcome: "Live at gavelmarket.com.",
    featured: true,
  },
  {
    slug: "healthwatch",
    title: "HealthWatch",
    line: "Real-time telehealth platform streaming smartwatch vitals into hospital workflows.",
    org: "Me'Kaaz, Riyadh",
    year: "Jul 2025 – Jan 2026",
    role: "Senior Software Engineer",
    kind: "product",
    logo: "/projects/logos/mekaaz.png",
    shot: "/projects/shots/healthwatch.webp",
    links: [{ label: "mekaaz.com", href: "https://mekaaz.com/" }],
    summary:
      "A real-time ecosystem connecting BLE smartwatches, patient apps, and a multi-tenant hospital portal for Me'Kaaz, a Saudi chronic-care company, built to NCA and MOH requirements.",
    problem:
      "Hospitals needed to monitor patient vitals remotely in real time and act on them inside their existing clinical workflow.",
    built: [
      "Architected and delivered the platform connecting patient applications with hospital systems.",
      "Engineered the real-time cloud infrastructure behind the vitals pipeline.",
      "Delivered hospital dashboards, ward heatmaps, automated clinical alerts, and branded deployment workflows.",
      "Coordinated design, engineering, and QA through regional rollout, knowledge transfer, and mentoring.",
    ],
    flow: ["BLE smartwatch", "Patient app", "Real-time ingest", "Clinical core", "Hospital portal & alerts"],
    stack: ["NestJS", "PostgreSQL", "Redis", "Next.js", "WebSockets", "Bluetooth", "AWS"],
    metrics: [
      { value: "<3s", label: "Vitals latency, watch to ward" },
      { value: "99.9%", label: "Uptime" },
    ],
    decisions: [
      {
        title: "Event-driven ingestion instead of polling",
        body: "Clinical alerts depend on low, predictable latency, so vitals stream through an event pipeline rather than scheduled pulls.",
      },
      {
        title: "Multi-tenancy from the first release",
        body: "Each hospital is an isolated tenant with its own branding, wards, and roles, which turned onboarding a hospital into configuration instead of integration work.",
      },
      {
        title: "Compliance designed into the schema",
        body: "NCA and MOH requirements shaped data residency, doctor–patient access, and audit trails at the data-model level.",
      },
    ],
    outcome:
      "Live monitoring with automated clinical alerts and ward heatmaps, rolled out regionally with hospital deployment workflows.",
    featured: true,
  },
  {
    slug: "onagents",
    title: "OnAgents",
    line: "AI agents plus a human team that find customers for local businesses and do the work.",
    org: "OnAgents",
    year: "Founder",
    role: "Founder: product, architecture, engineering",
    kind: "product",
    logo: "/projects/logos/onagents.svg",
    shot: "/projects/shots/onagents.webp",
    links: [{ label: "on-agents.vercel.app", href: "https://on-agents.vercel.app/" }],
    summary:
      "OnAgents maps the businesses that need a service, researches each one, writes to them personally, and delivers the video, content, and campaigns once they say yes. AI agents do the research and outreach; nothing is sent until the client approves. Arabic and English.",
    built: ["Founded the product and designed and built it end to end."],
    flow: ["Find businesses", "Research", "Personal outreach", "Client approval", "Delivery"],
    stack: ["Next.js", "LLMs", "AI agents"],
    metrics: [],
    decisions: [],
    featured: true,
  },
  {
    slug: "myces",
    title: "MYCES platforms",
    line: "Energy, facility, farm, and dam-safety platforms for MYCES Group, from requirements to production.",
    org: "MYCES SDN BHD, Malaysia",
    year: "Oct 2023 – Dec 2024",
    role: "Software Engineer → Software Engineering Lead",
    kind: "product",
    logo: "/projects/logos/myces.png",
    shot: "/projects/shots/ems.webp",
    links: [{ label: "mycesgroup.com", href: "https://www.live.mycesgroup.com/" }],
    summary:
      "MYCES Group is a Malaysian energy-management and engineering company. I joined as an intern, became a software engineer on its energy-monitoring SaaS, and then led delivery of new platforms across energy, facilities, agriculture, and dam safety.",
    built: [
      "Built features for EMARS, the energy-monitoring SaaS serving 100+ enterprise facilities: threshold-based alerting, treemap analytics, responsive web and mobile interfaces, and role-based access.",
      "As Software Engineering Lead, shipped three major platforms from requirements through MVP using Agile practices and reusable components.",
      "Cut delivery timelines by 20% through reusable architecture and component practices.",
      "Authored the SRS, SDD, and STR/STD documentation and mentored junior developers.",
    ],
    stack: ["Vue.js", "Quasar", "NestJS", "MySQL", "D3.js"],
    metrics: [
      { value: "100+", label: "Facilities on EMARS" },
      { value: "17%", label: "Reported cut in energy waste" },
      { value: "22%", label: "Higher user engagement" },
      { value: "20%", label: "Shorter delivery timelines" },
    ],
    decisions: [],
    familyTitle: "Platforms",
    family: [
      {
        title: "EMARS",
        line: "Energy monitoring, analysis, and reporting SaaS for 100+ enterprise facilities.",
        logo: "/projects/logos/emars.png",
        shot: "/projects/shots/emars.webp",
        href: "https://www.myces-emars.com/",
        role: "Software Engineer",
        year: "Dec 2023 – Aug 2024",
        metrics: [
          { value: "17%", label: "Less energy waste" },
          { value: "22%", label: "More engagement" },
        ],
      },
      {
        title: "FMS",
        line: "Facility management system: assets, work orders, preventive maintenance, and reporting.",
        logo: "/projects/logos/myces.png",
        shot: "/projects/shots/fms.webp",
        href: "https://www.myces-fms.com/#/home",
        year: "2024",
      },
      {
        title: "AgroFarm",
        line: "Farm monitoring with real-time data, resource planning, pricing tools, and reporting.",
        logo: "/projects/logos/myces.png",
        year: "2024",
        metrics: [{ value: "Gold", label: "Johor Innovation Competition 2024" }],
      },
      {
        title: "Dam Monitoring & EMS",
        line: "Enterprise monitoring platforms for dam safety and energy management.",
        logo: "/projects/logos/myces.png",
        year: "2024",
      },
    ],
    featured: true,
  },
  {
    slug: "saudihlm",
    title: "Saudi HLM",
    line: "Bilingual company website for a Saudi logistics company.",
    org: "Saudi HLM Logistics",
    year: "Client",
    role: "Designed and built the website",
    kind: "client-site",
    logo: "/projects/logos/saudihlm.png",
    logoWide: true,
    shot: "/projects/shots/saudihlm.webp",
    links: [{ label: "saudihlm.com", href: "https://saudihlm.com/" }],
    summary: "Company website for Saudi HLM: transport, storage, and delivery services, in Arabic and English.",
    built: ["Designed and built the website."],
    stack: ["Next.js"],
    metrics: [],
    decisions: [],
    featured: false,
  },
  {
    slug: "era-ventures",
    title: "ERA Ventures",
    line: "Website for a Riyadh private-workspace and startup ecosystem.",
    org: "ERA Ventures, Riyadh",
    year: "Client",
    role: "Designed and built the website",
    kind: "client-site",
    logo: "/projects/logos/era.png",
    logoDark: true,
    logoWide: true,
    shot: "/projects/shots/era.webp",
    links: [{ label: "era-ventures.sa", href: "https://www.era-ventures.sa/" }],
    summary: "Bilingual website for ERA Ventures, a private workspace and business ecosystem for founders and startups.",
    built: ["Designed and built the website."],
    stack: [],
    metrics: [],
    decisions: [],
    featured: false,
  },
];

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);
export const caseStudies = projects.filter((p) => p.kind === "product");
