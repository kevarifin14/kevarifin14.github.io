# Technology Stack Choices

Use this reference when deciding what to build with.

## Decision Table

| Need | Prefer | Notes |
| --- | --- | --- |
| Labeled diagrams, low-count geometry, axes | SVG + HTML/CSS | Best for crisp text, hit targets, and inspectable shapes. |
| Many particles, fields, cellular automata, custom raster drawing | Canvas 2D | Simple, fast, and portable. Keep UI outside the canvas when text-heavy. |
| 3D objects, cameras, lighting, orbital controls, model loading | Three.js | Flexible and widely documented. Add controls, loaders, and physics as needed. |
| More batteries-included 3D engine workflows | Babylon.js | Useful when a full engine, GUI, WebXR, or integrated tooling helps. |
| Creative coding or sketch-like educational demos | p5.js | Good for fast prototypes, approachable code, and visual experiments. |
| Bespoke data visualization with interactive scales/axes | D3 | Good for SVG/Canvas/data joins and custom charts. |
| Reactive notebooks or research prototypes | Observable-style structure | Good for parameters, outputs, and fast iteration; port carefully for production. |
| 2D rigid-body physics | Matter.js | Good for approachable browser-based collisions, constraints, and mouse interaction. |
| Fast 2D or 3D physics, especially with Three.js | Rapier | WebAssembly-based; handle async loading and timestep stability. |
| Massive GPU compute or advanced rendering | WebGL/WebGPU directly | Use only when the abstraction cost of Three.js/Babylon is a real blocker. |

## Architecture Pattern

Prefer this structure for custom simulations:

```js
const state = {
  running: true,
  time: 0,
  parameters: {},
  entities: []
};

function reset(seedOrPreset) {}
function applyInput(input) {}
function update(dt) {}
function render() {}

function frame(now) {
  const dt = clampDelta(now);
  if (state.running) update(dt);
  render();
  requestAnimationFrame(frame);
}
```

Keep input handling, model update, and rendering separable. This makes reset, presets, tests, and alternate renderers easier.

## Canvas 2D Notes

- Size the canvas from CSS layout, then set backing pixels with `devicePixelRatio`, clamped to a sensible max such as `2`.
- Use `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` after resizing.
- Use `requestAnimationFrame` and clamp `dt` after tab switches.
- Keep text-heavy UI in HTML, not drawn into the canvas.
- For trails, paint a translucent background instead of fully clearing each frame.
- For hit testing, convert pointer coordinates from client space to canvas CSS pixels.

## Three.js Notes

- Create scene, camera, renderer, controls, lights, resize handler, animation loop.
- Clamp renderer pixel ratio for performance.
- Start with clear geometry and lighting before adding shaders or post-processing.
- Use `OrbitControls` or domain-specific camera controls; add a home/reset camera command.
- Dispose geometries, materials, textures, and renderers when mounting/unmounting in a framework.
- For physical systems, keep physics world state separate from Three.js meshes and sync transforms after stepping physics.

## SVG and D3 Notes

- Use SVG when labels, axes, and semantic shapes matter.
- Use D3 for scales, axes, data joins, force layouts, brush/zoom, and animated transitions.
- Avoid SVG for thousands of moving objects unless performance is tested.
- If chart state drives simulation state, keep a single source of truth and render both from it.

## Physics Notes

- Use a library for rigid-body collisions, constraints, joints, sleeping, restitution, and friction.
- Use fixed or semi-fixed timesteps for stability.
- Expose simplified controls to learners, not every internal solver setting.
- Keep units coherent. If using pixels as meters, document the scale inside the code.
- For educational physics, decide whether the goal is realistic behavior or visible intuition; tune accordingly.

## Dependency Choices

- In an existing repo, use the repo's framework, build system, dependency style, and icon/component libraries.
- In a standalone HTML deliverable, prefer minimal dependencies and CDN-free code unless a library is central to the simulation.
- If using CDN imports, note that a local server and network connection may be required.
- If using npm packages, verify install scripts and package versions with current official docs when the exact API matters.
