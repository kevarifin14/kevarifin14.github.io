---
name: building-html-simulations
description: This skill should be used whenever the user wants to build an interactive HTML simulation, explorable explanation, physics/math visualization, generative-art toy, or 3D/WebGL experience for the web — e.g. "make a ripple tank", "build a double-pendulum sim", "add an interactive visualization to the site", "create an explorable explanation", "do something with three.js/canvas/shaders". Covers tool choice (canvas, p5.js, three.js, d3, matter.js, shaders), the render loop, interaction, explorable-explanation design, performance, accessibility, and dropping a self-contained simulation into a static GitHub Pages site. See reference/inspiration.md for the catalog of best-in-class examples and reference/patterns.md for copy-paste boilerplate.
version: 0.1.0
---

# Building HTML Simulations

## Goal

An interactive simulation lets a reader *poke the thing* and build intuition that prose can't give. The best ones (Ciechanowski, Falstad, PhET, Nicky Case) share one move: **direct manipulation with immediate feedback** — drag a source, the waves change *now*. Optimize for that loop, not for visual polish.

This site is plain, framework-free static HTML. Keep simulations the same: **one self-contained page** (or `sim.html` + `sim.js` + `sim.css`) that drops into `/sims/` and works on GitHub Pages with no build step.

## Pick the right tool

Match the tool to the phenomenon — don't reach for a 3D engine to draw 2D waves.

| Tool | Use when | Notes |
|---|---|---|
| **Canvas 2D** (raw) | 2D fields, particles, waves, fractals, pixel work | Zero deps, total control, fits this site best. Default choice. |
| **p5.js** | fast 2D/creative-coding sketches, teaching | One `<script>`, friendly API; ~900KB. |
| **three.js** | real 3D scenes, meshes, lighting, cameras | WebGL; bundle it locally or via CDN. |
| **Raw WebGL / GLSL shaders** | per-pixel fields, reaction-diffusion, huge particle counts | Fastest; steepest curve. See Book of Shaders / Shadertoy. |
| **D3** | data-driven viz, scales, axes, charts | Great for explorables built on real data. |
| **matter.js / planck.js** | 2D rigid-body physics (collisions, joints) | Don't hand-roll a physics engine for this. |

Rule of thumb: **start with raw Canvas 2D.** Only add a library when the math (3D, rigid-body collisions, shaders) is the hard part — not the rendering.

## Anatomy of a self-contained sim

Every sim has the same skeleton: a `<canvas>`, a few controls bound to parameters, and a render loop. Minimal pattern (full versions in `reference/patterns.md`):

```html
<canvas id="c"></canvas>
<label>Speed <input id="speed" type="range" min="0" max="2" step="0.01" value="1"></label>
<button id="reset">Reset</button>
<script>
  const cv = document.getElementById("c"), ctx = cv.getContext("2d");
  const params = { speed: 1 };
  document.getElementById("speed").oninput = e => params.speed = +e.target.value;

  let t = 0;
  function frame(now) {
    // update(state, dt); draw(ctx, state)
    t += params.speed;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
</script>
```

Separate **update** (physics/state) from **draw** (pixels). It keeps the code legible and lets you change timestep without touching rendering.

## The render loop & physics

- **Drive animation with `requestAnimationFrame`**, never `setInterval`. It syncs to the display and pauses on hidden tabs.
- **Use a fixed timestep** for anything physical (pendulums, springs, n-body). Accumulate real elapsed time and step the simulation in fixed `dt` chunks so behavior is frame-rate-independent and stable. (Pattern in `reference/patterns.md`.)
- **Scale the canvas for HiDPI** with `devicePixelRatio`, or it looks blurry on retina/phones. Re-apply on resize.
- **Pause when offscreen** (IntersectionObserver) and on `document.hidden` — sims on a blog page shouldn't burn battery while scrolled away.

## Interaction patterns

- **Pointer Events** (`pointerdown/move/up`) handle mouse + touch + pen in one path. Convert client coords to canvas space accounting for `devicePixelRatio` and bounding rect.
- **Bind controls to a `params` object**; the loop reads `params` every frame, so changes feel live.
- **Ship strong defaults + presets.** The first frame should already show something interesting; presets ("two sources", "single slit") teach faster than empty sliders.
- Always provide **Reset** and **Pause**.

## Explorable-explanation design (the part that matters)

Borrow from the masters (catalog in `reference/inspiration.md`):

- **Show, don't tell.** Replace a sentence with a thing the reader can drag.
- **Immediate feedback.** Every input changes the output within one frame.
- **Guided defaults.** Open in a state that demonstrates the key idea; let curiosity do the rest.
- **Label only what matters.** Annotate the one quantity the reader should watch; hide the rest.
- **Author the happy path.** One clear thing to try first beats twenty knobs.

## Performance & robustness

- Cap `devicePixelRatio` at ~2 (phones report 3–4; you rarely need it).
- Avoid allocating in the loop (no `new` per frame); reuse arrays/objects to dodge GC jank.
- Debounce/throttle `resize`; recompute canvas size and any cached buffers there.
- For heavy fields, compute into a typed array and blit with `ctx.putImageData`, or move to a shader.

## Accessibility & mobile

- Respect `prefers-reduced-motion`: offer a static/stepped mode or slow it down.
- Make canvases usable by touch (large hit targets) and add `aria-label` + a one-line text description of what the sim shows.
- Test on a phone early — touch + small screens break desktop-only interactions.

## Fitting it into this static site

- Put each sim at `/sims/<name>/index.html` (self-contained) and link it from `writing.html` or a `sims.html` gallery.
- Keep it framework-free to match the site; inline small sims, or use sibling `sim.js`/`sim.css` for bigger ones.
- No build step, no bundler — it must work as raw files served by GitHub Pages (`.nojekyll` is already set).

## Workflow

```
Build Progress:
- [ ] 1. Name the phenomenon and the ONE thing the reader should grasp
- [ ] 2. Pick the tool (default: Canvas 2D)
- [ ] 3. Render one static frame of the system (no motion yet)
- [ ] 4. Add the update loop (fixed timestep) — verify it's stable
- [ ] 5. Add interaction (pointer + sliders bound to params)
- [ ] 6. Tune defaults/presets so frame 1 is already interesting
- [ ] 7. Perf pass (HiDPI, offscreen pause, no per-frame allocs)
- [ ] 8. Mobile + reduced-motion + aria pass
```

## Anti-patterns

- Reaching for three.js/React when raw Canvas 2D would do — bloat, no benefit.
- `setInterval` loops, frame-rate-dependent physics, blurry non-HiDPI canvas.
- Twenty sliders and no default state — the reader bounces before understanding anything.
- A build step or npm dependency that breaks plain static hosting.
- Allocating garbage every frame; never pausing offscreen.

## References

- **Inspiration catalog** (who to study + what to steal): [reference/inspiration.md](reference/inspiration.md)
- **Copy-paste code patterns** (HiDPI canvas, fixed-timestep loop, pointer drag, three.js/p5 skeletons): [reference/patterns.md](reference/patterns.md)
