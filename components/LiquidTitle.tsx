"use client";

import { useEffect, useRef } from "react";

/*
 * The hero name, redrawn in WebGL so the pointer can smear it like wet ink.
 * A small simulation texture remembers where the pointer moved (direction in
 * R/G, strength in B) and fades back to rest; the title is sampled through
 * that field with a slight RGB split. The real <h1> text stays in the DOM for
 * search, screen readers and selection, and is what you see without WebGL or
 * with reduced motion.
 */

const SIM = 128; // simulation texture size
const PAD = 48; // px of canvas around the text so the smear can spill out

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main() { vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

// trail simulation: fade toward rest, then stamp the latest pointer segment
const SIM_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPrev;
uniform vec2 uMouse, uPrevMouse, uAspect;
uniform float uDelta;
float seg(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a; float l = max(length(ab), 1e-5);
  float t = clamp(dot(p - a, ab) / (l * l), 0., 1.);
  return length(p - (a + ab * t));
}
void main() {
  vec4 d = texture2D(uPrev, vUv);
  d.rg = mix(d.rg, vec2(.5), uDelta * .0025);
  // 8-bit texture: step down at least one level so the trail always clears
  d.b = max(mix(d.b, 0., uDelta * .0016) - 1. / 255., 0.);
  vec2 m = uMouse * uAspect, pm = uPrevMouse * uAspect;
  float speed = distance(m, pm);
  speed *= 1. - step(.25, speed); // ignore jumps when the pointer enters
  if (speed > 0.) {
    vec2 dir = normalize(m - pm);
    float near = pow(clamp(1. - smoothstep(0., .1, seg(vUv * uAspect, pm, m)), 0., 1.), .5);
    float f = near * min(speed * 14., 1.);
    d.rg += dir * f * .6;
    d.b += f * .9;
  }
  gl_FragColor = clamp(d, 0., 1.);
}`;

const DRAW_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uText, uSim;
void main() {
  vec4 s = texture2D(uSim, vUv);
  vec2 disp = (s.rg - .5) * vec2(.2, .26) * s.b;
  vec2 uv = vUv - disp;
  vec2 ca = disp * .55;
  vec4 c = texture2D(uText, uv);
  float r = texture2D(uText, uv + ca).a;
  float b = texture2D(uText, uv - ca).a;
  // premultiplied: tint the split edges, keep the body in the text colour
  vec3 col = c.rgb;
  col.r = mix(col.r, 1., max(r - c.a, 0.) * .9);
  col.b = mix(col.b, 1., max(b - c.a, 0.) * .9);
  float a = max(c.a, max(r, b) * .85);
  gl_FragColor = vec4(col * a, a);
}`;

export default function LiquidTitle({ lines, className = "" }: { lines: string[]; className?: string }) {
  const h1 = useRef<HTMLHeadingElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const title = h1.current!;
    const canvas = cvs.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = (frag: string) => {
      const p = gl.createProgram()!;
      gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag));
      gl.bindAttribLocation(p, 0, "p");
      gl.linkProgram(p);
      return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
    };
    const simProg = program(SIM_FRAG);
    const drawProg = program(DRAW_FRAG);
    if (!simProg || !drawProg) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const texture = (w: number, h: number, data: ArrayBufferView | null = null) => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      return t;
    };
    // two sim buffers we ping-pong between, starting at rest (0.5, 0.5, 0)
    const rest = new Uint8Array(SIM * SIM * 4);
    for (let i = 0; i < rest.length; i += 4) rest.set([128, 128, 0, 255], i);
    const sims = [0, 1].map(() => {
      const tex = texture(SIM, SIM, rest);
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fb };
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const textTex = texture(1, 1);

    const sim = (n: string) => gl.getUniformLocation(simProg, n);
    const u = {
      prev: sim("uPrev"),
      mouse: sim("uMouse"),
      prevMouse: sim("uPrevMouse"),
      aspect: sim("uAspect"),
      delta: sim("uDelta"),
      text: gl.getUniformLocation(drawProg, "uText"),
      sim: gl.getUniformLocation(drawProg, "uSim"),
    };

    let w = 0;
    let h = 0;
    // Draw the DOM title into an offscreen 2D canvas and upload it.
    const paintText = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const box = title.getBoundingClientRect();
      w = box.width + PAD * 2;
      h = box.height + PAD * 2;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const ctx = off.getContext("2d")!;
      const cs = getComputedStyle(title);
      ctx.scale(dpr, dpr);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#141416";
      ctx.textBaseline = "alphabetic";
      (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = cs.letterSpacing;
      title.querySelectorAll<HTMLElement>("[data-line]").forEach((line) => {
        const r = line.getBoundingClientRect();
        const m = ctx.measureText(line.textContent ?? "");
        const asc = m.fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * 0.8;
        const desc = m.fontBoundingBoxDescent ?? parseFloat(cs.fontSize) * 0.2;
        const y = r.top - box.top + PAD + (r.height - (asc + desc)) / 2 + asc;
        ctx.fillText(line.textContent ?? "", r.left - box.left + PAD, y);
      });
      gl.bindTexture(gl.TEXTURE_2D, textTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    };

    // pointer in canvas UV (y up); `prev` lags one frame behind
    const mouse = { x: -1, y: -1, px: -1, py: -1 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = 1 - (e.clientY - r.top) / r.height;
      wake();
    };

    let cur = 0;
    let raf = 0;
    let last = 0;
    let idle = 0; // ms since the pointer last moved
    let visible = true;

    const frame = (t: number) => {
      const delta = Math.min(t - (last || t), 50);
      last = t;
      const moved = mouse.x !== mouse.px || mouse.y !== mouse.py;
      idle = moved ? 0 : idle + delta;

      // simulate
      const src = sims[cur];
      const dst = sims[1 - cur];
      gl.useProgram(simProg);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, SIM, SIM);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform1i(u.prev, 0);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform2f(u.prevMouse, mouse.px < 0 ? mouse.x : mouse.px, mouse.py < 0 ? mouse.y : mouse.py);
      gl.uniform2f(u.aspect, w / Math.max(w, h), h / Math.max(w, h));
      gl.uniform1f(u.delta, delta);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      cur = 1 - cur;
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      // draw
      gl.useProgram(drawProg);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textTex);
      gl.uniform1i(u.text, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, dst.tex);
      gl.uniform1i(u.sim, 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // the trail has fully settled after ~3s of stillness: stop until next move
      raf = idle < 3000 && visible ? requestAnimationFrame(frame) : 0;
    };
    const wake = () => {
      if (!raf && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const redraw = () => {
      paintText();
      idle = 0;
      wake();
    };

    let ready = false;
    document.fonts.ready.then(() => {
      if (ready) return;
      ready = true;
      paintText();
      title.dataset.gl = "on";
      raf = requestAnimationFrame(frame);
    });

    const ro = new ResizeObserver(() => ready && redraw());
    ro.observe(title);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) wake();
    });
    io.observe(canvas);
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => ready && redraw();
    scheme.addEventListener("change", onScheme);
    const host = title.closest("section") ?? window;
    host.addEventListener("pointermove", onMove as EventListener);

    return () => {
      ready = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      scheme.removeEventListener("change", onScheme);
      host.removeEventListener("pointermove", onMove as EventListener);
      delete title.dataset.gl;
    };
  }, []);

  return (
    <div className="relative">
      <h1 ref={h1} className={`liquid-title ${className}`}>
        {lines.map((l) => (
          <span key={l} data-line className="block w-fit">
            {l}
          </span>
        ))}
      </h1>
      <canvas
        ref={cvs}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: -PAD, top: -PAD, width: 0, height: 0 }}
      />
    </div>
  );
}
