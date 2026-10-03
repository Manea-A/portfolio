# Manea Abdullah — Portfolio

Personal site for a systems architect and engineering lead.
Next.js 15 (App Router, fully static), Tailwind CSS 4, Geist. No animation
libraries; all content is server-rendered and readable without JavaScript.

## Structure

| Path | What |
|---|---|
| `app/page.tsx` | Home: intro, selected work, experience, expertise, about, contact |
| `app/work/[slug]/page.tsx` | One static case-study page per project |
| `lib/projects.ts` | All case-study content, metrics, and architecture diagrams |
| `lib/site.ts` | Site URL, email, and profile links |
| `components/ArchDiagram.tsx` | Architecture diagrams drawn from the data in `projects.ts` |

## Design

Neutral, editorial, one accent colour. Light theme by default; dark follows
the OS. Tokens live at the top of `app/globals.css`; every text colour meets
WCAG AA contrast.

## Adding screenshots

Put an image in `public/projects/` and set `image: "/projects/<file>.png"` on
the project in `lib/projects.ts`. It appears at the top of the case study.

## Run locally

```bash
npm install
npm run dev
```
