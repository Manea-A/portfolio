"use client";

import { useEffect, useRef } from "react";

/*
 * "Complexity to clarity", drawn on one fixed canvas behind the home page.
 *
 * In the hero, threads enter on the left and drift through a slow curl-noise
 * field, braiding loosely around each other (complexity). Moving right the
 * swirl eases off and every thread settles into its own evenly spaced lane
 * (clarity). On wide screens the lanes then bend down into a bundle of rails
 * in the page margin that runs the length of the page and crosses to the
 * other side at each section.
 *
 * Light moves through it: a soft sheen sweeps along the lines, and glowing
 * pulses with fading tails travel the threads and flow down the rails at
 * their own steady pace.
 *
 * Cheap by design: the rail path is precomputed per layout, hero threads are
 * built once per layout and drawn from one cached path, and nothing runs
 * while the tab is hidden.
 * Narrow screens keep the hero part only; reduced motion draws still frames.
 */

const THREADS = 26;
const MAX_STEPS = 640; // points per hero thread
const BEND = 16; // points in the bend from lane to rail
const CONTENT = 1152; // max-w-6xl
const TURN = 170; // px a lane takes to bend from horizontal to vertical
const SAMPLE = 3; // px between samples along the rail centreline
const TAIL = 18; // points in a hero pulse's tail

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(Math.max((v - a) / (b - a), 0), 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const rgbOf = (ctx: CanvasRenderingContext2D, css: string) => {
  ctx.fillStyle = "#000";
  ctx.fillStyle = css;
  const hex = ctx.fillStyle;
  return [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
};

export default function ClarityField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vw = 0;
    let vh = 0;
    let dark = false;
    const col = { muted: "", mutedSoft: "", accent: "", accentSoft: "", glow: "", glowSoft: "" };
    let raf = 0;
    let frame = 0;

    // layout, in document coordinates
    let heroTop = 0;
    let heroH = 0;
    let docH = 0;
    let sectionTops: number[] = [];
    // at the bottom of the home page the rails turn and fan out across the
    // closing contact band and footer
    let turnY = Infinity;
    let spreads: Float32Array[] = [];
    let spreadDir = 1;
    let rail = false;
    let railRight = 0;
    let railLeft = 0;
    let gap = 3.2;
    // rail centreline down the whole page, sampled every SAMPLE px, with a
    // unit normal at each sample (lanes are offsets along it)
    let cx = new Float32Array(0);
    let cy = new Float32Array(0);
    let nx = new Float32Array(0);
    let ny = new Float32Array(0);

    let scrollY = window.scrollY;

    // phones use fewer threads and a slimmer rail bundle; see measure()
    let lanes = THREADS;
    let wide = true;
    const seeds = Array.from({ length: THREADS }, () => ({
      r: Math.random(),
      phase: Math.random(),
      speed: 0.7 + Math.random() * 0.6,
      wobble: Math.random() * 2.4,
    }));
    // lane k is fed by the thread entering k-th from the top, so threads never
    // cross once resolved
    let order: (readonly [number, number])[] = [];
    const paths = seeds.map(() => new Float32Array((MAX_STEPS + BEND) * 2));
    const counts = new Int32Array(THREADS);

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const m = rgbOf(ctx, cs.getPropertyValue("--muted").trim() || "#5c5d65");
      const a = rgbOf(ctx, cs.getPropertyValue("--accent").trim() || "#2b55c9");
      const bg = rgbOf(ctx, cs.getPropertyValue("--bg").trim() || "#fafaf9");
      dark = bg[0] + bg[1] + bg[2] < 300;
      const g = dark ? [214, 226, 255] : a.map((v) => Math.round(v * 0.85));
      const rgba = (c: number[], o: number) => `rgba(${c.join(",")},${o})`;
      col.muted = rgba(m, 0.5);
      col.mutedSoft = rgba(m, 0.22);
      col.accent = rgba(a, 0.55);
      col.accentSoft = rgba(a, 0.3);
      col.glow = rgba(g, 1);
      col.glowSoft = rgba(g, 0);
      heroImg = null;
    };

    let lastW = 0;
    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth;
      vh = window.innerHeight;
      lastW = vw;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      scrollY = window.scrollY;
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const hr = hero?.getBoundingClientRect();
      heroTop = (hr?.top ?? 0) + scrollY;
      heroH = hr?.height ?? vh;
      docH = document.documentElement.scrollHeight;
      sectionTops = [...document.querySelectorAll<HTMLElement>("main > section")]
        .slice(1)
        .map((s) => s.getBoundingClientRect().top + scrollY);

      // wide screens: a full bundle in the empty margin beside the content.
      // Otherwise a slim bundle inside the page gutter (px-5 / px-8).
      const margin = (vw - CONTENT) / 2;
      wide = margin >= 96;
      const gutter = wide ? margin : Math.max(margin, 0) + (vw >= 768 ? 32 : 20);
      lanes = wide ? THREADS : 6;
      gap = wide ? Math.min(3.2, (margin - 36) / lanes) : Math.min(2, (gutter - 8) / lanes);
      rail = gutter >= 16;
      railRight = vw - gutter / 2;
      railLeft = gutter / 2;
      order = seeds
        .slice(0, lanes)
        .map((sd, i) => [(i + sd.r) / lanes, i] as const)
        .sort((a, b) => a[0] - b[0]);

      buildRail();
      buildSpreads();
      trace();
    };

    // Each lane bends out of the rail and runs across the page in its own
    // row; rows open up from a few px apart to an even spread over the
    // bottom of the page. The lane nearest the content takes the top row so
    // the curves nest without crossing.
    const buildSpreads = () => {
      spreads = [];
      turnY = Infinity;
      if (!rail || !document.querySelector("#contact")) return;
      // the rows fill the space under the contact buttons and the footer
      const span = Math.min(wide ? 140 : 110, docH * 0.1);
      const top = docH - span - 14;
      turnY = top - (wide ? 60 : 44);
      const x0c = cx[idxAt(turnY)];
      spreadDir = x0c > vw / 2 ? -1 : 1;
      const reach = wide ? 160 : 70;
      const end = spreadDir > 0 ? vw + 20 : -20;
      for (let lane = 0; lane < lanes; lane++) {
        const off = laneOffset(lane);
        const rank = spreadDir > 0 ? lane : lanes - 1 - lane;
        const fy = top + (rank * span) / Math.max(1, lanes - 1);
        const p0 = [0, 0];
        lanePoint(idxAt(turnY), off, p0);
        const [sx, sy] = p0;
        const ex = sx + spreadDir * reach;
        const pts: number[] = [];
        for (let k = 0; k <= 24; k++) {
          const u = k / 24;
          // quadratic: down the rail, then out along the row
          const a = (1 - u) * (1 - u);
          const b = 2 * (1 - u) * u;
          const c = u * u;
          pts.push(a * sx + b * sx + c * ex, a * sy + b * fy + c * fy);
        }
        for (let x = ex + spreadDir * 10; spreadDir * (end - x) > 0; x += spreadDir * 10) pts.push(x, fy);
        spreads.push(new Float32Array(pts));
      }
    };

    /*
     * The rail runs down one side of the page and, where a section changes
     * side, crosses like a line on a transit map: a quarter circle, a
     * straight run along the section divider, and a quarter circle back
     * down. Each lane is the centreline offset along its normal, so every
     * lane is a concentric curve and the spacing never pinches.
     */
    const buildRail = () => {
      const R = wide ? 140 : 36;
      const xs: number[] = [];
      const ys: number[] = [];
      let x = railRight;
      let y = 0;
      const lineTo = (x2: number, y2: number) => {
        const d = Math.hypot(x2 - x, y2 - y);
        const n = Math.max(1, Math.ceil(d / SAMPLE));
        for (let k = 1; k <= n; k++) {
          xs.push(x + ((x2 - x) * k) / n);
          ys.push(y + ((y2 - y) * k) / n);
        }
        x = x2;
        y = y2;
      };
      const arc = (ox: number, oy: number, f: (t: number) => [number, number]) => {
        const n = Math.ceil((Math.PI / 2) * R / SAMPLE);
        for (let k = 1; k <= n; k++) {
          const [dx, dy] = f((k / n) * (Math.PI / 2));
          xs.push(ox + dx * R);
          ys.push(oy + dy * R);
        }
        x = xs[xs.length - 1];
        y = ys[ys.length - 1];
      };
      xs.push(x);
      ys.push(y);
      sectionTops.forEach((top, s) => {
        const side = s < 2 ? railRight : s % 2 === 0 ? railLeft : railRight;
        if (Math.abs(side - x) < 1 || top - R < y + 4) return;
        const dir = Math.sign(side - x);
        const xa = x;
        lineTo(xa, top - R);
        arc(xa + dir * R, top - R, (t) => [-dir * Math.cos(t), Math.sin(t)]);
        lineTo(side - dir * R, top);
        arc(side - dir * R, top + R, (t) => [dir * Math.sin(t), -Math.cos(t)]);
      });
      lineTo(x, docH + 40);

      const n = xs.length;
      cx = new Float32Array(xs);
      cy = new Float32Array(ys);
      nx = new Float32Array(n);
      ny = new Float32Array(n);
      for (let k = 0; k < n; k++) {
        const a = Math.max(0, k - 1);
        const b = Math.min(n - 1, k + 1);
        const tx = cx[b] - cx[a];
        const ty = cy[b] - cy[a];
        const len = Math.hypot(tx, ty) || 1;
        // normal (ty, -tx): +x on a downward run, matching laneOffset
        nx[k] = ty / len;
        ny[k] = -tx / len;
      }
    };
    // first centreline sample at or below document y (y never decreases)
    const idxAt = (y: number) => {
      let lo = 0;
      let hi = cy.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cy[mid] < y) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    };
    const laneOffset = (lane: number) => ((lanes - 1) / 2 - lane) * gap;
    const lanePoint = (k: number, off: number, out: number[]) => {
      out[0] = cx[k] + nx[k] * off;
      out[1] = cy[k] + ny[k] * off;
    };

    /*
     * Build every hero thread once per layout (document coordinates). Each
     * thread scribbles in loose loops inside a knot on the left, the loops
     * shrink as it travels right, it leaves as one line with a soft fading
     * wave, settles into its lane and bends down into the rail. The shape
     * is fixed; only the light moving along it animates.
     */
    let heroPath = new Path2D();
    const rand = (k: number) => {
      const v = Math.sin(k * 127.1 + 311.7) * 43758.5453;
      return v - Math.floor(v);
    };
    const trace = () => {
      const h = heroH;
      const kx = vw * (wide ? 0.12 : 0.18);
      const knotW = vw * (wide ? 0.16 : 0.3);
      heroPath = new Path2D();
      heroImg = null;
      order.forEach(([entry, i], lane) => {
        const pts = paths[lane];
        const r = (k: number) => rand(i * 13 + k);
        const laneY = h * (0.1 + 0.8 * ((lane + 0.5) / lanes));
        const endX = rail ? railRight - (wide ? 90 : 40) - (lanes - lane) * (wide ? 2.6 : 5) : vw + 20;
        // this thread's place in the knot and the shape of its loops
        const ky = h * (0.5 + (entry - 0.5) * 0.55);
        const amp = h * (0.1 + 0.16 * r(1)) * (wide ? 1 : 0.8);
        const loops = 6 + Math.floor(r(2) * 6);
        const p1 = r(3) * 6.283;
        const p2 = r(4) * 6.283;
        const p3 = r(5) * 6.283;
        const startX = -amp - 30;
        let n = 0;
        for (; n < MAX_STEPS; n++) {
          const u = n / (MAX_STEPS - 1);
          // most of the length is spent inside the knot, then it travels
          const travel = smooth(0.5, 1, u);
          const bx = startX + (kx + knotW - startX) * Math.min(u / 0.5, 1) * (1 - travel) + travel * endX;
          const chaos = 1 - smooth(0.38, 0.66, u);
          const wave = (1 - smooth(0.6, 0.92, u)) * (1 - chaos);
          const by = ky + (laneY - ky) * smooth(0.45, 0.88, u);
          const a = u * loops * 6.283;
          const wobble = 0.65 + 0.35 * Math.sin(u * 9.1 + p3);
          const x = bx + Math.sin(a + p1) * amp * 0.9 * wobble * chaos;
          const y = by + Math.cos(a * 1.07 + p2) * amp * wobble * chaos + Math.sin(u * 40 + p3) * 12 * wave;
          pts[n * 2] = x;
          pts[n * 2 + 1] = y + heroTop;
        }
        if (rail) {
          // bend down into this lane's rail
          const x0 = pts[(n - 1) * 2];
          const y0 = pts[(n - 1) * 2 + 1];
          const x3 = railRight + laneOffset(lane);
          for (let k = 1; k <= BEND; k++) {
            const u = k / BEND;
            const b2 = 3 * (1 - u) ** 2 * u;
            const c = 3 * (1 - u) * u * u;
            const d = u ** 3;
            const a2 = (1 - u) ** 3;
            pts[n * 2] = a2 * x0 + b2 * (x0 + (x3 - x0) * 0.75) + (c + d) * x3;
            pts[n * 2 + 1] = (a2 + b2) * y0 + c * (y0 + TURN * 0.35) + d * (y0 + TURN);
            n++;
          }
        }
        counts[lane] = n;
        heroPath.moveTo(pts[0], pts[1]);
        for (let k = 1; k < n; k++) heroPath.lineTo(pts[k * 2], pts[k * 2 + 1]);
      });
    };

    // Paint the fixed hero lines once into an offscreen bitmap (grey on the
    // tangled left, accent once resolved). Repainted on layout/theme change.
    let heroImg: HTMLCanvasElement | null = null;
    let heroImgTop = 0;
    // the hero copy's box (document coords); pulses don't pass through it
    let quiet = { x0: 0, x1: 0, y0: 0, y1: 0 };
    const paintHero = () => {
      const dpr = canvas.width / vw;
      let maxY = heroTop + heroH;
      for (let lane = 0; lane < lanes; lane++) maxY = Math.max(maxY, paths[lane][(counts[lane] - 1) * 2 + 1]);
      heroImgTop = heroTop - 60;
      const img = document.createElement("canvas");
      img.width = canvas.width;
      img.height = Math.ceil((maxY + 20 - heroImgTop) * dpr);
      const g = img.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, -heroImgTop * dpr);
      const grad = g.createLinearGradient(0, 0, vw, 0);
      grad.addColorStop(0, col.mutedSoft);
      grad.addColorStop(0.3, col.muted);
      grad.addColorStop(0.72, col.accent);
      grad.addColorStop(1, col.accent);
      g.strokeStyle = grad;
      g.lineWidth = 1;
      g.lineJoin = "round";
      g.globalAlpha = 0.75;
      g.stroke(heroPath);
      // quiet zone: fade the lines softly behind the hero copy so it reads
      // cleanly, while the knot still shows around it
      const copy = document.querySelector<HTMLElement>("[data-hero-copy]");
      if (copy) {
        const r = copy.getBoundingClientRect();
        quiet = { x0: r.left - 30, x1: r.right + 30, y0: r.top + scrollY - 30, y1: r.bottom + scrollY + 30 };
        const cxm = r.left + r.width / 2;
        const cym = r.top + scrollY + r.height / 2;
        const rx = r.width * 0.68;
        const ry = r.height * 0.62;
        g.save();
        g.globalAlpha = 1;
        g.globalCompositeOperation = "destination-out";
        g.translate(cxm, cym);
        g.scale(rx / ry, 1);
        const q = g.createRadialGradient(0, 0, 0, 0, 0, ry);
        q.addColorStop(0, "rgba(0,0,0,0.85)");
        q.addColorStop(0.65, "rgba(0,0,0,0.75)");
        q.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = q;
        g.fillRect(-ry, -ry, ry * 2, ry * 2);
        g.restore();
      }
      heroImg = img;
    };

    const p = [0, 0];
    const draw = (time: number) => {
      ctx.clearRect(0, 0, vw, vh);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const heroVisible = heroTop + heroH + TURN > scrollY;

      if (heroVisible) {
        if (!heroImg) paintHero();
        const dpr = canvas.width / vw;
        // the hero lines are a cached bitmap; draw it at device pixels
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.drawImage(heroImg!, 0, Math.round((heroImgTop - scrollY) * dpr));
        ctx.restore();
      }

      if (rail) {
        // rails: one path, with light drifting down them as you scroll
        const from0 = scrollY - 20;
        const to = Math.min(docH, turnY, scrollY + vh + 20);
        const grad = ctx.createLinearGradient(0, 0, 0, vh);
        const band = reduced ? -1 : (((time * 0.00006) % 1.6) - 0.3);
        grad.addColorStop(0, col.accentSoft);
        if (band > 0.05 && band < 0.95) {
          grad.addColorStop(band - 0.05, col.accentSoft);
          grad.addColorStop(band, col.accent);
          grad.addColorStop(band + 0.05, col.accentSoft);
        }
        grad.addColorStop(1, col.accentSoft);
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let lane = 0; lane < lanes; lane++) {
          const n = counts[lane];
          const start = Math.max(paths[lane][(n - 1) * 2 + 1], from0);
          if (to <= start) continue;
          const off = laneOffset(lane);
          const k0 = idxAt(start);
          const k1 = Math.min(cx.length - 1, idxAt(to));
          lanePoint(k0, off, p);
          ctx.moveTo(p[0], p[1] - scrollY);
          for (let k = k0 + 2; k <= k1; k += 2) {
            lanePoint(k, off, p);
            ctx.lineTo(p[0], p[1] - scrollY);
          }
          lanePoint(k1, off, p);
          ctx.lineTo(p[0], p[1] - scrollY);
        }
        ctx.stroke();
      }

      if (spreads.length && turnY - 40 < scrollY + vh) {
        // fade toward the far edge of the page
        const g = ctx.createLinearGradient(spreadDir > 0 ? 0 : vw, 0, spreadDir > 0 ? vw : 0, 0);
        g.addColorStop(0, col.accent);
        g.addColorStop(0.55, col.accentSoft);
        g.addColorStop(1, col.glowSoft);
        ctx.strokeStyle = g;
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const sp of spreads) {
          ctx.moveTo(sp[0], sp[1] - scrollY);
          for (let k = 1; k < sp.length / 2; k++) ctx.lineTo(sp[k * 2], sp[k * 2 + 1] - scrollY);
        }
        ctx.stroke();
      }

      if (reduced) return;

      // pulses: a soft halo plus a bright core that fades along its tail
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (let lane = 0; lane < lanes; lane++) {
        const seed = seeds[order[lane][1]];
        const pts = paths[lane];
        const n = counts[lane];

        if (heroVisible && n > TAIL) heroComet: {
          const head = Math.floor(((time * 0.00005 * seed.speed + seed.phase) % 1) * (n - 1));
          const hx = pts[head * 2];
          const hy = pts[head * 2 + 1];
          if (hx > quiet.x0 && hx < quiet.x1 && hy > quiet.y0 && hy < quiet.y1) break heroComet;
          comet((k, out) => {
            const idx = Math.max(0, head - TAIL + k);
            out[0] = pts[idx * 2];
            out[1] = pts[idx * 2 + 1] - scrollY;
          }, TAIL);
        }

        if (rail) {
          // in centreline samples, so the pulse follows crossings at an even pace
          const s0 = idxAt(pts[(n - 1) * 2 + 1]);
          const s1 = idxAt(Math.min(docH, turnY));
          const length = s1 - s0;
          // a steady flow: pulses every ~1700px of rail, each moving at its
          // lane's own pace, independent of scrolling
          const every = Math.round((wide ? 1700 : 1100) / SAMPLE);
          if (length > 30) {
            const off = laneOffset(lane);
            const shift = Math.floor((time * 0.06 * seed.speed) / SAMPLE + seed.phase * every) % every;
            for (let head = s0 + shift; head < s1; head += every) {
              const hy = cy[head];
              if (head - s0 < 26 || hy < scrollY - 80 || hy - 80 > scrollY + vh) continue;
              comet((k, out) => {
                lanePoint(head - 26 + Math.round((k * 26) / 16), off, out);
                out[1] -= scrollY;
              }, 16);
            }
          }
        }

        // data running out along the footer rows
        const sp = spreads[lane];
        if (sp && turnY - 40 < scrollY + vh) {
          const m = sp.length / 2;
          const head = Math.floor(((time * 0.00011 * seed.speed + seed.phase) % 1) * (m - 1));
          if (head > 4) {
            comet((k, out) => {
              const idx = Math.max(0, head - 14 + k);
              out[0] = sp[idx * 2];
              out[1] = sp[idx * 2 + 1] - scrollY;
            }, 14);
          }
        }
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    // draws a comet along `count` points supplied by `point`, tail first
    const q = [0, 0];
    const r = [0, 0];
    const comet = (point: (k: number, out: number[]) => void, count: number) => {
      ctx.strokeStyle = col.glow;
      // halo
      ctx.globalAlpha = dark ? 0.16 : 0.12;
      ctx.lineWidth = 5;
      ctx.beginPath();
      point(Math.floor(count / 2), q);
      ctx.moveTo(q[0], q[1]);
      for (let k = Math.floor(count / 2) + 1; k <= count; k++) {
        point(k, q);
        ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke();
      // core, brightening toward the head
      ctx.lineWidth = 1.6;
      point(0, r);
      for (let k = 1; k <= count; k++) {
        point(k, q);
        ctx.globalAlpha = (k / count) ** 1.6 * 0.95;
        ctx.beginPath();
        ctx.moveTo(r[0], r[1]);
        ctx.lineTo(q[0], q[1]);
        ctx.stroke();
        r[0] = q[0];
        r[1] = q[1];
      }
      // head
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = col.glow;
      ctx.beginPath();
      ctx.arc(q[0], q[1], 1.7, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = (time: number) => {
      frame++;
      const heroVisible = heroTop + heroH + TURN > scrollY;
      // full rate while the hero is on screen, every other frame below it
      if (heroVisible || frame % 2 === 0) draw(time);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!reduced && !document.hidden && !raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    readColors();
    measure();
    draw(performance.now());
    start();

    const onScroll = () => {
      const y = window.scrollY;
      scrollY = y;
      if (reduced) draw(0);
    };
    let resizeQueued = 0;
    const onResize = () => {
      // phones change the height as the address bar shows and hides; only a
      // width change or a big jump needs a full re-layout
      if (window.innerWidth === lastW && Math.abs(window.innerHeight - vh) < 160 && docH === document.documentElement.scrollHeight) {
        if (window.innerHeight > vh) {
          // grow the canvas so the bottom strip isn't left bare
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          vh = window.innerHeight;
          canvas.height = Math.round(vh * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        return;
      }
      cancelAnimationFrame(resizeQueued);
      resizeQueued = requestAnimationFrame(() => {
        measure();
        draw(performance.now());
      });
    };
    // page height changes as images load
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    const onVisibility = () => (document.hidden ? stop() : start());
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readColors();
      draw(performance.now());
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    scheme.addEventListener("change", onScheme);
    window.addEventListener("themechange", onScheme);

    return () => {
      stop();
      cancelAnimationFrame(resizeQueued);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      scheme.removeEventListener("change", onScheme);
      window.removeEventListener("themechange", onScheme);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
