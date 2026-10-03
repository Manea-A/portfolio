# Manea Abdullah — Portfolio

Dark editorial portfolio for a systems architect. Next.js 15 (App Router),
Tailwind CSS 4, zero animation libraries — motion is IntersectionObserver +
CSS, the hero graph is vanilla Canvas 2D.

## Design system

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0B0A08` | Background (warm near-black) |
| `--paper` | `#EDE8DE` | Primary text |
| `--muted` | `#97907F` | Secondary text |
| `--brass` | `#C99A3F` | The single accent |

Type voices: **Archivo** (wdth 125, uppercase) for display · Archivo for body ·
**Fragment Mono** for labels/metrics · **Instrument Serif italic** for the one
editorial word per screen.

Accessibility baseline: WCAG AA contrast, keyboard focus states, skip link,
`prefers-reduced-motion` respected everywhere (canvas renders a static frame).

## Run locally

```bash
npm install
npm run dev
```

## Deploy (GitHub → Vercel)

1. Create a new GitHub repo and push this folder:
   ```bash
   git init && git add -A && git commit -m "Portfolio v1"
   git remote add origin git@github.com:<you>/portfolio.git
   git push -u origin main
   ```
2. On vercel.com → **Add New Project** → import the repo. No config needed —
   Vercel detects Next.js. You get `<project>.vercel.app` immediately.
3. Later: buy a domain and add it in Vercel → Settings → Domains.

## Content lives in one place

All project copy, metrics, and architecture diagrams: `lib/projects.ts`.
Experience, capabilities, recognition: `app/page.tsx`. No CMS to maintain.
