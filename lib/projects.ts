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
  /** full wordmark (name included), used in the live-products strip */
  wordmark?: string;
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

/* Order matters: Selected work follows this order exactly (Manea's pick).
   Everything with kind "client-site" goes under Other projects.
   Projects with no public link (AIP, Basmah, Golden Point, Saudi Waves)
   keep `links` empty on purpose: show screenshots, never the URL. */
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
    shot: "/projects/shots/isopluss-below.webp",
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
    slug: "sqs",
    title: "SQS",
    line: "Smart Quality Solutions: the company behind ISOPluss, HaccPlus, and IsoProfissional, with consulting and custom systems for quality and food safety.",
    org: "Smart Quality Solutions, Saudi Arabia",
    year: "2026",
    role: "Built the company website and the platform behind its products",
    kind: "product",
    logo: "/projects/logos/sqs.png",
    shot: "/projects/shots/sqs.webp",
    links: [{ label: "sqs.sa", href: "https://sqs.sa/" }],
    summary:
      "SQS builds digital platforms for quality, compliance, and food safety, and helps organizations in Saudi Arabia put integrated management systems in place, from gap analysis to audit readiness. Three products run on one platform, all in Arabic and English, alongside consulting, training, and custom-built systems.",
    problem:
      "Quality systems usually live in binders and spreadsheets, so they work on audit day and nowhere else. SQS pairs software that runs on the production floor with the consultants who implement it.",
    built: [
      "Designed and built sqs.sa: Arabic-first with right-to-left by default and a full English version, presenting the product family, consulting, custom solutions, and the industries served.",
      "The three products share one multi-tenant platform, so a new standard or product is configuration rather than a new codebase.",
      "Each product page leads straight to a 30-minute demo or a consulting request, with one contact flow across the site.",
    ],
    flow: ["Gap analysis", "Process design", "Documentation", "Audit readiness", "Certification"],
    stack: ["HTML", "CSS", "JavaScript"],
    metrics: [
      { value: "3", label: "Products on one platform" },
      { value: "AR / EN", label: "Arabic-first, fully bilingual" },
    ],
    decisions: [],
    familyTitle: "Products by SQS",
    family: [
      {
        title: "ISOPluss",
        line: "Food safety management: ISO 22000, FSSC 22000, and HACCP with traceability and monitoring for every production line.",
        logo: "/projects/logos/isopluss.png",
        shot: "/projects/shots/isopluss-console.webp",
        href: "https://isopluss.org/",
      },
      {
        title: "HaccPlus",
        line: "A HACCP plan that runs on the factory floor: daily checks from the phone, CCP readings, and records ready for the inspector.",
        logo: "/projects/logos/haccplus.png",
        shot: "/projects/shots/haccplus.webp",
        href: "https://haccplus.com/",
      },
      {
        title: "IsoProfissional",
        line: "Quality management for ISO 9001 and integrated systems: documents, audits, corrective actions, and management review.",
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
    logo: "/projects/logos/covita.png",
    wordmark: "/projects/logos/covita-wordmark.png",
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
    slug: "aip",
    title: "AIP System",
    line: "Five Arabic-first AI products for organizations: receptionist, agents, speech-to-text, knowledge, and vision.",
    org: "AIP (Artificial Intelligence Place), Riyadh",
    year: "Jan – Oct 2026",
    role: "Software Engineering Lead",
    kind: "product",
    logo: "/projects/logos/aip.png",
    shot: "/projects/shots/aip.webp",
    links: [],
    summary:
      "AIP System is a suite of AI products for organizations in Saudi Arabia, each a full multi-tenant web app in Arabic and English: Nidaa, an AI receptionist on WhatsApp and web; Fath, 105 AI agents across 12 departments; Waseel, Arabic-dialect speech-to-text; Nawa, a knowledge assistant grounded in company documents; and Waqeen, face-recognition attendance on edge cameras.",
    problem:
      "Organizations in the region need AI that works in Arabic dialects, respects who can see what, and answers from their own documents instead of guessing.",
    built: [
      "Led software architecture across the product line and set the cloud and engineering standards behind it.",
      "Architected the AI layer: LLM agents, retrieval-augmented generation with cited sources, and speech and vision pipelines.",
      "Designed every product multi-tenant and isolated, so each query is scoped to its organization by structure, not convention.",
      "Built Arabic-first, right-to-left interfaces with full bilingual switching across all five products.",
    ],
    flow: ["Organization data", "Tenant-scoped retrieval", "LLM agents & models", "Cited answers & actions", "Bilingual dashboards"],
    stack: ["React", "TypeScript", "LLMs", "RAG", "AI agents", "Computer vision"],
    metrics: [
      { value: "5", label: "AI products in one suite" },
      { value: "105", label: "Agents across 12 departments in Fath" },
      { value: "AR / EN", label: "Arabic-first, fully bilingual" },
    ],
    decisions: [
      {
        title: "Grounded, not guessed",
        body: "The knowledge assistant answers only from the organization's documents, cites the passage it used, and declines when the documents are silent.",
      },
      {
        title: "Permissions per department",
        body: "Fath's agents act inside the permissions of the department they serve, so automation never reaches data a person in that role could not.",
      },
    ],
    familyTitle: "Inside the suite",
    family: [
      {
        title: "Fath",
        line: "105 AI agents across finance, HR, procurement, legal, and eight more departments, with live activity and automation insights.",
        logo: "/projects/logos/aip-fath.png",
        shot: "/projects/shots/aip-fath.webp",
      },
      {
        title: "Nidaa",
        line: "AI receptionist that answers patients on WhatsApp and web, books and reschedules appointments, and sends reminders.",
        logo: "/projects/logos/aip-nidaa.png",
        shot: "/projects/shots/aip-nidaa.webp",
      },
      {
        title: "Waseel",
        line: "Speech-to-text for meetings, calls, clinics, and court sessions in Arabic dialects and English, with speakers, summaries, and action items.",
        logo: "/projects/logos/aip-waseel.png",
      },
      {
        title: "Nawa",
        line: "Enterprise knowledge assistant that answers in Arabic or English from the organization's own documents, with citations.",
        logo: "/projects/logos/aip-nawa.png",
      },
      {
        title: "Waqeen",
        line: "Face-recognition attendance across branches on edge cameras, with real-time dashboards, late tracking, and HR sync.",
        logo: "/projects/logos/aip-waqeen.png",
      },
    ],
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
    shot: "/projects/shots/healthwatch-watch.webp",
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
    slug: "basmah",
    title: "Basmah ISMS",
    line: "ISO 27001 compliance console for security consultants, mapped to Saudi NCA and PDPL requirements.",
    org: "Basmat Tech, Riyadh",
    year: "2026",
    role: "Designed and built the platform",
    kind: "product",
    logo: "/projects/logos/basmah.svg",
    shot: "/projects/shots/basmah.webp",
    links: [],
    summary:
      "A multi-client workspace where a consulting firm runs ISO 27001:2022 certification projects end to end: context and scope, gap assessment, Statement of Applicability, controls and evidence, risk register, audits, and documents, in Arabic and English.",
    problem:
      "ISO 27001 projects are usually run across spreadsheets and Word files, so readiness is hard to measure and the Statement of Applicability drifts away from the risk register.",
    built: [
      "Built one control spine for all 93 Annex A controls that drives the readiness score, the gap assessment, and the Statement of Applicability.",
      "Risk register scored by likelihood × impact, with residual risk recalculated from the real implementation status of linked controls and shown on a heat map.",
      "Cross-walked every ISO control to its NCA ECC, NCA CSCC, and PDPL equivalent for Saudi clients.",
      "Read-only integrations with Microsoft Entra ID, Intune, Defender, and Azure to collect evidence automatically.",
      "Firm-level workspaces with roles for platform admins and lead consultants, and signed, httpOnly session cookies.",
    ],
    flow: ["Scope & context", "Gap assessment", "Risk register", "Statement of Applicability", "Audit & certification"],
    stack: ["Next.js", "React", "TypeScript", "Microsoft Graph"],
    metrics: [
      { value: "93", label: "Annex A controls in one spine" },
      { value: "3", label: "Saudi frameworks cross-walked" },
      { value: "AR / EN", label: "Fully bilingual" },
    ],
    decisions: [
      {
        title: "The SoA is derived, not typed",
        body: "Applicability and justification come from the risk register: a control is applicable when a risk treatment needs it, so the SoA can never contradict the risk analysis.",
      },
      {
        title: "Read-only integrations",
        body: "Evidence connectors only request read scopes and never write back, which keeps the console safe to connect to a client's production tenant.",
      },
    ],
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
    shot: "/projects/shots/emars-sld.webp",
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
        shot: "/projects/shots/emars-sld.webp",
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
        shot: "/projects/shots/fms-dashboard.webp",
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
  {
    slug: "saudi-waves",
    title: "Saudi Integrated Waves",
    line: "Website redesign for a Saudi security and IT solutions company.",
    org: "Saudi Integrated Waves",
    year: "Client",
    role: "Designed and built the website",
    kind: "client-site",
    logo: "/projects/logos/saudiwaves.svg",
    shot: "/projects/shots/saudiwaves.webp",
    links: [],
    summary:
      "Corporate website redesign for Saudi Integrated Waves: solutions, the integrated mobile security station, projects, and contact, for government and enterprise buyers.",
    built: ["Designed and built the website."],
    stack: ["Next.js"],
    metrics: [],
    decisions: [],
    featured: false,
  },
  {
    slug: "golden-point",
    title: "The Golden Point",
    line: "Mobile ordering flow for car touch-up pens mixed to your car's factory paint code.",
    org: "The Golden Point, Saudi Arabia",
    year: "2026",
    role: "Designed and built the ordering app",
    kind: "client-site",
    logo: "/projects/logos/goldenpoint.svg",
    logoDark: true,
    shot: "/projects/shots/goldenpoint.webp",
    links: [],
    summary:
      "An Arabic, mobile-first ordering flow for scratch-repair pens matched to a car's factory colour code. Customers pick their car brand, see exactly where that brand prints the paint code, enter it, choose a quantity, and drop a pin for delivery, in under a minute.",
    problem:
      "Most customers don't know their paint code or where to find it, and every brand hides it in a different place.",
    built: [
      "Designed and built the full ordering flow, step by step, with progress shown at the top.",
      "Brand guides for 21 car makers sold in Saudi Arabia, with real label photos showing where the colour code is printed.",
      "Live price and quantity summary, and delivery details with location on the map.",
      "Right-to-left Arabic interface built for phones first.",
    ],
    flow: ["Choose car brand", "Find the paint code", "Enter code", "Quantity & price", "Delivery location"],
    stack: ["JavaScript", "HTML", "CSS"],
    metrics: [
      { value: "21", label: "Car brands supported" },
      { value: "<1 min", label: "From start to order" },
    ],
    decisions: [],
    featured: false,
  },
];

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);
export const caseStudies = projects.filter((p) => p.kind === "product");
