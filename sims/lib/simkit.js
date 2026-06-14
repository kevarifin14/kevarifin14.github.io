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

  global.Sim = { palette: palette, fitCanvas: fitCanvas, rng: rng, loop: loop, pointer: pointer, bind: bind, steps: steps };
})(window);
