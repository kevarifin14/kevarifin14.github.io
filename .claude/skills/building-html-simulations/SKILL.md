---
name: building-html-simulations
description: This skill should be used whenever the user wants to build an interactive HTML simulation, explorable explanation, physics/math visualization, generative-art toy, or 3D/WebGL experience for the web — e.g. "make a ripple tank", "build a double-pendulum sim", "add an interactive visualization to the site", "create an explorable explanation", "do something with three.js/canvas/shaders". Evaluates each request to choose the right rendering and interaction method — SVG/HTML, Canvas 2D, WebGL/three.js/Babylon, D3, Matter/Rapier, or p5 — rather than defaulting to one. Covers the render loop, interaction design, explorable-explanation patterns, performance, accessibility, verification, and dropping a self-contained simulation into a static GitHub Pages site. See reference/inspiration.md, reference/patterns.md, and reference/verification.md.
version: 0.1.0
---

# Building HTML Simulations

## Goal

An interactive simulation lets a reader *poke the thing* and build intuition that prose can't give. The best ones (Ciechanowski, Falstad, PhET, Nicky Case) share one move: **direct manipulation with immediate feedback** — drag a source, the waves change *now*. Optimize for that loop, not for visual polish.

This site is plain, framework-free static HTML — meaning **no build step or bundler**, not "no libraries." A sim is **one self-contained page** (or `sim.html` + `sim.js` + `sim.css`) under `/sims/` that works on GitHub Pages as raw files; libraries are fine when loaded via CDN or an importmap. The *method* is never fixed in advance — choose it per request (next section).

## Evaluate the request, then choose the method

**There is no default rendering method.** Read the request, classify the phenomenon, and let the method fall out of it. When several methods fit, pick the **simplest one that fully expresses the phenomenon** — sometimes SVG, sometimes Canvas, sometimes WebGL. Right tool for the job, every time.

Classify the request, then read the table:
- **Dimensionality** — a 2D plane, or 3D space with a camera you navigate?
- **What's drawn** — labeled diagram/axes, particles/fields, rigid bodies, a chart from data, meshes, or per-pixel/generative?
- **Object count** — tens (vector is fine) vs thousands (raster/GPU)?
- **Precision** — does crisp text and clickable geometry matter? → vector, not raster.
- **Physics** — established rigid-body behavior (use an engine), or is the algorithm itself the lesson (hand-roll)?
- **Site constraint** — must run as static files with no build step (favor zero-dep or CDN/importmap, never a bundler).

| If the request is… | Method | Why |
|---|---|---|
| Labeled diagrams, axes, constructed geometry, low object count, crisp text/hit-targets | **SVG + HTML/CSS** | Semantic shapes, sharp text, easy events |
| 2D particles, fields, waves, fractals, automata, high counts, custom raster | **Canvas 2D** | Fast, portable, full pixel control |
| Per-pixel fields, reaction-diffusion, massive particle counts, GPU compute | **WebGL / GLSL shaders** | Highest throughput (steepest curve) |
| 3D meshes, cameras, lighting, orbit/zoom, model loading | **three.js** (or **Babylon.js** for a full engine) | Real spatial scenes |
| Data-driven viz with scales, axes, brushing | **D3** | Built for data joins + interaction |
| 2D rigid-body collisions/constraints/joints | **Matter.js** (or **Rapier**, fast 2D/3D wasm) | Don't hand-roll mature physics |
| Creative-coding/teaching sketch, fast prototype | **p5.js** | Friendly API, quick iteration |

Tie-break, in order: (1) does it express the phenomenon cleanly, (2) does it satisfy the static-site constraint, (3) is it the least complex option that still does (1) and (2)? Don't reach for a 3D engine to draw 2D waves; don't rasterize a diagram SVG renders crisply. One request can mix methods (e.g. a Canvas field under an SVG axis overlay).

## Anatomy of a self-contained sim

Whatever the method, every sim has the same skeleton: a **stage** (a `<canvas>`, `<svg>`, or WebGL context), a few **controls** bound to a `params` object, and a **render loop**. The Canvas 2D example below is just one instance of that shape (SVG and three.js versions are in `reference/patterns.md`):

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

**Match the interaction to the phenomenon, not to habit:**
- Fields / particles → click or drag to place/probe sources; hover to read a local value.
- 3D scenes → orbit + zoom, plus a "home" camera reset and orientation aids.
- Data viz → hover tooltips, brush-to-filter, zoom/pan.
- Rigid-body physics → grab and throw bodies (a pointer/mouse constraint).
- Parameter spaces → sliders, toggles, segmented modes + named presets.
- Time evolution → play/pause, step, speed, and replay/ghost a previous run to compare.

Mechanics common to all of them:
- **Pointer Events** (`pointerdown/move/up`) handle mouse + touch + pen in one path. Convert client coords to stage space accounting for `devicePixelRatio` and bounding rect.
- **Bind controls to a `params` object**; the loop reads `params` every frame, so changes feel live.
- **Ship strong defaults + presets.** The first frame should already show something interesting; presets ("two sources", "single slit") teach faster than empty sliders.
- Always provide **Reset** (model + view) and **Pause**.

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
- Framework-free means no build step — libraries (three.js, D3, p5) are fine via CDN/importmap. Inline small sims; use sibling `sim.js`/`sim.css` for bigger ones.
- No build step, no bundler — it must work as raw files served by GitHub Pages (`.nojekyll` is already set).

## Starter, examples & components (live in `/sims/`)

This repo ships a working component library and one example per method at `/sims/` — start there instead of from scratch:

- **Toolkit** — `/sims/lib/simkit.js` packages the patterns above as reusable helpers: `Sim.fitCanvas`, `Sim.loop` (fixed-timestep + visibility/offscreen pause), `Sim.pointer`, `Sim.bind`, `Sim.rng`, `Sim.steps` (scrollytelling), `Sim.palette`. `/sims/lib/sim.css` is the shared themed shell.
- **Template** — copy `/sims/_template/` to start a Canvas 2D sim.
- **Examples (copy the closest)** — `ripple` (Canvas 2D field), `pendulum` (SVG), `orbit` (three.js), `flow-field` (p5), `bars` (D3), `stack` (Matter.js).
- **Gallery** — `/sims/index.html`, linked from the site nav.

To add a sim: copy the closest example, swap in your `reset`/`update`/`render`, add a card to `/sims/index.html`, commit. Details in `/sims/README.md`.

## Pair every sim with an explanation (the explorable layer)

A bare sim rarely teaches on its own — the best explorables wrap the interactive in **narrative that tells the reader what to notice**. Treat the explanation as part of the build, not an afterthought, and pick the medium by the shape of the content (the same "right tool" rule):

- **Scrollytelling document** (default) — prose in a column beside/under a sticky sim; each scroll step sets a parameter/preset and annotates one idea. Best for a *process or argument* with a natural order (Ciechanowski, The Pudding, Distill). Template: `/sims/_explainer/`; helper: `Sim.steps()`.
- **Stepper / slides** — discrete next/back panels over one sim. Best for a *guided sequence* or talk-style walkthrough where you pace the reveal.
- **Clickable map / model** — a diagram, map, or 3D model where each region reveals its own note or sub-sim on click/hover. Best for a *system with parts* explored in any order (anatomy, an architecture, a city). Use SVG/Canvas hotspots or three.js raycasting.
- **Inline margin notes** — short annotations pinned to the thing they explain; a complement to any of the above.

Design rules: one idea per step; the sim's state should always match what the text is describing; hand the reader the controls at the end (sandbox); keep prose as labels and prompts, not walls of text.

## Workflow

```
Build Progress:
- [ ] 1. Name the phenomenon and the ONE thing the reader should grasp
- [ ] 2. Evaluate the request → pick the rendering + interaction method (decision table above)
- [ ] 3. Render one static frame of the system (no motion yet)
- [ ] 4. Add the update loop (fixed timestep) — verify it's stable
- [ ] 5. Add interaction (pointer + sliders bound to params)
- [ ] 6. Tune defaults/presets so frame 1 is already interesting
- [ ] 7. Perf pass (HiDPI, offscreen pause, no per-frame allocs)
- [ ] 8. Mobile + reduced-motion + aria pass
```

## Anti-patterns

- Method by habit instead of by request: a 3D engine for 2D waves (too heavy), or a rasterized canvas for a labeled diagram SVG would render crisply (too light). Match the tool to the job.
- `setInterval` loops, frame-rate-dependent physics, blurry non-HiDPI canvas.
- Twenty sliders and no default state — the reader bounces before understanding anything.
- A build step or npm dependency that breaks plain static hosting.
- Allocating garbage every frame; never pausing offscreen.

## References

- **Inspiration catalog** (who to study + what to steal): [reference/inspiration.md](reference/inspiration.md)
- **Copy-paste code patterns** (HiDPI canvas, fixed-timestep loop, pointer drag, SVG binding, three.js/p5 skeletons): [reference/patterns.md](reference/patterns.md)
- **Verification checklist** (run, visual, interaction, 3D/WebGL, blank-canvas debugging, automated Playwright checks): [reference/verification.md](reference/verification.md)
- **Live component library & examples** in this repo at `/sims/` — `lib/simkit.js`, `_template/`, `_explainer/`, and one example per method (see `/sims/README.md`).
