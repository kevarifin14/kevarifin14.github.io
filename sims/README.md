# /sims — interactive simulations

Self-contained, framework-free simulations served at https://kevinarifin.com/sims/.
No build step: each folder is plain HTML/JS/CSS that runs as static files on GitHub Pages.

## Layout
- `lib/simkit.js` — shared toolkit: `Sim.fitCanvas` (HiDPI), `Sim.loop` (fixed-timestep + visibility/offscreen pause), `Sim.pointer`, `Sim.bind`, `Sim.rng` (seeded), `Sim.palette`.
- `lib/sim.css` — shared dark theme + control styling (matches the site).
- `_template/` — copy this to start a new Canvas 2D sim.
- `index.html` — the gallery (linked from the site nav).
- One folder per sim, each picking the right method:
  - `ripple` — Canvas 2D (wave field)
  - `pendulum` — SVG (vector geometry + labels)
  - `orbit` — three.js (3D)
  - `flow-field` — p5.js (generative)
  - `bars` — D3 (data viz)
  - `stack` — Matter.js (rigid-body physics)

## Add a new sim
1. `cp -r _template my-sim` (or copy the example closest to your method).
2. Edit `my-sim/index.html`: replace `reset` / `update(dt)` / `render()` with your model.
3. Add a card to `index.html`.
4. Commit + push — live at `/sims/my-sim/` in ~1 min.

## Choosing the method (no default — right tool for the job)
SVG for labeled diagrams/axes; Canvas 2D for fields/particles/high counts; WebGL/three.js for 3D; D3 for data; Matter/Rapier for rigid-body physics; p5 for quick sketches. Full decision guide: `.claude/skills/building-html-simulations/SKILL.md`.

## Local preview
Canvas/SVG/p5/D3/Matter open from `file://`. The three.js example uses ES modules — serve it:

    python3 -m http.server

then open http://localhost:8000/sims/
