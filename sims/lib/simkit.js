/*
 * simkit.js — a tiny, dependency-free toolkit for HTML simulations.
 * Global: window.Sim. Works from file:// (no build step).
 * Helpers: fitCanvas, loop (fixed-timestep + visibility/offscreen pause),
 * pointer, bind, rng, palette.
 */
(function (global) {
  "use strict";

  // Colors matched to kevinarifin.com
  const palette = {
    bg: "#0b0b0c", fg: "#ededed", muted: "#8a8a8f",
    border: "#232326", accent: "#e8c547", accent2: "#4fa3ff",
    grid: "rgba(255,255,255,0.06)",
  };

  // HiDPI canvas sizing. Returns CSS-pixel {w, h, dpr}; draw in CSS pixels.
  function fitCanvas(canvas, ctx, maxDpr) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(global.devicePixelRatio || 1, maxDpr || 2);
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h, dpr };
  }

  // Seeded RNG (mulberry32) — reproducible resets.
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /*
   * Fixed-timestep loop. Calls update(dt) in fixed chunks (stable physics),
   * render() once per frame. Clamps dt after stalls. Pauses automatically
   * when the tab is hidden or the stage scrolls offscreen. Respects
   * prefers-reduced-motion by starting paused.
   *
   * loop({ update, render, fixedDt?, stage?, autoplay? }) -> controller
   * controller: play(), pause(), toggle(), renderOnce(), get running
   */
  function loop(opts) {
    const update = opts.update, render = opts.render;
    const fixedDt = opts.fixedDt || 1 / 120;
    const stage = opts.stage || null;
    const autoplay = opts.autoplay !== false;
    const reduce = global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = null, last = 0, acc = 0;
    let wanted = false, visible = !document.hidden, onscreen = true;

    function frame(now) {
      if (!last) last = now;
      acc += Math.min((now - last) / 1000, 0.25);
      last = now;
      let guard = 0;
      while (acc >= fixedDt && guard++ < 600) { if (update) update(fixedDt); acc -= fixedDt; }
      if (render) render();
      raf = requestAnimationFrame(frame);
    }
    function active() { return wanted && visible && onscreen; }
    function sync() {
      if (active()) { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
      else if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    const ctl = {
      get running() { return wanted; },
      play() { wanted = true; sync(); },
      pause() { wanted = false; sync(); if (render) render(); },
      toggle() { wanted ? ctl.pause() : ctl.play(); },
      renderOnce() { if (render) render(); },
    };

    document.addEventListener("visibilitychange", function () {
      visible = !document.hidden; sync();
    });
    if (stage && "IntersectionObserver" in global) {
      new IntersectionObserver(function (entries) {
        onscreen = entries[0].isIntersecting; sync();
      }).observe(stage);
    }

    if (autoplay && !reduce) ctl.play(); else ctl.renderOnce();
    return ctl;
  }

  // Unified pointer (mouse + touch + pen). Coords in the element's CSS pixels.
  function pointer(el, handlers) {
    handlers = handlers || {};
    const p = { x: 0, y: 0, down: false, inside: false };
    function set(e) {
      const r = el.getBoundingClientRect();
      p.x = e.clientX - r.left; p.y = e.clientY - r.top;
    }
    el.addEventListener("pointerdown", function (e) {
      p.down = true; p.inside = true; set(e);
      if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
      if (handlers.down) handlers.down(p, e);
    });
    el.addEventListener("pointermove", function (e) { set(e); if (handlers.move) handlers.move(p, e); });
    el.addEventListener("pointerup", function (e) {
      p.down = false;
      if (el.releasePointerCapture && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (handlers.up) handlers.up(p, e);
    });
    el.addEventListener("pointerenter", function (e) { p.inside = true; set(e); if (handlers.enter) handlers.enter(p, e); });
    el.addEventListener("pointerleave", function (e) { p.inside = p.down; if (handlers.leave) handlers.leave(p, e); });
    return p;
  }

  // Bind a range/checkbox/number input (id) to obj[key]; updates #<id>Value readout.
  function bind(id, obj, key, format) {
    const el = document.getElementById(id);
    if (!el) return null;
    const out = document.getElementById(id + "Value");
    function read() {
      return el.type === "checkbox" ? el.checked
        : (el.type === "range" || el.type === "number") ? +el.value : el.value;
    }
    function apply() {
      const v = read(); obj[key] = v;
      if (out) out.textContent = format ? format(v) : v;
    }
    el.addEventListener("input", apply);
    apply();
    return el;
  }

  // Scrollytelling: fire onStep(index, el) when a [data-step] element scrolls into view.
  function steps(container, onStep, opts) {
    opts = opts || {};
    const els = Array.prototype.slice.call(container.querySelectorAll("[data-step]"));
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { const i = els.indexOf(e.target); if (i >= 0) onStep(i, e.target); }
      });
    }, { threshold: opts.threshold || 0.6, rootMargin: opts.rootMargin || "0px 0px -10% 0px" });
    els.forEach(function (el) { io.observe(el); });
    return { els: els, disconnect: function () { io.disconnect(); } };
  }

  // ---------------------------------------------------------------------------
  // Core reusable components (adopted from Ciechanowski's base.js patterns).
  // ---------------------------------------------------------------------------
  var TAU = Math.PI * 2;

  // Scalar math (smoothstep is the workhorse — ease a 0..1 transition).
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function saturate(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, f) { return a + (b - a) * f; }
  function smoothstep(e0, e1, x) { var t = saturate((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); }
  function map(x, a, b, c, d) { return c + (d - c) * ((x - a) / (b - a)); }

  // 2D vector helpers on {x, y} points.
  var v = {
    add: function (a, b) { return { x: a.x + b.x, y: a.y + b.y }; },
    sub: function (a, b) { return { x: a.x - b.x, y: a.y - b.y }; },
    scale: function (a, s) { return { x: a.x * s, y: a.y * s }; },
    dot: function (a, b) { return a.x * b.x + a.y * b.y; },
    len: function (a) { return Math.hypot(a.x, a.y); },
    dist: function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); },
    norm: function (a) { var l = Math.hypot(a.x, a.y) || 1; return { x: a.x / l, y: a.y / l }; },
    lerp: function (a, b, f) { return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }; },
    perp: function (a) { return { x: -a.y, y: a.x }; },
    angle: function (a) { return Math.atan2(a.y, a.x); },
    fromAngle: function (t, r) { r = r == null ? 1 : r; return { x: Math.cos(t) * r, y: Math.sin(t) * r }; },
  };

  // Color: interpolate a magnitude 0..1 to a string (dark -> blue -> gold -> white).
  var HEAT = [[14, 18, 32], [40, 70, 160], [232, 197, 71], [255, 255, 255]];
  function mix(c1, c2, t) { return [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))]; }
  function heat(t) { t = saturate(t) * (HEAT.length - 1); var i = Math.floor(t), f = t - i, c = mix(HEAT[i], HEAT[Math.min(i + 1, HEAT.length - 1)], f); return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; }

  // Draw primitives as context methods (call ctx.arrow(...), ctx.strokeLine(...), etc.).
  var CP = typeof CanvasRenderingContext2D !== "undefined" && CanvasRenderingContext2D.prototype;
  if (CP) {
    if (!CP.strokeLine) CP.strokeLine = function (x0, y0, x1, y1) { this.beginPath(); this.moveTo(x0, y0); this.lineTo(x1, y1); this.stroke(); };
    if (!CP.disc) CP.disc = function (x, y, r) { this.beginPath(); this.arc(x, y, r, 0, TAU); this.fill(); };
    if (!CP.ring) CP.ring = function (x, y, r) { this.beginPath(); this.arc(x, y, r, 0, TAU); this.stroke(); };
    if (!CP.arrow) CP.arrow = function (x0, y0, x1, y1, head) {
      head = head || 8; this.beginPath(); this.moveTo(x0, y0); this.lineTo(x1, y1); this.stroke();
      var a = Math.atan2(y1 - y0, x1 - x0); this.beginPath(); this.moveTo(x1, y1);
      this.lineTo(x1 - head * Math.cos(a - 0.45), y1 - head * Math.sin(a - 0.45));
      this.lineTo(x1 - head * Math.cos(a + 0.45), y1 - head * Math.sin(a + 0.45)); this.closePath(); this.fill();
    };
    if (!CP.panel) CP.panel = function (x, y, w, h, r) {
      r = r == null ? 8 : r; this.beginPath(); this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); this.fill();
    };
    if (!CP.label) CP.label = function (x, y, text, o) {
      o = o || {}; this.save(); this.font = (o.size || 11) + "px ui-monospace, Menlo, monospace";
      this.fillStyle = o.color || "#8a8a8f"; this.textAlign = o.align || "left"; this.textBaseline = o.baseline || "alphabetic";
      this.fillText(text, x, y); this.restore();
    };
  }

  // Light 3D: rotate a point, perspective-project it, and drag-to-orbit (ArcBall-lite).
  function rot3(p, yaw, pitch) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    var x = p.x * cy - p.z * sy, z = p.x * sy + p.z * cy, y = p.y * cx - z * sx; z = p.y * sx + z * cx;
    return { x: x, y: y, z: z };
  }
  function project(p, o) { o = o || {}; var d = o.dist == null ? 4 : o.dist, f = o.fov == null ? 2.4 : o.fov, s = f / (d - p.z) * (o.scale || 1); return { x: (o.cx || 0) + p.x * s, y: (o.cy || 0) + p.y * s, s: s }; }
  function orbit(el, o) {
    o = o || {}; var st = { yaw: o.yaw || 0.6, pitch: o.pitch == null ? -0.4 : o.pitch }, drag = false, lx = 0, ly = 0;
    el.addEventListener("pointerdown", function (e) { drag = true; lx = e.clientX; ly = e.clientY; if (el.setPointerCapture) el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", function (e) { if (!drag) return; st.yaw += (e.clientX - lx) * 0.01; st.pitch = clamp(st.pitch + (e.clientY - ly) * 0.01, -1.5, 1.5); lx = e.clientX; ly = e.clientY; if (o.onChange) o.onChange(st); });
    el.addEventListener("pointerup", function () { drag = false; });
    return st;
  }

  global.Sim = {
    palette: palette, fitCanvas: fitCanvas, rng: rng, loop: loop, pointer: pointer, bind: bind, steps: steps,
    clamp: clamp, saturate: saturate, lerp: lerp, smoothstep: smoothstep, map: map,
    v: v, heat: heat, mix: mix, rot3: rot3, project: project, orbit: orbit, TAU: TAU,
  };
})(window);
