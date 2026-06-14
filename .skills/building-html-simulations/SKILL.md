---
name: building-html-simulations
description: This skill should be used whenever the user wants to build, repair, review, evaluate, or extend an interactive HTML simulation, explorable explanation, physics/math visualization, generative-art toy, data map, city atlas, or 3D/WebGL experience for the web — e.g. "make a ripple tank", "build a double-pendulum sim", "grade these sims", "add an interactive visualization to the site", "create an explorable explanation", "do something with three.js/canvas/shaders", "turn this course topic into a sim". Evaluates each request to choose SVG/HTML, Canvas 2D, WebGL/three.js/Babylon, D3, Matter/Rapier, p5, or a data-build pipeline. Covers render loops, direct manipulation, explorable design, performance, accessibility, verification, eval grading, GitHub Pages static delivery, and the local `/sims/` toolkit. See reference/inspiration.md, reference/patterns.md, reference/verification.md, reference/evaluation.md, reference/data-webgl.md, and reference/idea-bank.md.
---

# Building HTML Simulations

## Goal

An interactive simulation lets a reader *poke the thing* and build intuition that prose can't give. The best ones (Ciechanowski, Falstad, PhET, Nicky Case) share one move: **direct manipulation with immediate feedback** — drag a source, the waves change *now*. Optimize for that loop, not for visual polish.

This site is plain, framework-free static HTML — meaning **no build step or bundler**, not "no libraries." A sim is **one self-contained page** (or `sim.html` + `sim.js` + `sim.css`) under `/sims/` that works on GitHub Pages as raw files; libraries are fine when loaded via CDN or an importmap. The *method* is never fixed in advance — choose it per request (next section).

## Evaluate the request, then choose the method

**There is no default rendering method.** Read the request, classify the phenomenon, and let the method fall out of it. When several methods fit, pick the **simplest one that fully expresses the phenomenon** — sometimes SVG, sometimes Canvas, sometimes WebGL. Right tool for the job, every time.

When the request is course-inspired, research-driven, or based on an existing explorable, do a short source pass first. Prefer official course notes, primary docs, and the local research references; extract the core mechanism and interaction pattern, then build an original sim around that mechanism. Do not copy another explorable's code or surface styling. Save the source trail in `/sims/README.md`, the relevant skill reference, or the final response when it materially shaped the build.

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

To add a sim: copy the closest example, swap in your `reset`/`update`/`render`, add a card to `/sims/index.html`, then run `npm run thumbs` to capture its gallery thumbnail, and commit. Details in `/sims/README.md`.

**Gallery thumbnails.** The gallery auto-injects `/sims/thumbs/<slug>.png` into every card (a small client script keyed off each card's href; a missing thumb just removes its `<img>`). Generate/refresh them with `npm run thumbs` (`scripts/thumbnails.mjs`), which serves the site, opens each sim in Chromium, gives it one "positive" poke (Drop/Draw/Random/etc., never Pause/Reset) so data-driven sims show real content, and screenshots the `.stage`. Re-run it whenever you add a sim or change one's look, and commit the new PNGs (`/sims/thumbs/`). Keep thumbnails part of shipping a sim — a card without a picture is a worse gallery.

## Data-heavy and WebGL sims

When the simulation is a real dataset, map, city system, or large visual artifact, follow the Fog City Atlas pattern instead of trying to keep everything tiny:

- Build from one shared template/engine plus region- or dataset-specific metadata.
- Prefer no runtime network for public artifacts: fetch/clean/quantize/compress during build, then inject static data into the HTML.
- Keep every factual layer traceable to a source. Label procedural or simulated layers honestly.
- Add a debug hook for verification, such as `window.__sim = { setTime, setPreset, cam, state }`.
- Include screenshot or browser harnesses for canonical views, not only manual checks.
- Preserve static-site delivery: generated `*.html` files are product artifacts and may be committed when that is how the sim ships.

Read `reference/data-webgl.md` before working on a map, dataset explorer, WebGL artifact, generated HTML bundle, or multi-file simulation pipeline.

## Pair every sim with an explanation (the explorable layer)

A bare sim rarely teaches on its own — the best explorables wrap the interactive in **narrative that tells the reader what to notice**. Treat the explanation as part of the build, not an afterthought, and pick the medium by the shape of the content (the same "right tool" rule):

- **Scrollytelling document** (default) — prose in a column beside/under a sticky sim; each scroll step sets a parameter/preset and annotates one idea. Best for a *process or argument* with a natural order (Ciechanowski, The Pudding, Distill). Template: `/sims/_explainer/`; helper: `Sim.steps()`.
- **Stepper / slides** — discrete next/back panels over one sim. Best for a *guided sequence* or talk-style walkthrough where you pace the reveal.
- **Clickable map / model** — a diagram, map, or 3D model where each region reveals its own note or sub-sim on click/hover. Best for a *system with parts* explored in any order (anatomy, an architecture, a city). Use SVG/Canvas hotspots or three.js raycasting.
- **Inline margin notes** — short annotations pinned to the thing they explain; a complement to any of the above.

Design rules: one idea per step; the sim's state should always match what the text is describing; hand the reader the controls at the end (sandbox); keep prose as labels and prompts, not walls of text.

### The Ciechanowski method (the bar for explainers)

Bartosz Ciechanowski's articles (Moon, Bicycle, Gears, Mechanical Watch, GPS, Internal Combustion Engine — full archive in `reference/inspiration.md`) are the high-water mark. Steal the *method*, not the topic:

- **Many small figures, not one big toy.** An article is a dozen-plus tiny interactives, each isolating exactly one idea. Prefer a sequence of focused figures over one knob-covered megasim.
- **One new variable at a time.** Start from the simplest version that shows nothing surprising, then add a single degree of freedom per step until the full picture emerges (our `/sims/moon/`: orbit → lit half → viewing angle → new → full → drag).
- **Everything is draggable.** Don't show an animation the reader watches — give them the handle. A hand on the parameter is what builds intuition.
- **Two synced views.** Pair the "god's-eye" mechanism with the "what you'd actually see" view, locked to the same state (Moon: top-down orbit + the phase disc from Earth). The link between them is the lesson.
- **Calm, first-principles prose between figures.** Short text, then a thing to play with, then the next idea — never a wall of text, never a figure without a sentence telling you what to notice.
- **End with the combined figure.** The final interactive lets the reader drive the whole system at once.

It's all hand-built Canvas/WebGL with no framework — exactly our `/sims/` constraint. Use `Sim.steps()` for the scroll narrative with a sticky figure.

## Make it a place to experiment & learn

To reach the bar of the best explorables, go past a single toy:

- **Run the experimental method.** Let the reader form a hypothesis, vary one input, and *accumulate trials* — show the data building (a histogram, a running mean, a table). The Galton board (`/sims/galton/`) is the model: each drop is a trial; the bell curve emerges. Always include Reset.
- **Typeset the math.** For math/stats/physics, render formulas with KaTeX (CDN) so the equation sits beside the thing it describes and updates with it (see `/sims/fourier/`).
- **Use sound where it teaches.** `speechSynthesis` (phonics/language — see `/sims/phonics/`) and WebAudio (frequency, rhythm) can land a concept faster than visuals.
- **Permalink the state.** Encode key params in the URL hash so a configured experiment is reproducible and shareable.
- **Stay reachable.** Keyboard focus on controls, `aria-label` on the stage, captions, and `prefers-reduced-motion`.
- **Build a path, not a pile.** Group sims by subject and sequence them simple → hard so the gallery reads like an interactive course, not a demo dump.

## Lesson length & shape: single sims vs. modules

Match the format to the concept — and **do not cap a lesson at ~6 steps.** A short step count is usually a planning failure, not a style choice. Plan the *whole* conceptual arc first, then give each idea its own figure.

- **Single-page sim** — one mechanism, one interactive (Gears, GPS, Galton). A reader gets it in under a minute; don't pad it.
- **Module (deep explainer)** — a concept that only lands when built from first principles. Ciechanowski's *Bicycle* is **10 sections** (forces → moments → load → braking → steering → stability → wheels → frame → bending → stress), each with several focused figures. When the idea has many prerequisite ideas, plan **8–15+ figures** and let the lesson be long. Length earned by one-idea-per-figure is good; length from padding is not.

**Deciding:** count the distinct ideas a reader needs first. One or two → single page. Several that depend on each other → a module that builds them in order and ends on a figure combining them.

**Two kinds of module:**
1. **Long scrolly lesson** — one page, many figures in sequence (the `Sim.steps()` pattern, extended well past 6 steps). Best when the ideas form one continuous argument (Moon, Bicycle).
2. **Course module** — a landing page that sequences several *standalone* sims as ordered lessons with connecting narrative (e.g. a Probability module: Monte Carlo → Random Walk → Galton → CLT → Bayes). Best when each lesson is independently useful. Lives at `/sims/modules/<name>/`.

Plan the arc before building: write the section list (like Ciechanowski's headings), decide which need their own figure, then build figure by figure.

## Ciechanowski's engineering (from his shared base.js)

His whole site runs on one shared engine (`/js/base.js`, ~1,400 lines) plus a small per-article file — the same split as our `/sims/lib/simkit.js`. Worth copying:

- **One shared engine, hand-built, no framework.** Reusable drawing primitives on a single helper (`D.arrow`, `D.strokeLine`, `D.fillEllipse`, `D.roundRect`, `D.feather`), a full **vector/matrix math** library (`vec_add/cross/dot/norm/lerp`, `rot_x/y/z_mat`, `lerp`, `clamp`, `smooth_step`), an **`ArcBall`** for drag-to-orbit 3D, and a **`Dragger`/`TwoAxis`** for dragging a 2D parameter directly.
- **One global render loop (`tick`) drives every figure** on a page; offscreen figures idle. We get the equivalent per figure from `Sim.loop`'s visibility/offscreen pause.
- **Unified mouse + touch** behind one handler (we use Pointer Events for the same).
- **Exaggerate, then real.** Show an effect in "vastly exaggerated form" so it's visible, then dial it to realistic.
- **Color-code magnitude** (bright = high stress/force), size arrows proportionally, use slow-motion and transparent cutaways to reveal hidden mechanism.
- **Prose rhythm:** state the principle → isolated figure to manipulate → "Notice that…" → add one variable → real-world tie-in. Never a figure without a sentence framing what to look for.

These patterns are now **built into `/sims/lib/simkit.js` as core components** — use them in every sim instead of re-deriving them:

- **Scalar:** `Sim.clamp`, `Sim.lerp`, `Sim.smoothstep(e0,e1,x)` (the workhorse easer), `Sim.map`.
- **Vectors (`{x,y}`):** `Sim.v.add/sub/scale/dot/len/dist/norm/lerp/perp/angle/fromAngle`.
- **Context draw primitives:** `ctx.arrow(x0,y0,x1,y1,head)`, `ctx.strokeLine`, `ctx.disc`, `ctx.ring`, `ctx.panel(x,y,w,h,r)`, `ctx.label(x,y,text,opts)`.
- **Color by magnitude:** `Sim.heat(t)` (0→dark, mid→gold, 1→white), `Sim.mix(rgbA,rgbB,t)`.
- **Light 3D:** `Sim.orbit(el)` (drag-to-orbit), `Sim.rot3(p,yaw,pitch)`, `Sim.project(p,opts)`.
- **Audio (WebAudio):** `Sim.audio()` → `.tone(freq,{type})`, `.beep(freq,dur)`, `.analyser()` (call after a user gesture).

A **use-case map** in `/sims/lib/README.md` decomposes his archive: his figures are mostly hand-rolled WebGL (→ use **three.js** or `Sim.orbit`/`rot3`/`project`), `Gears`/`Tesseract` are plain Canvas, `Airfoil`/ripple are `Float32Array` fields (→ ImageData), and only `Sound` uses WebAudio (→ `Sim.audio`). Reach for the lightest tool that fits.

Copy-paste usage for each is in **`/sims/lib/README.md`**. Add new primitives there when a second sim needs them — never re-draw an arrowhead by hand again.

## Workflow

```
Build Progress:
- [ ] 1. Name the phenomenon and the ONE thing to grasp; choose single-page vs module and **plan the full figure arc** (list the sections — don't cap at ~6 steps)
- [ ] 2. Do the research pass when needed: course source, existing explorable, or local reference → extract the mechanism to simulate
- [ ] 3. Evaluate the request → pick the rendering + interaction method (decision table above)
- [ ] 4. Render one static frame of the system (no motion yet)
- [ ] 5. Add the update loop (fixed timestep) — verify it's stable
- [ ] 6. Add interaction (pointer + sliders bound to params)
- [ ] 7. Tune defaults/presets so frame 1 is already interesting
- [ ] 8. Perf pass (HiDPI, offscreen pause, no per-frame allocs)
- [ ] 9. Add/update `/sims/index.html` and any short `/sims/README.md` note
- [ ] 10. Generate the gallery thumbnail: `npm run thumbs` (commit the new `/sims/thumbs/<slug>.png`)
- [ ] 11. Mobile + reduced-motion + aria pass
- [ ] 12. Browser verify using `reference/verification.md`
- [ ] 13. Run `npm run eval:sims`; fix objective failures before polishing
- [ ] 14. Log durable eval lessons with `$meta-skill-evaluator`; update this skill only for recurring or reusable lessons
```

## Anti-patterns

- Method by habit instead of by request: a 3D engine for 2D waves (too heavy), or a rasterized canvas for a labeled diagram SVG would render crisply (too light). Match the tool to the job.
- `setInterval` loops, frame-rate-dependent physics, blurry non-HiDPI canvas.
- Twenty sliders and no default state — the reader bounces before understanding anything.
- A build step or npm dependency that breaks plain static hosting.
- Allocating garbage every frame; never pausing offscreen.
- Shipping a new sim without the deterministic eval report and an independent pedagogy/affordance review.
- Patching generated HTML repeatedly while leaving the skill, starter, evaluator, or references unchanged when the same failure will recur.

## References

- **Inspiration catalog** (who to study + what to steal): [reference/inspiration.md](reference/inspiration.md)
- **Copy-paste code patterns** (HiDPI canvas, fixed-timestep loop, pointer drag, SVG binding, three.js/p5 skeletons): [reference/patterns.md](reference/patterns.md)
- **Verification checklist** (run, visual, interaction, 3D/WebGL, blank-canvas debugging, automated Playwright checks): [reference/verification.md](reference/verification.md)
- **Evaluation rubric & independent grader workflow** (deterministic Playwright grader, saved artifacts, agent review prompt): [reference/evaluation.md](reference/evaluation.md)
- **Data/WebGL production pattern** (Fog City Atlas lessons, static data pipelines, debug hooks, generated artifacts): [reference/data-webgl.md](reference/data-webgl.md)
- **Course idea bank** (Stanford/MIT/Berkeley/Harvard-inspired concepts to turn into sims): [reference/idea-bank.md](reference/idea-bank.md)
- **General design patterns** (PhET, GeoGebra, NASA Eyes, Nicky Case, TensorFlow Playground): [reference/design-patterns.md](reference/design-patterns.md)
- **Broader stack and source notes** (outside this static-site repo): [reference/tech-stack.md](reference/tech-stack.md), [reference/source-map.md](reference/source-map.md)
- **Live component library & examples** in this repo at `/sims/` — `lib/simkit.js`, `_template/`, `_explainer/`, and one example per method (see `/sims/README.md`).
- **Core component cheatsheet** (copy-paste usage for `Sim.v`, `smoothstep`, `ctx.arrow`/`disc`/`panel`/`label`, `Sim.heat`, `Sim.orbit`): [`/sims/lib/README.md`](../../../sims/lib/README.md).
