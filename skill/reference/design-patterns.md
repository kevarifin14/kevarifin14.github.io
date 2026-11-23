# Design Patterns for HTML Simulations

Use this reference when the hard part is learning design, not library syntax.

## Benchmark Lessons

PhET-style science sims:
- Design for inquiry: the learner should be able to ask "what happens if..." and answer it by changing variables.
- Make invisible concepts visible: forces, charges, atoms, fields, flows, wavefronts, probabilities, hidden layers.
- Keep controls close to the thing they affect.
- Use reset, measuring tools, traces, and multiple representations so students can test ideas.

GeoGebra-style math tools:
- Represent constraints directly: draggable points, sliders, constructed objects, locked relationships.
- Preserve mathematical relationships while users manipulate the scene.
- Make exact values, axes, and annotations available without burying the visual model.

NASA Eyes and Stellarium-style spatial sims:
- Treat time as a first-class control: play, pause, speed, step, jump to event.
- Let users navigate space with a camera but keep orientation aids visible.
- Use real data when the value is inspection or trust, and label assumptions when using simplified models.

BioDigital and Mol*-style anatomy/molecule viewers:
- Use layers, isolate/hide, labels, selections, and guided tours for complex 3D structures.
- Give users a way back to a known view after orbiting or zooming.
- Pair 3D interaction with annotations, not paragraphs floating over the scene.

Nicky Case and Explorable Explanations:
- Teach systems, models, networks, and cause-effect by letting users manipulate the causes.
- Start small, build up mechanics, then combine them into the full system.
- Use playful feedback, but keep the model legible.
- Favor "learn by doing" over passive explanation.

TensorFlow Playground-style model sims:
- Expose hyperparameters as direct controls.
- Show intermediate state and output side by side.
- Use presets for known interesting cases, then let users mutate them.

WebGL fluid/water-style demos:
- Direct touch or pointer input matters more than a large control surface.
- High visual feedback can teach intuition, but add readouts or overlays when the goal is conceptual learning.

## Interaction Patterns

- Direct handle: drag a mass, charge, planet, control point, lens, wave source, or node.
- Probe tool: hover/click to show local value, field vector, slope, concentration, speed, or class probability.
- Time control: pause, play, step, speed slider, rewind, or replay trace.
- Presets: use named scenarios for known interesting states.
- Compare: let users freeze a run, show traces, split views, ghost previous states, or plot multiple curves.
- Reveal toggles: vectors, grid, labels, energy, collisions, hidden state, uncertainty, or equations.
- Guided challenge: ask for a target state, then let users reach it in the sandbox.
- Reset and home: restore both model and camera.

## Learning Scaffolds

- Put the manipulable model first; use text as labels, prompts, and readouts.
- Introduce one variable at a time unless coupling is the point of the lesson.
- Use concise labels on controls: "gravity", "friction", "charge", "infection rate", "learning rate".
- Use concrete units when available.
- Show the graph or equation only when it changes in sync with the model.
- Label simplifications such as "2D approximation", "no air drag", or "elastic collisions".

## UI Patterns

- Keep the primary simulation visible while controls change.
- Use sliders for continuous quantities, toggles for binary overlays, segmented controls for modes, and buttons for commands.
- Avoid a marketing hero. The simulation is the hero.
- Keep panels compact. Do not put cards inside cards.
- Use stable aspect ratios and min/max sizes so controls and labels do not resize the stage unexpectedly.
- On mobile, put essential controls above or below the stage; avoid tiny sidebars.
- Preserve keyboard and touch access for core actions.

## Failure Modes

- Pretty animation with no meaningful variable to manipulate.
- Sliders whose effects are too subtle to notice.
- Model logic mixed into rendering until reset and presets are hard to implement.
- A canvas that looks good on desktop but collapses or overflows on mobile.
- Text explaining the answer instead of making the relationship discoverable.
- Too many variables before the user understands the first mechanic.
