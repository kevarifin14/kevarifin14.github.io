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
  - `game-of-life` — Canvas 2D (cellular automata)
  - `gradient-descent` — Canvas 2D (optimization)
  - `bias-variance` — Canvas 2D (model selection and overfitting)
  - `gridworld` — Canvas 2D (MDP value iteration)
  - `pagerank` — Canvas 2D (random-surfer graph ranking)
  - `astar` — Canvas 2D (heuristic shortest-path search)
  - `markov-chain` — Canvas 2D (stationary distribution and mixing)
  - `random-walk` — Canvas 2D (diffusion from independent steps)
  - `monte-carlo-pi` — Canvas 2D (Monte Carlo area estimation)
  - `bayes-test` — Canvas 2D (Bayes theorem and base rates)
  - `sir` — Canvas 2D (differential-equation model)
  - `pid-control` — Canvas 2D (feedback control)
  - `kalman` — Canvas 2D (state estimation under noise)
  - `reaction-diffusion` — Canvas 2D (Turing-style pattern formation)
  - `predator-prey` — Canvas 2D (Lotka-Volterra population cycles)
  - `schelling` — Canvas 2D (agent-based local preference model)

## Research sources

The gallery uses the shared skill research notes in `.skills/building-html-simulations/reference/`. Recent course-inspired sims draw from Stanford CS229 model selection and bias/variance notes, Stanford CS221 MDP/value-iteration notes, Stanford CS224W graph/PageRank material, MIT OCW stochastic-processes material, Stanford CS106B Dijkstra/A* material, MIT OCW Kalman-filter notes, MIT OCW reaction-diffusion/pattern-formation notes, Stanford Nifty/agent-based Schelling model material, Stanford CS109 Markov-chain material, MIT OCW random-walk/diffusion notes, MIT OCW Monte Carlo notes, and MIT OCW Systems Biology predator-prey material.

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

It discovers the gallery, opens every sim in Chromium, checks runtime errors, screenshots the stage, pokes controls, checks mobile layout, and writes `sims/eval-results/latest.json` plus `sims/eval-results/latest.md`. Use the report with an independent agent review to decide the next fixes.
