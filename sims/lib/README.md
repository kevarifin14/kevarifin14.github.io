# simkit — core reusable components

`simkit.js` is the shared engine for every sim (the equivalent of Ciechanowski's
`base.js`). Load it with `<script src="../lib/simkit.js"></script>` and use `Sim`.
Everything is dependency-free and works from `file://`.

## Loop, input, controls (already used everywhere)

```js
const sim = Sim.loop({ update, render, stage: canvas.parentElement }); // fixed-timestep + offscreen pause
Sim.pointer(canvas, { down(p){}, move(p){}, up(p){} });                // mouse + touch, coords in CSS px
Sim.bind("speed", params, "speed", v => (+v).toFixed(2));              // <input> → params + #speedValue readout
Sim.steps(stepsEl, (i, el) => { ... });                                 // scrollytelling: fire on each [data-step]
const view = Sim.fitCanvas(canvas, ctx);                                // HiDPI sizing → {w,h,dpr}
const rnd = Sim.rng(7);                                                 // seeded RNG for reproducible resets
```

## Scalar math (ease and remap)

```js
Sim.clamp(x, 0, 1);
Sim.lerp(a, b, f);                 // blend
Sim.smoothstep(0, 1, t);           // the workhorse: ease a 0..1 transition (S-curve)
Sim.map(x, inMin, inMax, 0, 1);    // remap a range
```
Use `smoothstep` to fade things in as a step scrolls into view, or to soften a slider's effect.

## 2D vectors (`Sim.v`, operates on `{x, y}`)

```js
const dir   = Sim.v.norm(Sim.v.sub(b, a));   // unit vector a→b
const mid   = Sim.v.lerp(a, b, 0.5);         // midpoint
const r     = Sim.v.dist(a, b);              // distance
const tip   = Sim.v.add(a, Sim.v.scale(dir, 40));
const side  = Sim.v.perp(dir);               // 90° rotate
const where = Sim.v.fromAngle(theta, radius);// polar → cartesian
```

## Draw primitives (methods on the canvas context)

Set `strokeStyle`/`fillStyle` first, then call — just like the native API.

```js
ctx.strokeStyle = ctx.fillStyle = "#e8c547";
ctx.arrow(x0, y0, x1, y1, 9);   // line + arrowhead (force/velocity vectors)
ctx.strokeLine(x0, y0, x1, y1); // quick segment
ctx.disc(x, y, r);              // filled circle
ctx.ring(x, y, r);              // stroked circle
ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.panel(x, y, w, h, 10);  // rounded inset background
ctx.label(x, y, "θ = 30°", { color: "#8a8a8f", align: "center", size: 11 });
```

## Color by magnitude

```js
ctx.fillStyle = Sim.heat(speed / maxSpeed); // 0→dark, mid→gold, 1→white
ctx.disc(x, y, r);
const c = Sim.mix([79,163,255], [232,197,71], t); // blend two RGB arrays
```
Bright = high (force, speed, stress) — the Ciechanowski "color-code the magnitude" trick.

## Light 3D (rotate → project → drag-orbit)

For genuinely 3D scenes prefer three.js; for a quick rotatable wireframe/point cloud:

```js
const cam = Sim.orbit(canvas, { onChange: () => sim.renderOnce() }); // drag to orbit
function render() {
  for (const p of points) {                       // p = {x,y,z}
    const q = Sim.project(Sim.rot3(p, cam.yaw, cam.pitch), { cx: view.w/2, cy: view.h/2, scale: 120 });
    ctx.disc(q.x, q.y, 3 * q.s);                   // q.s = perspective scale (depth cue)
  }
}
```

## Audio — `Sim.audio()` (WebAudio)

Make sound, but only after a user gesture (browsers block audio until a click/tap).

```js
const sound = Sim.audio();                       // lazy AudioContext
playBtn.onclick = () => {
  const t = sound.tone(440, { type: "sine" });   // A4; returns a live controller
  freqSlider.oninput = e => t.freq(+e.target.value);
  stopBtn.onclick = () => t.stop();
};
sound.beep(880, 150);                            // quick chirp
const scope = sound.analyser();                  // const wave = scope.read(); → Float32 samples to plot
```

## Use-case map (decomposed from his archive)

His `base.js` is **one shared file** loaded by every article; the per-article files (`moon.js`, `sound.js`, `airfoil.js`, …) are use-case-specific and almost all hand-rolled WebGL with ArcBall drag-orbit. Mapped to the lightest tool for us:

| His use case (examples) | He uses | Reach for |
|---|---|---|
| 3D scenes — Moon, Watch, Engine, Lenses, GPS, Airfoil | hand-rolled WebGL + ArcBall | **three.js** (real 3D) or **`Sim.orbit`/`rot3`/`project`** (light wireframe) |
| 2D mechanism figures — Gears | plain Canvas 2D | **Canvas 2D + simkit primitives** |
| Abstract projection — Tesseract | Canvas 2D | **`Sim.rot3`/`project` + Canvas** |
| Numeric field / sim — Airfoil (fluid), Ripple | `Float32Array` grids | **ImageData field render** (see `ripple`, `coulomb`) |
| Sound / pitch — Sound | WebAudio (oscillators, analyser) | **`Sim.audio()`** |
| Drag-to-orbit (nearly every figure) | ArcBall / TwoAxis | **`Sim.orbit(el)`** / three.js OrbitControls |

Right tool for the job: pick the lightest one that expresses the phenomenon.

## Patterns worth keeping (from his articles)

- **Exaggerate, then real.** Add an "exaggeration" slider; show the effect huge first, then dial to realistic.
- **One global feel.** Keep colors from `Sim.palette`; size arrows proportional to magnitude.
- **Prose rhythm** for explainers: principle → manipulate → "notice that…" → add one variable.

Add new primitives here (e.g. `Sim.spring`, `Sim.axes`) when a second sim needs them — never re-draw an arrowhead by hand again.
