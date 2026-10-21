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
    let pulseShift = 0; // extra pulse travel earned by scrolling

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

      buildRail();
      buildSpreads();
      trace(performance.now());
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

    // trace every hero thread (document coordinates) into `paths`
    const trace = (time: number) => {
      const t = time * 0.00009;
      const h = heroH;
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
        const to = Math.min(docH, turnY, scrollY + vh + 20);
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

        if (heroVisible && n > TAIL) {
          const head = Math.floor(((time * 0.00005 * seed.speed + seed.phase) % 1) * (n - 1));
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
          if (length > 30) {
            const head = s0 + Math.floor((time * 0.11 * seed.speed + pulseShift * seed.speed) / SAMPLE + seed.phase * length) % length;
            const hy = cy[head];
            if (hy > scrollY - 80 && hy - 80 < scrollY + vh) {
              const off = laneOffset(lane);
              comet((k, out) => {
                lanePoint(Math.max(s0, head - 26 + Math.round((k * 26) / 16)), off, out);
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
