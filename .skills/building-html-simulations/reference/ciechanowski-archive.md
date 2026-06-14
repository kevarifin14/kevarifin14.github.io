# Ciechanowski Archive Map

Use this when planning a serious explorable explanation, especially a long module with many figures. It distills Bartosz Ciechanowski's public archive into reusable simulation patterns for this repo. Steal the method: focused figures, direct manipulation, synced views, first-principles pacing, and hand-built performance. Do not copy his code, prose, or visual surface.

Source: https://ciechanow.ski/archives/ crawled on 2026-06-14. The archive listed 22 public entries from 2014-2024. The crawl also confirmed the engineering pattern: every entry loads `/js/base.js`; most modern explainers add a topic script such as `/js/moon.js`, `/js/airfoil.js`, or `/js/bicycle.js`.

## How to Use This Map

1. Name the concept and decide whether it is a one-figure sim or a module.
2. Find the closest article pattern below, not necessarily the closest topic.
3. Build the prerequisite ladder: one focused figure per idea the reader must own before the final mechanism.
4. For every figure, specify one state variable, one direct handle, one observation to watch, and one reset/preset.
5. End with a composed figure where the reader controls the full system.

## Archive-Wide Patterns

- **Many focused figures beat one mega-toy.** The newer articles use dense runs of small interactive figures. A figure should isolate one claim, not carry the whole lesson.
- **Prerequisite ladders make hard ideas feel earned.** Start below the headline concept: force before torque before self-balancing; rays before focus before lenses; bits before special floating-point values.
- **Two synced views are often the lesson.** Pair mechanism with appearance, hidden state with readout, or local control with global result.
- **Direct manipulation is the default.** Drag the orbit, control point, wheel, ray, signal source, mass, or probe directly before adding sliders.
- **Exaggerate, then dial back to reality.** Make weak effects visible first, then let the reader reduce the exaggeration to realistic scale.
- **Color, arrows, trails, and gauges carry quantities.** Use heat color for magnitude, vector arrows for direction and strength, trails for history, and a small readout for the one number that matters.
- **One shared engine plus topic scripts scales.** Mirror the split locally: put reusable primitives in `/sims/lib/simkit.js`, keep each sim's domain logic in its page or module file.

## Article-by-Article Lessons

| Article | Primary lesson | Simulation pattern to reuse |
|---|---|---|
| [Moon](https://ciechanow.ski/moon/) | Lunar phases, orbital geometry, lighting, eclipses. | Sync a god's-eye orbit view with the observer's view. Let the reader drag phase angle and see both the mechanism and what Earth sees. |
| [Airfoil](https://ciechanow.ski/airfoil/) | Lift as a field phenomenon around geometry. | Combine shape controls with flow particles/streamlines and pressure/velocity color. Show local field probes before final force arrows. |
| [Bicycle](https://ciechanow.ski/bicycle/) | Self-stability emerges from basic mechanics and steering geometry. | Build a deep prerequisite ladder: force, moment, load transfer, steering, stability, then frame stress. Use many tiny figures before the full bike. |
| [Sound](https://ciechanow.ski/sound/) | Sound as moving air, waveform, frequency, phase, and perception. | Use audio only after a user gesture. Sync animated medium motion, waveform trace, spectrum/readout, and controls for amplitude/frequency. |
| [Mechanical Watch](https://ciechanow.ski/mechanical-watch/) | A hidden timing mechanism decomposed into energy, gear train, escapement, and regulation. | Use cutaways, slow motion, exploded views, and energy-flow arrows. Let one part drive the next before showing the whole mechanism. |
| [GPS](https://ciechanow.ski/gps/) | Position from signal travel time, satellite geometry, and clock correction. | Turn invisible constraints into circles/spheres. Let users move receivers/satellites and watch feasible regions collapse to a point. |
| [Curves and Surfaces](https://ciechanow.ski/curves-and-surfaces/) | Control points, interpolation, continuity, subdivision, and surfaces. | Make every control point draggable. Pair the construction scaffold with the resulting curve or surface; animate subdivision levels. |
| [Naval Architecture](https://ciechanow.ski/naval-architecture/) | Buoyancy, center of mass, center of buoyancy, stability, hull form. | Show cross-section plus force arrows. Let the hull heel and move load; show the restoring moment as the center of buoyancy shifts. |
| [Internal Combustion Engine](https://ciechanow.ski/internal-combustion-engine/) | Cyclic mechanism with timing, pressure, pistons, valves, and combustion. | Use phase scrubbers, transparent cutaways, synchronized cam/crank views, and pressure-volume readouts. |
| [Cameras and Lenses](https://ciechanow.ski/cameras-and-lenses/) | Rays, focus, aperture, focal length, blur, and image formation. | Let users drag object/lens/sensor positions. Draw only the rays needed for the current idea, then add blur circle and aperture effects. |
| [Lights and Shadows](https://ciechanow.ski/lights-and-shadows/) | Light rays, blockers, projection, umbra/penumbra, softness, intensity. | Make the light and blocker draggable. Sync ray geometry with the shadow image and intensity plot. |
| [Gears](https://ciechanow.ski/gears/) | Meshing teeth, ratios, torque/speed tradeoff, gear trains. | Animate contact and phase. Show ratio as both motion and numbers; let users add or resize gears with immediate constraint feedback. |
| [Tesseract](https://ciechanow.ski/tesseract/) | Higher-dimensional structure understood through projection and rotation. | Use rotatable wireframes, projection controls, slicing, and ghosted previous states. Keep orientation aids visible. |
| [Earth and Sun](https://ciechanow.ski/earth-and-sun/) | Sun angle, orbit, axial tilt, seasons, and day length. | Sync orbit view, local horizon view, and light/shadow on a globe. Let users scrub date and latitude. |
| [Alpha Compositing](https://ciechanow.ski/alpha-compositing/) | Transparency math, filtering, interpolation, and compositing operators. | Pair pixel-level math with draggable overlapping layers. Show before/after and the exact channel readout for one sampled pixel. |
| [Color Spaces](https://ciechanow.ski/color-spaces/) | Chromaticity, gamut, white point, and tone response. | Use draggable color points plus a live conversion/readout. Show gamut boundaries and what clips or shifts when changing spaces. |
| [Exposing Floating Point](https://ciechanow.ski/exposing-floating-point/) | Floating-point encoding, exponent/significand maps, and edge cases. | Build from decimal to binary to sign/exponent/significand. Use bit toggles, number-line maps, and special-value presets. |
| [Mesh Transforms](https://ciechanow.ski/mesh-transforms/) | Vertex/face coordinates, transforms, depth, and rendering pipeline surprises. | Show mesh, coordinate axes, transform matrix, and rendered result as linked views. Let users edit transforms and watch leaky abstractions appear. |
| [Exposing NSDictionary](https://ciechanow.ski/exposing-nsdictionary/) | Reverse engineering a data structure by observing memory and behavior. | Use stepwise forensic diagrams: observation, memory layout hypothesis, probe, contradiction, refined model. |
| [Exposing NSMutableArray](https://ciechanow.ski/exposing-nsmutablearray/) | Runtime inspection, storage layout, bounds checks, and implementation detail. | Turn opaque internals into inspected layers. Pair code/action on the left with memory/state changes on the right. |
| [Drawing Bezier Curves](https://ciechanow.ski/drawing-bezier-curves/) | Subdivision, tangents, flattening, length estimation, and GPU path drawing. | Make control handles draggable. Show construction lines, subdivision recursion, flatness threshold, and rendered path together. |
| [Exploring GPGPU on iOS](https://ciechanow.ski/exploring-gpgpu-on-ios/) | GPU compute as data-parallel transformation, performance, precision, and constraints. | Compare CPU and GPU paths with the same input. Show data buffers, shader step, timing chart, and precision failure cases. |

## Planning Templates

### Mechanism Explainer

Use for watches, engines, bicycles, gears, cameras, and other machines.

- Figure 1: one primitive force/motion input.
- Figure 2: a lever, constraint, or transmission that transforms it.
- Figure 3: timing or phase relationship.
- Figure 4: failure mode when one part is removed.
- Figure 5+: composed mechanism with slow motion, cutaway, and labels.

### Field Explainer

Use for airfoil, light, sound, heat, waves, fluids, electromagnetism, or probability density.

- Figure 1: a single source and a local probe.
- Figure 2: one draggable source/geometry change.
- Figure 3: color-mapped magnitude or vector field.
- Figure 4: multiple sources or boundary conditions.
- Figure 5+: final field plus readout/histogram/measurement.

### Geometry and Projection Explainer

Use for moon phases, GPS, tesseracts, lenses, Earth/Sun, color spaces, and transforms.

- Figure 1: simple constructed geometry.
- Figure 2: direct handle for the key angle, point, or vector.
- Figure 3: synced views: construction plus observed result.
- Figure 4: degenerate or failure case.
- Figure 5+: full model with presets for canonical states.

### Computational Internals Explainer

Use for floating point, data structures, rendering pipelines, and GPU compute.

- Figure 1: concrete input value or operation.
- Figure 2: representation layout.
- Figure 3: one manual edit or step.
- Figure 4: edge case or surprising behavior.
- Figure 5+: compare model prediction with actual result/performance.

## Definition of Done for a Ciechanowski-Style Module

- The concept has a prerequisite ladder, not just a topic outline.
- Each rung has at least one interactive figure with direct manipulation.
- Every figure teaches one new variable or relationship.
- The final figure composes earlier ideas rather than introducing unrelated new machinery.
- At least one figure has synced views when hidden geometry/state matters.
- At least one preset demonstrates a failure mode.
- The page has calm prose around figures: what to notice, then interaction, then the next idea.
- Shared primitives that appear twice are moved into `Sim` or documented in `/sims/lib/README.md`.
