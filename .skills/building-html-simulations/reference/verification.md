# Verification Checklist

Run this before delivering a simulation, or when debugging broken rendering. Verifying a sim actually rendered and responds is as important as building it.

## Contents
- Run mode
- Visual checks
- Interaction checks
- Simulation checks
- 3D / WebGL checks
- Blank-stage debugging
- Automated (Playwright) checks
- Delivery note

## Run mode
- Plain static HTML with no modules can be opened directly (`file://`) — true for the Canvas and SVG examples.
- ES modules / importmaps (three.js), wasm physics (Rapier), imported assets, and textures need a local server:
  ```bash
  python3 -m http.server 8000
  ```
- This site ships as static files, so the local server reproduces GitHub Pages behavior exactly.

## Visual checks
- Desktop: stage, primary controls, readouts, and reset are visible in the first viewport.
- Mobile: controls stay tappable, text fits, the stage doesn't overflow (`touch-action: none` on the stage so dragging doesn't scroll the page).
- Canvas/SVG/WebGL content is not blank; the scene stays framed after resize.
- Labels/overlays don't cover critical controls.
- `prefers-reduced-motion` users get a static/stepped/slowed mode, not forced animation.

## Interaction checks
- Drag, click, hover, sliders, toggles, presets, reset, pause/play, step all work.
- At least one variable produces an obvious visual or numeric change.
- Presets lead to visibly distinct states.
- Reset restores both model state and camera/view state.
- Touch works on the intended device class; keyboard reaches important controls.

## Simulation checks
- `dt` is clamped after hidden-tab/debugger pauses; the loop pauses offscreen.
- Conserved quantities (energy, mass, count, probability) behave intentionally.
- Extreme slider values don't explode the model or lock the UI.
- Randomness is seeded/resettable when reproducibility matters.
- Units, approximations, and simplifications are documented in code or a short UI label.

## 3D / WebGL checks
- Camera framing, lighting, and materials make the scene visible (not a black void).
- Models/textures/wasm load (check the network tab); async loading is handled visibly.
- Orbit/zoom work; a "home" command restores the view.
- On WebGL context-creation failure, show a fallback message.
- Dispose geometries/materials/textures when tearing a scene down.

## Blank-stage debugging
If the stage is blank, check in order: element has nonzero width/height → CSS visibility/opacity → the draw loop is actually running → (3D) camera position/target → (3D) a light exists and material color isn't black → asset paths resolve.

## Automated (Playwright) checks
- Screenshot desktop + mobile.
- Assert no console errors and no failed network requests.
- Assert the main canvas/SVG is visible with nonzero dimensions.
- Drive one primary interaction (click/drag/slider) and assert the visual/readout changed.
- Change state, then assert reset returns to baseline.
- 2D canvas: sample `getImageData` (same-origin) to confirm non-blank. WebGL: use a screenshot — the 2D context isn't available on a WebGL canvas.

## Delivery note
Report what was verified and what wasn't. If a dev server is left running, give the exact URL.
