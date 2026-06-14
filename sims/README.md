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
  - `coulomb` — Canvas 2D (point charges and inverse-square forces)
  - `pendulum` — SVG (vector geometry + labels)
  - `double-pendulum` — Canvas 2D (chaotic deterministic motion)
  - `orbital-transfer` — Canvas 2D (Hohmann transfer geometry)
  - `orbit` — three.js (3D)
  - `flow-field` — p5.js (generative)
  - `bars` — D3 (data viz)
  - `stack` — Matter.js (rigid-body physics)
  - `sorting-race` — Canvas 2D (sorting algorithm comparison)
  - `percolation` — Canvas 2D (grid percolation threshold)
  - `csp-map-coloring` — Canvas 2D (constraint satisfaction search)
  - `neural-boundary` — Canvas 2D (tiny neural decision field)
  - `kmeans` — Canvas 2D (clustering assignments and centroids)
  - `game-of-life` — Canvas 2D (cellular automata)
  - `gradient-descent` — Canvas 2D (optimization)
  - `bias-variance` — Canvas 2D (model selection and overfitting)
  - `gridworld` — Canvas 2D (MDP value iteration)
  - `pagerank` — Canvas 2D (random-surfer graph ranking)
  - `astar` — Canvas 2D (heuristic shortest-path search)
  - `markov-chain` — Canvas 2D (stationary distribution and mixing)
  - `random-walk` — Canvas 2D (diffusion from independent steps)
  - `monte-carlo-pi` — Canvas 2D (Monte Carlo area estimation)
  - `coupon-collector` — Canvas 2D (long-tail collection time)
  - `birthday-paradox` — Canvas 2D (collision probability)
  - `bootstrap` — Canvas 2D (resampling uncertainty)
  - `mm1-queue` — Canvas 2D (queue utilization threshold)
  - `gambler-ruin` — Canvas 2D (absorbing random walks)
  - `bayes-test` — Canvas 2D (Bayes theorem and base rates)
  - `sir` — Canvas 2D (differential-equation model)
  - `pid-control` — Canvas 2D (feedback control)
  - `kalman` — Canvas 2D (state estimation under noise)
  - `reaction-diffusion` — Canvas 2D (Turing-style pattern formation)
  - `predator-prey` — Canvas 2D (Lotka-Volterra population cycles)
  - `enzyme-kinetics` — Canvas 2D (Michaelis-Menten saturation)
  - `gillespie` — Canvas 2D (stochastic birth-death simulation)
  - `forest-fire` — Canvas 2D (cellular automaton burn waves)
  - `heat-equation` — Canvas 2D (diffusion equation smoothing)
  - `robot-arm-ik` — Canvas 2D (two-link inverse kinematics)
  - `network-cascade` — Canvas 2D (threshold adoption on a graph)
  - `congestion-pricing` — Canvas 2D (route choice and tolls)
  - `power-delivery` — Canvas 2D (voltage/current/resistive loss scaling)
  - `schelling` — Canvas 2D (agent-based local preference model)
  - `mandelbrot` — Canvas 2D (fractal zoom explorer)

## Research sources

The gallery uses the shared skill research notes in `.skills/building-html-simulations/reference/`. Recent course-inspired sims draw from Stanford CS229 model selection, bias/variance, k-means, and neural-network material; Stanford CS221 MDP, CSP, and search material; Stanford CS224W PageRank/cascade material; Stanford CS109 probability topics such as Markov chains, birthday collisions, coupon collection, and gambler's ruin; MIT OCW stochastic processes, random walks, queueing, feedback control, orbital mechanics, heat/diffusion, reaction-diffusion, enzyme kinetics, Gillespie simulation, predator-prey, and systems biology material; Princeton percolation/union-find material; Harvard CS50 algorithm material; and Stanford Nifty Schelling material.

## Add a new sim
1. `cp -r _template my-sim` (or copy the example closest to your method).
2. Edit `my-sim/index.html`: replace `reset` / `update(dt)` / `render()` with your model.
3. Add a card to `index.html`.
4. Commit + push — live at `/sims/my-sim/` in ~1 min.

## Choosing the method (no default — right tool for the job)
SVG for labeled diagrams/axes; Canvas 2D for fields/particles/high counts; WebGL/three.js for 3D; D3 for data; Matter/Rapier for rigid-body physics; p5 for quick sketches. Full decision guide: `.claude/skills/building-html-simulations/SKILL.md`.

Claude and Codex both use the same simulation-building skill through symlinks:

- Canonical skill: `.skills/building-html-simulations/`
- Claude path: `.claude/skills/building-html-simulations`
- Codex path: `~/.codex/skills/building-html-simulations`

Update the canonical folder only; both agents will read the same workflow, references, and starter asset.

## Local preview
Canvas/SVG/p5/D3/Matter open from `file://`. The three.js example uses ES modules — serve it:

    python3 -m http.server

then open http://localhost:8000/sims/

## Evaluate the gallery

Run the deterministic browser grader before and after a batch of sim edits:

    npm install
    npx playwright install chromium
    npm run eval:sims

## Gallery thumbnails

The gallery shows a thumbnail per sim, auto-injected from `thumbs/<slug>.png`
(a small client script keyed off each card's href; a missing image is dropped silently).
Regenerate them after adding or changing a sim:

    npm run thumbs

`scripts/thumbnails.mjs` serves the site, opens each sim in Chromium, gives it one
"positive" poke (Drop/Draw/Random — never Pause/Reset) so data-driven sims show real
content, screenshots the `.stage`, and writes `thumbs/<slug>.png`. Commit the new PNGs.

It discovers the gallery, opens every sim in Chromium, checks runtime errors, screenshots the stage, pokes controls, checks mobile layout, and writes `sims/eval-results/latest.json` plus `sims/eval-results/latest.md`. Use the report with an independent agent review to decide the next fixes.
