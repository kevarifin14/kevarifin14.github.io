# Simulation Eval Report

Run: 2026-06-14T03:10:54.041Z
Base URL: http://127.0.0.1:62391
Overall: **100/100** (strong) across 26 sims.

## Rubric

- **Runtime health** (20): 100/100 average
- **Visual frame** (18): 100/100 average
- **Interaction** (18): 100/100 average
- **Learning layer** (16): 100/100 average
- **Accessibility/mobile** (16): 100/100 average
- **Implementation** (12): 100/100 average

## Results

| Sim | Tech | Score | Status | Biggest misses |
|---|---:|---:|---|---|
| [Ripple Tank](/sims/ripple/) | Canvas 2D | 100 | strong | None |
| [Pendulum](/sims/pendulum/) | SVG | 100 | strong | None |
| [Physics Stack](/sims/stack/) | Matter.js | 100 | strong | None |
| [Fourier Epicycles](/sims/fourier/) | Canvas 2D | 100 | strong | None |
| [Game of Life](/sims/game-of-life/) | Canvas 2D | 100 | strong | None |
| [Gradient Descent](/sims/gradient-descent/) | Canvas 2D | 100 | strong | None |
| [Bias-Variance](/sims/bias-variance/) | Canvas 2D | 100 | strong | None |
| [MDP Gridworld](/sims/gridworld/) | Canvas 2D | 100 | strong | None |
| [PageRank Surfer](/sims/pagerank/) | Canvas 2D | 100 | strong | None |
| [A* Pathfinding](/sims/astar/) | Canvas 2D | 100 | strong | None |
| [SIR Epidemic](/sims/sir/) | Canvas 2D | 100 | strong | None |
| [PID Control](/sims/pid-control/) | Canvas 2D | 100 | strong | None |
| [Kalman Filter](/sims/kalman/) | Canvas 2D | 100 | strong | None |
| [Reaction-Diffusion](/sims/reaction-diffusion/) | Canvas 2D | 100 | strong | None |
| [Bayes Test](/sims/bayes-test/) | Canvas 2D | 100 | strong | None |
| [Galton Board](/sims/galton/) | Canvas 2D | 100 | strong | None |
| [Central Limit Theorem](/sims/clt/) | Canvas 2D | 100 | strong | None |
| [Interactive Bars](/sims/bars/) | D3 | 100 | strong | None |
| [Supply & Demand](/sims/supply-demand/) | Canvas 2D | 100 | strong | None |
| [Options Payoffs](/sims/options/) | Canvas 2D | 100 | strong | None |
| [Schelling Model](/sims/schelling/) | Canvas 2D | 100 | strong | None |
| [Phonics Blender](/sims/phonics/) | Web Speech | 100 | strong | None |
| [The Road to Serfdom](/sims/road-to-serfdom/) | Explorable | 100 | strong | None |
| [3D Orbit](/sims/orbit/) | three.js | 100 | strong | None |
| [Flow Field](/sims/flow-field/) | p5.js | 100 | strong | None |
| [Explained: Waves](/sims/_explainer/) | Explorable | 100 | strong | None |

## Common Failure Modes

- None

## Weakest Sims

- **Ripple Tank** (/sims/ripple/) scored 100. Top misses: None
- **Pendulum** (/sims/pendulum/) scored 100. Top misses: None
- **Physics Stack** (/sims/stack/) scored 100. Top misses: None
- **Fourier Epicycles** (/sims/fourier/) scored 100. Top misses: None
- **Game of Life** (/sims/game-of-life/) scored 100. Top misses: None

## Method

This evaluator starts the static site, discovers gallery cards, opens each sim in Chromium, watches console/page/resource failures, screenshots `.stage`, samples PNG pixels for non-blankness, exercises one range/button/stage interaction, checks mobile overflow, and scores deterministic rubric checks. It is intentionally conservative: passing the script does not replace human/LLM review of pedagogy, but failures are concrete issues to fix.
