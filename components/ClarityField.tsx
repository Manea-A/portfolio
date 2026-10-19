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
 * pulses with fading tails travel the threads and race down the rails while
 * you scroll.
 *
 * Cheap by design: the rail path is precomputed per layout, hero threads are
 * re-traced every other frame, and nothing runs while the tab is hidden.
 * Narrow screens keep the hero part only; reduced motion draws still frames.
 */

const THREADS = 26;
const STEP = 9; // px per integration step in the hero
const MAX_STEPS = 320;
const BEND = 16; // points in the bend from lane to rail
const CONTENT = 1152; // max-w-6xl
const TURN = 170; // px a lane takes to bend from horizontal to vertical
const CROSS = 300; // px a rail takes to cross to the other side
const RES = 4; // px resolution of the precomputed rail path
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
    let rail = false;
    let railRight = 0;
    let railLeft = 0;
    let gap = 3.2;
    let railXs = new Float32Array(0); // rail centre x every RES px of the page
    let railSlope = new Float32Array(0);
    // circuit traces from the rail to each project card
    type Trace = { top: number; bottom: number; branch: Float32Array; loop: Float32Array; phase: number };
    let traces: Trace[] = [];

    let scrollY = window.scrollY;
    let pulseShift = 0; // extra pulse travel earned by scrolling
    const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4 };

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

      // precompute where the rail bundle sits down the whole page: right
      // first, then alternating from the experience section on
      const n = Math.ceil(docH / RES) + 2;
      railXs = new Float32Array(n);
      railSlope = new Float32Array(n);
      for (let k = 0; k < n; k++) {
        const y = k * RES;
        let x = railRight;
        sectionTops.forEach((top, s) => {
          const side = s < 2 ? railRight : s % 2 === 0 ? railLeft : railRight;
          x += (side - x) * smooth(top - CROSS / 2, top + CROSS / 2, y);
        });
        railXs[k] = x;
      }
      for (let k = 1; k < n - 1; k++) railSlope[k] = (railXs[k + 1] - railXs[k - 1]) / (2 * RES);
      traces = rail ? [...document.querySelectorAll<HTMLElement>("[data-trace]")].map(buildTrace) : [];
      trace(performance.now());
    };

    // layout position ignoring transforms (cards lift on hover and rise in)
    const docRect = (el: HTMLElement) => {
      let x = 0;
      let y = 0;
      for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) {
        x += e.offsetLeft;
        y += e.offsetTop;
      }
      return { left: x, top: y, right: x + el.offsetWidth, bottom: y + el.offsetHeight };
    };

    // A branch from the rail's inner line to the card, and the card's outline
    // (7px outside its border) as a closed loop starting where the branch lands.
    const buildTrace = (el: HTMLElement): Trace => {
      const r = docRect(el);
      const pad = wide ? 7 : 3;
      const R = 16 + pad;
      const x0 = r.left - pad;
      const y0 = r.top - pad;
      const x1 = r.right + pad;
      const y1 = r.bottom + pad;
      const yb = r.top + 46;
      const rx = at(railXs, yb);
      const right = rx > vw / 2;
      const dir = right ? -1 : 1; // from the rail toward the content
      const startX = rx + (right ? laneOffset(lanes - 1) : laneOffset(0));
      const entryX = right ? x1 : x0;
      // the bend can't be wider than the gap it crosses (tight on phones)
      const bend = Math.max(3, Math.min(30, Math.abs(entryX - startX) * 0.8));

      const b: number[] = [];
      for (let y = yb - 70; y < yb - bend; y += 6) b.push(startX, y);
      for (let k = 0; k <= 8; k++) {
        const a = (k / 8) * (Math.PI / 2);
        b.push(startX + dir * bend * (1 - Math.cos(a)), yb - bend + bend * Math.sin(a));
      }
      for (let x = startX + dir * (bend + 6); dir * (entryX - x) > 0; x += dir * 8) b.push(x, yb);
      b.push(entryX, yb);

      // rounded-rect perimeter, clockwise from the top-left end of the top edge
      const W = x1 - x0 - 2 * R;
      const H = y1 - y0 - 2 * R;
      const arc = (Math.PI / 2) * R;
      const P = 2 * W + 2 * H + 4 * arc;
      const pointAt = (s: number): [number, number] => {
        s = ((s % P) + P) % P;
        if (s < W) return [x0 + R + s, y0];
        s -= W;
        if (s < arc) { const a = s / R; return [x1 - R + Math.sin(a) * R, y0 + R - Math.cos(a) * R]; }
        s -= arc;
        if (s < H) return [x1, y0 + R + s];
        s -= H;
        if (s < arc) { const a = s / R; return [x1 - R + Math.cos(a) * R, y1 - R + Math.sin(a) * R]; }
        s -= arc;
        if (s < W) return [x1 - R - s, y1];
        s -= W;
        if (s < arc) { const a = s / R; return [x0 + R - Math.sin(a) * R, y1 - R + Math.cos(a) * R]; }
        s -= arc;
        if (s < H) return [x0, y1 - R - s];
        s -= H;
        const a = s / R;
        return [x0 + R - Math.cos(a) * R, y0 + R - Math.sin(a) * R];
      };
      const entry = right ? W + arc + (yb - y0 - R) : 2 * W + H + 3 * arc + (y1 - R - yb);
      const count = Math.ceil(P / 6);
      const loop = new Float32Array((count + 1) * 2);
      for (let k = 0; k <= count; k++) {
        const [x, y] = pointAt(entry + (k * P) / count);
        loop[k * 2] = x;
        loop[k * 2 + 1] = y;
      }
      return { top: r.top, bottom: r.bottom, branch: new Float32Array(b), loop, phase: Math.random() };
    };

    const at = (arr: Float32Array, y: number) => {
      const f = Math.min(Math.max(y / RES, 0), arr.length - 1.001);
      const k = Math.floor(f);
      return arr[k] + (arr[k + 1] - arr[k]) * (f - k);
    };
    const laneOffset = (lane: number) => ((lanes - 1) / 2 - lane) * gap;
    // a point on a rail, offset perpendicular to the bundle so the lines keep
    // their spacing through a crossing
    const railPoint = (y: number, off: number, out: number[]) => {
      const s = at(railSlope, y);
      const len = Math.hypot(s, 1);
      out[0] = at(railXs, y) + off / len;
      out[1] = y - (off * s) / len;
    };

    // trace every hero thread (document coordinates) into `paths`
    const trace = (time: number) => {
      const t = time * 0.00009;
      const h = heroH;
      const px = pointer.x;
      const py = pointer.y + scrollY - heroTop;
      order.forEach(([entry, i], lane) => {
        const pts = paths[lane];
        const wob = t + seeds[i].wobble;
        let x = -20;
        let y = entry * h;
        const laneY = h * (0.1 + 0.8 * ((lane + 0.5) / lanes));
        const endX = rail ? railRight - (wide ? 90 : 40) - (lanes - lane) * (wide ? 2.6 : 5) : vw + 20;
        let n = 0;
        for (; n < MAX_STEPS && x < endX; n++) {
          pts[n * 2] = x;
          pts[n * 2 + 1] = y + heroTop;
          // 1 = tangled, 0 = resolved
          const chaos = 1 - smooth(vw * 0.04, vw * 0.58, x);
          let vx = 0.8 + (1 - chaos) * 1.2;
          let vy = Math.max(-1, Math.min(1, (laneY - y) * 0.03)) * (1 - chaos);
          if (chaos > 0.01) {
            // one slow octave of curl noise: wide, loose loops
            const s1 = x * 0.0043 + wob;
            const s2 = y * 0.0052 - wob * 0.8;
            const s3 = (x * 0.6 - y) * 0.0029 + wob * 1.2;
            vx += (-0.0052 * Math.sin(s1) * Math.sin(s2) - 0.0017 * Math.cos(s3)) * 330 * chaos;
            vy += -(0.0043 * Math.cos(s1) * Math.cos(s2) + 0.001 * Math.cos(s3)) * 330 * chaos;
          }
          const dx = x - px;
          const dy = y - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < 22000) {
            const f = (1 - d2 / 22000) * 1.5;
            vx += (-dy / 70) * f;
            vy += (dx / 70) * f;
          }
          const len = Math.hypot(vx, vy) || 1;
          x += (vx / len) * STEP;
          y += (vy / len) * STEP;
        }
        if (rail) {
          // bend down into this lane's rail
          const x0 = x;
          const y0 = y + heroTop;
          const x3 = railRight + laneOffset(lane);
          for (let k = 1; k <= BEND; k++) {
            const u = k / BEND;
            const b = 3 * (1 - u) ** 2 * u;
            const c = 3 * (1 - u) * u * u;
            const d = u ** 3;
            const a = (1 - u) ** 3;
            pts[n * 2] = a * x0 + b * (x0 + (x3 - x0) * 0.75) + (c + d) * x3;
            pts[n * 2 + 1] = (a + b) * y0 + c * (y0 + TURN * 0.35) + d * (y0 + TURN);
            n++;
          }
        }
        counts[lane] = n;
      });
    };

    const p = [0, 0];
    const draw = (time: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.15;
      pointer.y += (pointer.ty - pointer.y) * 0.15;
      ctx.clearRect(0, 0, vw, vh);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const heroVisible = heroTop + heroH + TURN > scrollY;
      // a band of light sweeping left to right along the hero threads
      const sweep = reduced ? -1 : ((time * 0.00005) % 1.4) - 0.2;

      if (heroVisible) {
        const grad = ctx.createLinearGradient(0, 0, vw, 0);
        const stops: [number, string][] = [
          [0, col.mutedSoft],
          [0.3, col.muted],
          [0.72, col.accent],
          [1, col.accent],
        ];
        if (sweep > 0.02 && sweep < 0.98) {
          const base = sweep < 0.5 ? col.muted : col.accent;
          stops.push([sweep - 0.06, base], [sweep, col.glow], [sweep + 0.06, base]);
        }
        stops
          .filter(([o]) => o >= 0 && o <= 1)
          .sort((a, b) => a[0] - b[0])
          .forEach(([o, c]) => grad.addColorStop(o, c));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        for (let lane = 0; lane < lanes; lane++) {
          const pts = paths[lane];
          ctx.moveTo(pts[0], pts[1] - scrollY);
          for (let k = 1; k < counts[lane]; k++) ctx.lineTo(pts[k * 2], pts[k * 2 + 1] - scrollY);
        }
        ctx.stroke();
      }

      if (rail) {
        // rails: one path, with light drifting down them as you scroll
        const from0 = scrollY - 20;
        const to = Math.min(docH, scrollY + vh + 20);
        const grad = ctx.createLinearGradient(0, 0, 0, vh);
        const band = reduced ? -1 : (((time * 0.00012 + pulseShift * 0.0006) % 1.6) - 0.3);
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
          let y = start;
          railPoint(y, off, p);
          ctx.moveTo(p[0], p[1] - scrollY);
          while (y < to) {
            y += 9 / Math.max(1, Math.abs(at(railSlope, y)));
            railPoint(y, off, p);
            ctx.lineTo(p[0], p[1] - scrollY);
          }
        }
        ctx.stroke();
      }

      drawTraces(time);

      if (reduced) return;

      // pulses: a soft halo plus a bright core that fades along its tail
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (let lane = 0; lane < lanes; lane++) {
        const seed = seeds[order[lane][1]];
        const pts = paths[lane];
        const n = counts[lane];

        if (heroVisible && n > TAIL) {
          const head = Math.floor(((time * 0.00005 * seed.speed + seed.phase) % 1) * (n - 1));
          comet((k, out) => {
            const idx = Math.max(0, head - TAIL + k);
            out[0] = pts[idx * 2];
            out[1] = pts[idx * 2 + 1] - scrollY;
          }, TAIL);
        }

        if (rail) {
          const start = pts[(n - 1) * 2 + 1];
          const length = docH - start;
          const head = start + ((time * 0.11 * seed.speed + pulseShift * seed.speed + seed.phase * length) % length);
          if (head > scrollY - 80 && head - 80 < scrollY + vh) {
            const off = laneOffset(lane);
            comet((k, out) => {
              railPoint(Math.max(start, head - 80 + (k * 80) / 16), off, out);
              out[1] -= scrollY;
            }, 16);
          }
        }
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    // Scroll-linked: as a card rises from the bottom of the screen to 40%
    // of the way up, light runs along its branch and then splits to wrap the
    // card's outline from both sides. Scrolling back retracts it.
    const drawTraces = (time: number) => {
      for (const tr of traces) {
        if (tr.bottom < scrollY - 80 || tr.top - 120 > scrollY + vh) continue;
        const v = tr.top - scrollY;
        const p = smooth(0, 1, (vh * 0.95 - v) / (vh * 0.55));
        if (p <= 0) continue;
        const nb = tr.branch.length / 2;
        const nl = tr.loop.length / 2 - 1;
        const half = Math.floor(nl / 2);
        const total = nb + half;
        const drawn = p * total;
        const inBranch = Math.min(nb, drawn);
        const inLoop = Math.max(0, drawn - nb);

        ctx.strokeStyle = col.accent;
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tr.branch[0], tr.branch[1] - scrollY);
        for (let k = 1; k < inBranch; k++) ctx.lineTo(tr.branch[k * 2], tr.branch[k * 2 + 1] - scrollY);
        if (inLoop > 0) {
          for (const sign of [1, -1]) {
            ctx.moveTo(tr.loop[0], tr.loop[1] - scrollY);
            for (let k = 1; k <= inLoop && k <= half + 1; k++) {
              const idx = sign > 0 ? k : nl - k;
              ctx.lineTo(tr.loop[idx * 2], tr.loop[idx * 2 + 1] - scrollY);
            }
          }
        }
        ctx.stroke();

        if (reduced) continue;
        ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
        if (p < 0.999) {
          // the drawing head(s)
          if (inLoop <= 0) {
            const head = Math.max(1, Math.floor(inBranch) - 1);
            comet((k, out) => {
              const idx = Math.max(0, head - 14 + k);
              out[0] = tr.branch[idx * 2];
              out[1] = tr.branch[idx * 2 + 1] - scrollY;
            }, 14);
          } else {
            const head = Math.min(half, Math.floor(inLoop));
            for (const sign of [1, -1]) {
              comet((k, out) => {
                const step = Math.max(0, head - 14 + k);
                const idx = sign > 0 ? step : (nl - step) % nl;
                out[0] = tr.loop[idx * 2];
                out[1] = tr.loop[idx * 2 + 1] - scrollY;
              }, 14);
            }
          }
        } else {
          // fully wrapped: a slow light circles the card
          const head = Math.floor(((time * 0.00008 + tr.phase) % 1) * nl);
          comet((k, out) => {
            const idx = (head - 20 + k + nl) % nl;
            out[0] = tr.loop[idx * 2];
            out[1] = tr.loop[idx * 2 + 1] - scrollY;
          }, 20);
        }
        ctx.globalCompositeOperation = "source-over";
      }
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
      // re-trace the hero every other frame; below it only every 4th frame draws
      if (heroVisible && frame % 2 === 0) trace(time);
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
      pulseShift += Math.abs(y - scrollY) * 1.4;
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
    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
      if (pointer.x < -1e3) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
    };
    const onLeave = () => {
      pointer.tx = pointer.ty = pointer.x = pointer.y = -1e4;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    scheme.addEventListener("change", onScheme);
    window.addEventListener("themechange", onScheme);
    if (!reduced) {
      window.addEventListener("pointermove", onMove);
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      cancelAnimationFrame(resizeQueued);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      scheme.removeEventListener("change", onScheme);
      window.removeEventListener("themechange", onScheme);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
